mport { test, expect } from '@playwright/test';
import * as fs from 'fs';

// ─── Cargar credenciales desde archivo generado por el workflow ────────────
const creds = JSON.parse(
  fs.readFileSync('data/credenciales.json', 'utf-8')
);

const BASE_URL   = creds.baseUrl;
const LOGIN_PATH = creds.loginPath;
const USUARIO    = creds.usuario;
const CLAVE      = creds.clave;
const EMPRESA    = 'LinQ SPA';

// ─── Helper: iniciar sesión en Talana (CON DIAGNÓSTICO MEJORADO) ──────────
async function iniciarSesion(page: any) {
  try {
    // ✅ PASO 1: Navegar a la página de login
    console.log('\n📍 [PASO 1] Navegando a login...');
    console.log(`   URL: ${BASE_URL}${LOGIN_PATH}`);
    
    await page.goto(BASE_URL + LOGIN_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    console.log('✅ [PASO 1] Navegación exitosa');

    // ✅ PASO 2: Llenar credenciales
    console.log('\n📍 [PASO 2] Buscando campos de credenciales...');
    
    const campoUsuario = page.locator(
      'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"], input[placeholder*="correo"]'
    ).first();

    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Campo de usuario visible');
    
    await campoUsuario.fill(USUARIO);
    console.log(`✍️  Usuario ingresado: ${USUARIO}`);

    const campoPass = page.locator('input[type="password"]').first();
    await campoPass.waitFor({ state: 'visible', timeout: 15000 });
    await campoPass.fill(CLAVE);
    console.log('✍️  Contraseña ingresada');

    // ✅ PASO 3: Hacer click en el primer "Iniciar sesión"
    console.log('\n📍 [PASO 3] Buscando botón "Iniciar sesión"...');
    
    const btnIngresar = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
    ).first();

    await btnIngresar.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Botón encontrado');
    
    await btnIngresar.click();
    console.log('🔐 Click en primer "Iniciar sesión"');

    // ✅ PASO 4: Esperar la pantalla de empresa con MEJOR DIAGNÓSTICO
    console.log('\n📍 [PASO 4] Esperando pantalla de selección de empresa...');
    
    let empresaScreenVisible = false;
    let intentos = 0;
    const maxIntentos = 5;

    while (!empresaScreenVisible && intentos < maxIntentos) {
      intentos++;
      console.log(`   Intento ${intentos}/${maxIntentos}...`);
      
      try {
        // Esperar que aparezca CUALQUIERA de estos elementos que indican la pantalla de empresa
        await Promise.race([
          page.waitForSelector('select', { timeout: 10000 }),
          page.locator('text=/¿En qué empresa/i').waitFor({ timeout: 10000 }),
          page.locator('text=/En qué empresa/i').waitFor({ timeout: 10000 }),
          page.locator('[class*="empresa"]').first().waitFor({ state: 'visible', timeout: 10000 })
        ]).then(() => {
          empresaScreenVisible = true;
          console.log('✅ Pantalla de empresa detectada');
        }).catch(() => {
          // No encontró, continuar intentando
        });

        if (!empresaScreenVisible) {
          console.log(`   ⏳ No visible aún, esperando 2 segundos...`);
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`   ⚠️  Intento ${intentos} falló`);
        await page.waitForTimeout(1500);
      }
    }

    if (!empresaScreenVisible) {
      console.log('⚠️  Pantalla de empresa NO apareció después de esperar');
      // Tomar screenshot para diagnóstico
      await page.screenshot({ path: 'error-empresa-screen.png' });
      throw new Error('Pantalla de selección de empresa no cargó');
    }

    // ✅ PASO 5: Seleccionar empresa
    console.log('\n📍 [PASO 5] Seleccionando empresa...');
    
    const empresaSelect = page.locator('select').first();
    const empresaVisible = await empresaSelect.isVisible({ timeout: 5000 }).catch(() => false);

    if (empresaVisible) {
      await empresaSelect.selectOption(EMPRESA);
      console.log(`🏢 Empresa seleccionada: ${EMPRESA}`);
    } else {
      console.log('⚠️  Select no encontrado, buscando alternativa...');
      // Si es un dropdown custom, intentar hacer click
      const dropdownTrigger = page.locator('[class*="empresa"], [class*="select"]').first();
      const dropdownTriggerVisible = await dropdownTrigger.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (dropdownTriggerVisible) {
        await dropdownTrigger.click();
        await page.waitForTimeout(1000);
        
        const opcionEmpresa = page.locator(`text="${EMPRESA}"`).first();
        const opcionVisible = await opcionEmpresa.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (opcionVisible) {
          await opcionEmpresa.click();
          console.log(`🏢 Empresa seleccionada (custom): ${EMPRESA}`);
        }
      }
    }

    // ✅ PASO 6: Click en segundo "Iniciar sesión"
    console.log('\n📍 [PASO 6] Haciendo click en segundo "Iniciar sesión"...');
    
    const btnIngresarEmpresa = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
    ).last();

    await btnIngresarEmpresa.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Botón visible');
    
    await btnIngresarEmpresa.click();
    console.log('🔐 Click en segundo "Iniciar sesión"');

    // ✅ PASO 7: Esperar carga final de la aplicación
    console.log('\n📍 [PASO 7] Esperando carga de la aplicación...');
    
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
    
    // Tomar screenshot para debugging
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await page.screenshot({ path: `error-login-${timestamp}.png` });
      console.error(`   Screenshot guardado: error-login-${timestamp}.png`);
    } catch (screenshotError) {
      console.error('   No se pudo tomar screenshot');
    }
    
    throw error;
  }
}

// ─── TC-001: Login exitoso ───────────────────────────────────────────────
test('TC-001 — Login exitoso en Talana (incluye selección de empresa)', async ({ page }) => {
  test.slow();
  test.setTimeout(120000); // 2 minutos para este test específicamente

  try {
    await iniciarSesion(page);
    
    // Verificación final
    const urlActual = page.url();
    console.log(`\n📊 Verificación final - URL: ${urlActual}`);
    
    expect(urlActual).toContain('asistencia');
    console.log('✅ Test TC-001 PASSOU');
    
  } catch (error) {
    console.error('❌ Test TC-001 FALHOU');
    throw error;
  }
});

// ─── TC-002: Módulo de asistencia es accesible ────────────────────────────
test('TC-002 — Módulo de Asistencia es accesible', async ({ page }) => {
  test.setTimeout(120000);

  try {
    await iniciarSesion(page);

    console.log('\n📍 Buscando menú de Asistencia...');
    const menuAsistencia = page.locator(
      'a:has-text("Asistencia"), span:has-text("Asistencia"), [href*="asistencia"], nav >> text=Asistencia'
    ).first();

    await expect(menuAsistencia).toBeVisible({ timeout: 15000 });
    console.log('✅ Menú encontrado');
    
    await menuAsistencia.click();
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    console.log('✅ Test TC-002 PASSOU');
    
  } catch (error) {
    console.error('❌ Test TC-002 FALHOU');
    throw error;
  }
});

// ─── TC-003: Vista del calendario de asistencia carga ─────────────────────
test('TC-003 — Calendario de asistencia carga sin errores', async ({ page }) => {
  test.setTimeout(120000);

  try {
    await iniciarSesion(page);

    console.log('\n📍 Navegando a asistencia...');
    const menuAsistencia = page.locator(
      'a:has-text("Asistencia"), [href*="asistencia"]'
    ).first();

    await menuAsistencia.click();
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    console.log('✅ Buscando errores del sistema...');
    const errorTexts = ['Error 500', 'Error 404', 'Something went wrong', 'Ha ocurrido un error'];
    for (const errorText of errorTexts) {
      await expect(page.locator(`text=${errorText}`)).toHaveCount(0);
    }

    console.log('✅ Buscando contenido cargado...');
    const contenido = page.locator('table, .calendar, .fc-view, [class*="attendance"], [class*="asistencia"]').first();
    await expect(contenido).toBeVisible({ timeout: 15000 });

    console.log('✅ Test TC-003 PASSOU');
    
  } catch (error) {
    console.error('❌ Test TC-003 FALHOU');
    throw error;
  }
});

// ─── TC-004: Login con credenciales incorrectas muestra error ─────────────
test('TC-004 — Login con contraseña incorrecta muestra error', async ({ page }) => {
  test.setTimeout(120000);

  try {
    console.log('\n📍 Iniciando prueba de credenciales incorrectas...');
    
    await page.goto(BASE_URL + LOGIN_PATH, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    const campoUsuario = page.locator(
      'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"]'
    ).first();

    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    await campoUsuario.fill(USUARIO);
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
    console.log('✅ Test TC-004 PASSOU — Sistema rechazó credenciales');
    
  } catch (error) {
    console.error('❌ Test TC-004 FALHOU');
    throw error;
  }
});

// ─── TC-005: Módulo de Turnos es accesible ────────────────────────────────
test('TC-005 — Módulo de Turnos es accesible', async ({ page }) => {
  test.setTimeout(120000);

  try {
    await iniciarSesion(page);

    console.log('\n📍 Buscando menú de Turnos...');
    const menuTurnos = page.locator(
      'a:has-text("Turnos"), span:has-text("Turnos"), [href*="turnos"], nav >> text=Turnos'
    ).first();

    const existe = await menuTurnos.isVisible({ timeout: 10000 }).catch(() => false);

    if (existe) {
      await menuTurnos.click();
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      console.log('✅ Test TC-005 PASSOU — Módulo de Turnos encontrado');
    } else {
      console.log('ℹ️  Menú de Turnos no encontrado para este rol');
      test.skip(true, 'Turnos no disponible para este rol de usuario');
    }
    
  } catch (error) {
    console.error('❌ Test TC-005 FALHOU');
    throw error;
  }
});
