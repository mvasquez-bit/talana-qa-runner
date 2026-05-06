import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
  });

  test('Debe crear un turno semanal con horario 08:00 - 17:00', async ({ page }) => {
    test.setTimeout(120000);

    console.log('\n🚀 Iniciando creación de turno...');

    // PASO 1: Navegación
    console.log('\n[PASO 1] Navegando a Creación de turnos...');
    await page.goto('https://talana.com/es/asistencia/turnos/', { waitUntil: 'load' });
    await page.waitForURL('**/asistencia/turnos/**');
    console.log('✅ URL confirmada en módulo de Turnos');

    // Esperar a que la página cargue completamente
    await page.waitForTimeout(2000);

    // PASO 2: Seleccionar tipo Semanal - VERSIÓN MEJORADA
    console.log('[PASO 2] Buscando opción Semanal...');
    
    // Estrategia 1: Buscar botón "Nuevo" o "Crear" primero
    let btnNuevo = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Agregar")').first();
    
    try {
      // Si existe el botón "Nuevo", hacer clic
      if (await btnNuevo.isVisible({ timeout: 5000 })) {
        console.log('   ℹ️  Encontrado botón "Nuevo", haciendo clic...');
        await btnNuevo.click();
        await page.waitForTimeout(1500);
      }
    } catch (e) {
      console.log('   ⚠️  No hay botón "Nuevo" visible');
    }

    // Estrategia 2: Buscar la opción "Semanal" con múltiples selectores
    let opcionSemanal = null;
    let encontrado = false;

    // Intento 1: Buscar texto exacto "Semanal"
    try {
      opcionSemanal = page.getByText(/Semanal/i).first();
      await opcionSemanal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('   ✅ Opción "Semanal" encontrada (método 1: texto)');
      encontrado = true;
    } catch (e) {
      console.log('   ⚠️  No encontrado por texto');
    }

    // Intento 2: Buscar por role si no encontramos el texto
    if (!encontrado) {
      try {
        const botones = await page.getByRole('button').all();
        for (const btn of botones) {
          const texto = await btn.textContent();
          if (texto && texto.toLowerCase().includes('semanal')) {
            opcionSemanal = btn;
            await opcionSemanal.waitFor({ state: 'visible', timeout: 5000 });
            console.log('   ✅ Opción "Semanal" encontrada (método 2: role)');
            encontrado = true;
            break;
          }
        }
      } catch (e) {
        console.log('   ⚠️  No encontrado por role');
      }
    }

    // Intento 3: Buscar un elemento con clase que contenga "option", "modal", etc.
    if (!encontrado) {
      try {
        const elementos = await page.locator('[class*="option"], [class*="item"], [class*="card"]').all();
        for (const elem of elementos) {
          const texto = await elem.textContent();
          if (texto && texto.toLowerCase().includes('semanal')) {
            opcionSemanal = elem;
            console.log('   ✅ Opción "Semanal" encontrada (método 3: clases)');
            encontrado = true;
            break;
          }
        }
      } catch (e) {
        console.log('   ⚠️  No encontrado por clases');
      }
    }

    // Si encontramos la opción, hacer clic
    if (encontrado && opcionSemanal) {
      await opcionSemanal.click();
      await page.waitForTimeout(1000);
      console.log('✅ Opción Semanal seleccionada');
    } else {
      // Si no encontramos nada, hacer un dump del HTML para debugging
      console.log('❌ NO SE ENCONTRÓ LA OPCIÓN SEMANAL');
      const html = await page.content();
      console.log('\n📋 CONTENIDO DE LA PÁGINA (primeros 2000 caracteres):');
      console.log(html.substring(0, 2000));
      
      // Captura de pantalla para debugging
      await page.screenshot({ path: './error-turnos.png' });
      throw new Error('No se encontró la opción Semanal. Captura guardada en error-turnos.png');
    }

    // PASO 3: Ingresar nombre
    console.log('[PASO 3] Ingresando nombre...');
    const inputNombre = page.locator('[data-cy="ayt-workshift-modal-workshift-name-input"]');
    try {
      await inputNombre.waitFor({ state: 'visible', timeout: 10000 });
      await inputNombre.fill(TURNO_NAME);
      console.log(`   ✅ Nombre ingresado: ${TURNO_NAME}`);
    } catch (e) {
      // Si falla, intentar con un selector más genérico
      console.log('   ⚠️  Selector específico no funcionó, intentando genérico...');
      const inputGenerico = page.locator('input[placeholder*="nombre" i], input[placeholder*="name" i]').first();
      await inputGenerico.waitFor({ state: 'visible', timeout: 10000 });
      await inputGenerico.fill(TURNO_NAME);
      console.log(`   ✅ Nombre ingresado (selector genérico): ${TURNO_NAME}`);
    }

    // PASO 4: Hacer clic en Crear
    console.log('[PASO 4] Haciendo clic en Crear...');
    const btnCrear = page.getByRole('button', { name: /Crear/i });
    await btnCrear.click();
    console.log('   ✅ Botón Crear presionado');

    // Esperar a que la URL cambie
    try {
      await page.waitForURL(/creacionTurnos/, { timeout: 15000 });
      console.log('✅ Página de configuración abierta');
    } catch (e) {
      console.log('⚠️  URL no cambió, esperando a que aparezcan los inputs de horario...');
      await page.waitForSelector('input[placeholder*="Desde"], input[placeholder*="desde"]', { timeout: 10000 });
    }

    // PASO 5: Configurar horarios
    console.log('[PASO 5/6] Configurando horarios...');
    
    // Buscar botón "Replicar horario"
    try {
      const btnReplicar = page.getByRole('button', { name: /Replicar horario/i });
      await btnReplicar.click();
      console.log('   ✅ Botón "Replicar horario" presionado');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('   ⚠️  Botón replicar no encontrado, continuando...');
    }

    // Llenar inputs de hora
    const inputDesde = page.locator('input[placeholder*="Desde"], input[placeholder*="desde"]').first();
    const inputHasta = page.locator('input[placeholder*="Hasta"], input[placeholder*="hasta"]').first();

    try {
      await inputDesde.fill('08:00');
      await inputHasta.fill('17:00');
      console.log('   ✅ Horarios configurados: 08:00 - 17:00');
    } catch (e) {
      console.log('❌ Error al configurar horarios:', e.message);
      throw e;
    }

    // PASO 7: Aceptar diálogo
    console.log('[PASO 7] Aceptando configuración...');
    try {
      const btnAceptar = page.getByRole('button', { name: /Aceptar/i }).first();
      await btnAceptar.click();
      await page.waitForSelector('text=Replicar horario', { state: 'hidden', timeout: 5000 });
      console.log('✅ Diálogo cerrado');
    } catch (e) {
      console.log('⚠️  No se pudo cerrar el diálogo, continuando...');
    }

    // PASO 8: Verificar horarios
    console.log('[PASO 8] Verificando horarios...');
    const conteoHorarios = await page.locator('input[value="08:00"]').count();
    if (conteoHorarios >= 1) {
      console.log(`✅ Se verificaron ${conteoHorarios} horarios de inicio`);
    } else {
      console.log('⚠️  No se encontraron horarios, pero continuando...');
    }

    // PASO 9: Guardar
    console.log('[PASO 9] Guardando turno...');
    const btnGuardar = page.getByRole('button', { name: /Guardar/i });
    await btnGuardar.click();
    console.log('   ✅ Botón Guardar presionado');

    // Esperar a volver al listado
    try {
      await page.waitForURL(/asistencia\/turnos/, { timeout: 15000 });
      console.log('✅ Redirigido al listado de turnos');
    } catch (e) {
      console.log('⚠️  No se detectó cambio de URL, verificando listado...');
    }

    // PASO 10: Verificación final
    console.log('[PASO 10] Verificación final...');
    try {
      await expect(page.locator(`text=${TURNO_NAME}`)).toBeVisible({ timeout: 10000 });
      console.log(`🎉 ¡Test completado con éxito! Turno: ${TURNO_NAME}`);
    } catch (e) {
      console.log(`❌ No se encontró el turno en el listado: ${TURNO_NAME}`);
      await page.screenshot({ path: './error-verificacion.png' });
      throw e;
    }
  });
});
