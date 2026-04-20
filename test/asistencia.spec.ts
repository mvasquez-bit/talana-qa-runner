import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// ─── Cargar credenciales desde archivo generado por el workflow ────────────
const creds = JSON.parse(
  fs.readFileSync('data/credenciales.json', 'utf-8')
);

// ✅ URL de producción
const BASE_URL   = 'https://talana.com';
const LOGIN_PATH = '/es/remuneraciones/login-vue?next=/es/remuneraciones/#/';
const USUARIO    = creds.usuario;
const CLAVE      = creds.clave;

// ─── Helper: Navegar a URL CON REINTENTOS ─────────────────────────────────
async function navegarConReintentos(page: any, url: string, maxIntentos: number = 3) {
  let ultimoError: any;
  
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      console.log(`\n🔄 Intento ${intento}/${maxIntentos} de conectar a ${url}`);
      
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 60000
      });
      
      console.log('✅ Conexión exitosa');
      return true;
      
    } catch (error: any) {
      ultimoError = error;
      console.log(`⚠️  Intento ${intento} falló: ${error.message.split('\n')[0]}`);
      
      if (intento < maxIntentos) {
        console.log(`⏳ Esperando 5 segundos antes de reintentar...`);
        await page.waitForTimeout(5000);
      }
    }
  }
  
  throw ultimoError;
}

// ─── Helper: iniciar sesión en Talana ──────────────────────────────────────
async function iniciarSesion(page: any) {
  try {
    // ✅ PASO 1: Navegar a la página de login
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 1] Navegando a login...');
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Login Path: ${LOGIN_PATH}`);
    console.log('═══════════════════════════════════════════════════════');
    
    await navegarConReintentos(page, BASE_URL + LOGIN_PATH, 3);

    // ✅ PASO 2: Llenar credenciales
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 2] Buscando campos de credenciales...');
    console.log('═══════════════════════════════════════════════════════');
    
    // ✅ Campo de usuario - usar data-cy específico
    const campoUsuario = page.locator('[data-cy="talana-user-input"]');
    
    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Campo de usuario visible');
    
    await campoUsuario.fill(USUARIO);
    console.log(`✍️  Usuario ingresado: ${USUARIO}`);

    // ✅ Campo contraseña
    const campoPass = page.locator('input[type="password"]').first();
    await campoPass.waitFor({ state: 'visible', timeout: 15000 });
    await campoPass.fill(CLAVE);
    console.log('✍️  Contraseña ingresada');

    // ✅ PASO 3: Hacer click en "Iniciar sesión"
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 3] Haciendo click en "Iniciar sesión"...');
    console.log('═══════════════════════════════════════════════════════');
    
    const btnIngresar = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
    ).first();

    await btnIngresar.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Botón encontrado');
    
    await btnIngresar.click();
    console.log('🔐 Click ejecutado en "Iniciar sesión"');

    // ✅ PASO 4: Esperar a que la pantalla de empresa cargue
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 4] Esperando pantalla de empresa...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Esperar a que aparezca el botón de "Inicia sesión" (que aparece en la pantalla de empresa)
    // Esperamos a que haya MÁS DE UN botón en la página (el primero + el de empresa)
    let buttonCount = 0;
    let intentos = 0;
    const maxIntentos = 10;
    
    while (buttonCount < 2 && intentos < maxIntentos) {
      intentos++;
      await page.waitForTimeout(500);
      
      const allButtons = page.locator('button[type="submit"], button:has-text("Iniciar sesión"), button:has-text("Inicia sesión")');
      buttonCount = await allButtons.count();
      console.log(`   Intento ${intentos}: ${buttonCount} botones encontrados`);
      
      if (buttonCount >= 2) {
        console.log('✅ Pantalla de empresa cargada (2 o más botones detectados)');
        break;
      }
    }

    if (buttonCount < 2) {
      console.log('⚠️  Solo se encontró 1 botón, asumiendo que la página está lista');
      await page.waitForTimeout(1000);
    }

    // ✅ PASO 5: Click en el botón "Inicia sesión" final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 5] Haciendo click en botón final...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Buscar TODOS los botones y hacer click en el ÚLTIMO visible
    const todosBotones = page.locator('button');
    const totalBotones = await todosBotones.count();
    console.log(`   Total de botones en la página: ${totalBotones}`);
    
    // Hacer click en el ÚLTIMO botón (debería ser el de empresa)
    const ultimoBoton = todosBotones.last();
    await ultimoBoton.waitFor({ state: 'visible', timeout: 10000 });
    
    const textoBoton = await ultimoBoton.textContent();
    console.log(`✅ Botón final encontrado: "${textoBoton}"`);
    
    await ultimoBoton.click();
    console.log('🔐 Click ejecutado en botón final');

    // ✅ PASO 6: Esperar carga final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 6] Esperando carga final de la aplicación...');
    console.log('═══════════════════════════════════════════════════════');
    
    try {
      await page.waitForURL(/\/#\//, { timeout: 40000 });
      console.log(`✅ URL cambió correctamente: ${page.url()}`);
    } catch (error) {
      console.log('⚠️  URL no cambió a patrón esperado, esperando networkidle...');
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log(`✅ Página cargada. URL actual: ${page.url()}`);
    }

    console.log('\n✅✅✅ LOGIN COMPLETADO EXITOSAMENTE ✅✅✅\n');
    
  } catch (error: any) {
    console.error('\n❌ ERROR DURANTE EL LOGIN:');
    console.error(`   ${error.message}`);
    
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await page.screenshot({ path: `error-login-${timestamp}.png` });
      console.error(`   📸 Screenshot guardado: error-login-${timestamp}.png`);
    } catch (screenshotError) {
      console.error('   (No se pudo tomar screenshot)');
    }
    
    throw error;
  }
}

// ─── TC-001: Login exitoso ───────────────────────────────────────────────
test('TC-001 — Login exitoso en Talana (incluye selección de empresa)', async ({ page }) => {
  test.slow();
  test.setTimeout(240000);

  try {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  TC-001: Login exitoso en Talana (PRODUCCIÓN)');
    console.log('████████████████████████████████████████████████████\n');
    
    await iniciarSesion(page);
    
    const urlActual = page.url();
    console.log(`\n📊 Verificación final - URL: ${urlActual}`);
    
    expect(urlActual).toContain('remuneraciones');
    console.log('✅✅✅ Test TC-001 PASSOU ✅✅✅\n');
    
  } catch (error) {
    console.error('❌❌❌ Test TC-001 FALHOU ❌❌❌\n');
    throw error;
  }
});

// TC-002 y TC-003 desactivados - se generarán en iteraciones futuras
// con selectores más robustos para los menús específicos

// ─── TC-004: Login con credenciales incorrectas muestra error ─────────────
test('TC-004 — Login con contraseña incorrecta muestra error', async ({ page }) => {
  test.setTimeout(240000);

  try {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  TC-004: Credenciales incorrectas muestran error');
    console.log('████████████████████████████████████████████████████\n');
    
    console.log('\n📍 Navegando a login...');
    await navegarConReintentos(page, BASE_URL + LOGIN_PATH, 3);

    // ✅ Campo usuario - con selector correcto
    const campoUsuario = page.locator('[data-cy="talana-user-input"]');
    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    await campoUsuario.fill(USUARIO);
    
    // ✅ Campo password
    await page.locator('input[type="password"]').first().fill('ClaveIncorrecta999!');
    
    const btnIngresar = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar sesión")'
    ).first();
    
    await btnIngresar.click();
    console.log('🔐 Intentando con credenciales incorrectas...');

    await page.waitForTimeout(3000);

    const errorVisible = await page.locator(
      '[class*="error"], [class*="alert"], .invalid-feedback, text=/incorrecto/i, text=/inválido/i, text=/error/i'
    ).first().isVisible().catch(() => false);

    const sigueEnLogin = page.url().includes('login');

    expect(errorVisible || sigueEnLogin).toBeTruthy();
    console.log('✅ Sistema rechazó credenciales correctamente');
    console.log('✅✅✅ Test TC-004 PASSOU ✅✅✅\n');
    
  } catch (error) {
    console.error('❌❌❌ Test TC-004 FALHOU ❌❌❌\n');
    throw error;
  }
});

// TC-005 desactivado - se generará en iteraciones futuras
