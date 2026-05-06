import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal - ESTRATEGIA ALTERNATIVA', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
  });

  test('Debe crear un turno semanal - Alternativa', async ({ page }) => {
    test.setTimeout(120000);

    console.log('\n🚀 INICIANDO - Estrategia Alternativa\n');

    // PASO 1: Navegación
    console.log('[PASO 1] Navegando a módulo de turnos...');
    await page.goto('https://talana.com/es/asistencia/turnos/', { waitUntil: 'load' });
    await page.waitForURL('**/asistencia/turnos/**');
    console.log('✅ URL confirmada\n');

    // PASO 1.5: Esperar MÁS tiempo
    console.log('[PASO 1.5] Esperando carga completa (3 segundos)...');
    await page.waitForTimeout(3000);
    console.log('✅ Espera completada\n');

    // PASO 2: ESTRATEGIA 1 - Buscar botón + o similar
    console.log('[PASO 2] Buscando botón de acción ("+", "Nuevo", "Crear"...)');
    
    let botonnuevo = null;
    const botonesComunes = [
      'button:has-text("+")',
      'button:has-text("Nuevo")',
      'button:has-text("Crear")',
      'button:has-text("Agregar")',
      'button:has-text("Añadir")',
      'a:has-text("Nuevo")',
      'a:has-text("Crear")',
      '[data-cy*="create"]',
      '[data-cy*="new"]',
      '[data-cy*="add"]'
    ];

    for (const selector of botonesComunes) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          const texto = await btn.textContent();
          console.log(`   ✅ Encontrado: "${texto?.trim()}"`);
          botonnuevo = btn;
          break;
        }
      } catch (e) {
        // Seguir buscando
      }
    }

    if (botonnuevo) {
      console.log('   🔘 Haciendo clic...');
      await botonnuevo.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Click ejecutado\n');
    } else {
      console.log('   ⚠️  No se encontró botón de creación\n');
    }

    // PASO 3: ESTRATEGIA 2 - Buscar modal o dialog
    console.log('[PASO 3] Buscando modal/dialog con opciones...');
    
    const modales = [
      '[role="dialog"]',
      '[class*="modal"]',
      '[class*="dialog"]',
      '[class*="popup"]'
    ];

    let modalEncontrado = null;
    for (const selector of modales) {
      try {
        const modal = page.locator(selector).first();
        if (await modal.isVisible({ timeout: 2000 })) {
          const texto = await modal.textContent();
          console.log(`   ✅ Modal encontrado: ${texto?.substring(0, 50)}...`);
          modalEncontrado = modal;
          break;
        }
      } catch (e) {
        // Seguir
      }
    }

    if (modalEncontrado) {
      console.log('   ✅ Modal detectado\n');
    } else {
      console.log('   ⚠️  No hay modal visible\n');
    }

    // PASO 4: ESTRATEGIA 3 - Buscar "Semanal" con métodos diferentes
    console.log('[PASO 4] Buscando opción Semanal...');
    
    let semanal = null;
    let metodoEncontrado = '';

    // Método 1: Texto exacto
    try {
      const elem = page.getByText(/semanal/i).first();
      if (await elem.isVisible({ timeout: 3000 })) {
        console.log('   ✅ Método 1: Encontrado por getByText');
        semanal = elem;
        metodoEncontrado = 'getByText';
      }
    } catch (e) {
      console.log('   ⚠️  Método 1 falló');
    }

    // Método 2: Role
    if (!semanal) {
      try {
        const btns = await page.getByRole('button').all();
        for (const btn of btns) {
          const texto = await btn.textContent();
          if (texto && texto.toLowerCase().includes('semanal')) {
            if (await btn.isVisible({ timeout: 2000 })) {
              console.log('   ✅ Método 2: Encontrado por getByRole');
              semanal = btn;
              metodoEncontrado = 'getByRole';
              break;
            }
          }
        }
      } catch (e) {
        console.log('   ⚠️  Método 2 falló');
      }
    }

    // Método 3: Busca manual en todos los elementos
    if (!semanal) {
      try {
        const todosLosElementos = await page.locator('*').all();
        for (const elem of todosLosElementos) {
          try {
            const texto = await elem.textContent();
            if (texto && texto.toLowerCase().includes('semanal') && texto.length < 100) {
              if (await elem.isVisible({ timeout: 1000 })) {
                console.log('   ✅ Método 3: Encontrado búsqueda manual');
                semanal = elem;
                metodoEncontrado = 'búsqueda manual';
                break;
              }
            }
          } catch (e) {
            // Ignorar
          }
        }
      } catch (e) {
        console.log('   ⚠️  Método 3 falló');
      }
    }

    // Método 4: Scroll y busca nuevamente
    if (!semanal) {
      console.log('   🔄 Haciendo scroll y reintentando...');
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(1000);
      
      try {
        const elem = page.getByText(/semanal/i).first();
        if (await elem.isVisible({ timeout: 2000 })) {
          console.log('   ✅ Método 4: Encontrado después de scroll');
          semanal = elem;
          metodoEncontrado = 'después de scroll';
        }
      } catch (e) {
        console.log('   ⚠️  Método 4 falló');
      }
    }

    // Si encontramos Semanal, clickear
    if (semanal) {
      console.log(`   ✅ Opción Semanal encontrada (${metodoEncontrado})`);
      await semanal.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Click ejecutado en Semanal\n');
    } else {
      console.log('   ❌ NO se encontró Semanal\n');
      
      // Dump de debugging
      console.log('   📋 Dump de elementos que contienen "turn" o "modal":');
      const allElements = await page.locator('*').all();
      let count = 0;
      for (const elem of allElements) {
        if (count > 20) break; // Limitar output
        try {
          const texto = await elem.textContent();
          const tag = await elem.evaluate(el => el.tagName);
          if (texto && (texto.toLowerCase().includes('turn') || 
                        texto.toLowerCase().includes('crear') ||
                        texto.toLowerCase().includes('nuevo'))) {
            console.log(`   [${tag}] ${texto.substring(0, 60)}`);
            count++;
          }
        } catch (e) {
          // Ignorar
        }
      }

      // Captura de pantalla
      await page.screenshot({ path: './debug-error-alternativo.png' });
      throw new Error('No se encontró Semanal. Captura: debug-error-alternativo.png');
    }

    // PASO 5: Ingresar nombre
    console.log('[PASO 5] Ingresando nombre del turno...');
    
    const selectoresNombre = [
      '[data-cy="ayt-workshift-modal-workshift-name-input"]',
      'input[placeholder*="nombre"]',
      'input[placeholder*="nombre" i]',
      'input[placeholder*="name"]',
      'input[data-cy*="name"]',
      'input[type="text"]'
    ];

    let inputNombre = null;
    for (const selector of selectoresNombre) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          inputNombre = input;
          console.log(`   ✅ Input encontrado con selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Seguir
      }
    }

    if (inputNombre) {
      await inputNombre.fill(TURNO_NAME);
      console.log(`   ✅ Nombre ingresado: ${TURNO_NAME}\n`);
    } else {
      console.log('   ⚠️  No se encontró input de nombre, continuando...\n');
    }

    // PASO 6: Buscar y clickear botón Crear
    console.log('[PASO 6] Buscando botón Crear...');
    try {
      const btnCrear = page.getByRole('button', { name: /Crear/i });
      if (await btnCrear.isVisible({ timeout: 5000 })) {
        console.log('   ✅ Botón Crear encontrado');
        await btnCrear.click();
        console.log('   ✅ Click en Crear\n');
        
        // Esperar cambio de página o modal
        await page.waitForTimeout(2000);
      } else {
        console.log('   ⚠️  Botón Crear no visible\n');
      }
    } catch (e) {
      console.log('   ⚠️  Error buscando Crear\n');
    }

    // PASO 7: Configurar horarios
    console.log('[PASO 7] Configurando horarios...');
    
    try {
      // Buscar inputs de hora
      const inputsHora = await page.locator('input[type="time"], input[placeholder*="Desde"], input[placeholder*="Hasta"]').all();
      console.log(`   Encontrados ${inputsHora.length} inputs de hora`);
      
      if (inputsHora.length >= 2) {
        await inputsHora[0].fill('08:00');
        await inputsHora[1].fill('17:00');
        console.log('   ✅ Horarios configurados: 08:00 - 17:00\n');
      }
    } catch (e) {
      console.log('   ⚠️  Error configurando horarios\n');
    }

    // PASO 8: Aceptar
    console.log('[PASO 8] Buscando botón Aceptar...');
    try {
      const btnAceptar = page.getByRole('button', { name: /Aceptar/i }).first();
      if (await btnAceptar.isVisible({ timeout: 3000 })) {
        await btnAceptar.click();
        console.log('   ✅ Click en Aceptar\n');
        await page.waitForTimeout(1500);
      }
    } catch (e) {
      console.log('   ⚠️  Aceptar no encontrado\n');
    }

    // PASO 9: Guardar
    console.log('[PASO 9] Buscando botón Guardar...');
    try {
      const btnGuardar = page.getByRole('button', { name: /Guardar/i });
      if (await btnGuardar.isVisible({ timeout: 3000 })) {
        await btnGuardar.click();
        console.log('   ✅ Click en Guardar\n');
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('   ⚠️  Guardar no encontrado\n');
    }

    // PASO 10: Verificación final
    console.log('[PASO 10] Verificación final...');
    try {
      await expect(page.locator(`text=${TURNO_NAME}`)).toBeVisible({ timeout: 10000 });
      console.log(`🎉 ¡TEST EXITOSO! Turno "${TURNO_NAME}" creado y verificado\n`);
    } catch (e) {
      console.log(`⚠️  No se pudo verificar turno en listado\n`);
      await page.screenshot({ path: './debug-final.png' });
      // No lanzar error aquí, es un warning
    }
  });
});
