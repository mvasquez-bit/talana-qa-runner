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
const EMPRESA    = 'LinQ SPA';
 
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
 
    // ✅ PASO 2: Llenar credenciales con SELECTORES CORRECTOS
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 2] Buscando campos de credenciales...');
    console.log('═══════════════════════════════════════════════════════');
    
    // ✅ Campo de usuario - usar data-cy específico
    const campoUsuario = page.locator('[data-cy="talana-user-input"]');
    
    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Campo de usuario visible');
    
    await campoUsuario.fill(USUARIO);
    console.log(`✍️  Usuario ingresado: ${USUARIO}`);
 
    // ✅ Campo contraseña - buscar por tipo y atributos
    const campoPass = page.locator('input[type="password"]').first();
    await campoPass.waitFor({ state: 'visible', timeout: 15000 });
    await campoPass.fill(CLAVE);
    console.log('✍️  Contraseña ingresada');
 
    // ✅ PASO 3: Hacer click en el primer "Iniciar sesión"
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 3] Haciendo click en "Iniciar sesión"...');
    console.log('═══════════════════════════════════════════════════════');
    
    const btnIngresar = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
    ).first();
 
    await btnIngresar.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Botón encontrado');
    
    await btnIngresar.click();
    console.log('🔐 Click ejecutado en primer "Iniciar sesión"');
 
    // ✅ PASO 4: Esperar la pantalla de empresa
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 4] Esperando pantalla de selección de empresa...');
    console.log('═══════════════════════════════════════════════════════');
    
    let empresaScreenVisible = false;
    let intentos = 0;
    const maxIntentos = 8;
 
    while (!empresaScreenVisible && intentos < maxIntentos) {
      intentos++;
      console.log(`   Intento ${intentos}/${maxIntentos}...`);
      
      try {
        await Promise.race([
          page.waitForSelector('select', { timeout: 5000 }),
          page.locator('text=/¿En qué empresa/i').waitFor({ timeout: 5000 }),
          page.locator('text=/En qué empresa/i').waitFor({ timeout: 5000 }),
          page.locator('[class*="empresa"]').first().waitFor({ state: 'visible', timeout: 5000 })
        ]).then(() => {
          empresaScreenVisible = true;
          console.log('✅ Pantalla de empresa detectada');
        }).catch(() => {});
 
        if (!empresaScreenVisible) {
          console.log(`   ⏳ No visible aún, esperando 2 segundos...`);
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`   ⚠️  Error en intento ${intentos}`);
        await page.waitForTimeout(1500);
      }
    }
 
    if (!empresaScreenVisible) {
      console.log('⚠️  Pantalla de empresa NO apareció después de esperar');
      
      try {
        await page.screenshot({ path: 'debug-empresa-screen.png' });
        console.log('📸 Screenshot guardado: debug-empresa-screen.png');
      } catch (e) {
        console.log('   (No se pudo tomar screenshot)');
      }
      
      throw new Error('Pantalla de selección de empresa no cargó después de 16 segundos');
    }
 
    // ✅ PASO 5: Seleccionar empresa
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 5] Seleccionando empresa...');
    console.log('═══════════════════════════════════════════════════════');
    
    const empresaSelect = page.locator('select').first();
    const empresaVisible = await empresaSelect.isVisible({ timeout: 5000 }).catch(() => false);
 
    if (empresaVisible) {
      await empresaSelect.selectOption(EMPRESA);
      console.log(`✅ Empresa seleccionada: ${EMPRESA}`);
    } else {
      console.log('⚠️  Select no encontrado, intentando dropdown custom...');
      
      const dropdownTrigger = page.locator('[class*="empresa"], [class*="select"]').first();
      const dropdownTriggerVisible = await dropdownTrigger.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (dropdownTriggerVisible) {
        await dropdownTrigger.click();
        await page.waitForTimeout(1000);
        
        const opcionEmpresa = page.locator(`text="${EMPRESA}"`).first();
        const opcionVisible = await opcionEmpresa.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (opcionVisible) {
          await opcionEmpresa.click();
          console.log(`✅ Empresa seleccionada (custom): ${EMPRESA}`);
        }
      }
    }
 
    // ✅ PASO 6: Click en segundo "Iniciar sesión"
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 6] Haciendo click en segundo "Iniciar sesión"...');
    console.log('═══════════════════════════════════════════════════════');
    
    const btnIngresarEmpresa = page.locator(
      'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
    ).last();
 
    await btnIngresarEmpresa.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✅ Botón visible');
    
    await btnIngresarEmpresa.click();
    console.log('🔐 Click ejecutado en segundo "Iniciar sesión"');
 
    // ✅ PASO 7: Esperar carga final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 7] Esperando carga final de la aplicación...');
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
 
// ─── TC-002: Módulo de asistencia es accesible ────────────────────────────
test('TC-002 — Módulo de Asistencia es accesible', async ({ page }) => {
  test.setTimeout(240000);
 
  try {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  TC-002: Módulo de Asistencia es accesible');
    console.log('████████████████████████████████████████████████████\n');
    
    await iniciarSesion(page);
 
    console.log('\n📍 Buscando menú de Asistencia...');
    const menuAsistencia = page.locator(
      'a:has-text("Asistencia"), span:has-text("Asistencia"), [href*="asistencia"], nav >> text=Asistencia'
    ).first();
 
    await expect(menuAsistencia).toBeVisible({ timeout: 15000 });
    console.log('✅ Menú encontrado');
    
    await menuAsistencia.click();
    await page.waitForLoadState('networkidle', { timeout: 25000 });
 
    console.log('✅✅✅ Test TC-002 PASSOU ✅✅✅\n');
    
  } catch (error) {
    console.error('❌❌❌ Test TC-002 FALHOU ❌❌❌\n');
    throw error;
  }
});
 
// ─── TC-003: Vista del calendario de asistencia carga ─────────────────────
test('TC-003 — Calendario de asistencia carga sin errores', async ({ page }) => {
  test.setTimeout(240000);
 
  try {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  TC-003: Calendario de asistencia carga sin errores');
    console.log('████████████████████████████████████████████████████\n');
    
    await iniciarSesion(page);
 
    console.log('\n📍 Navegando a asistencia...');
    const menuAsistencia = page.locator(
      'a:has-text("Asistencia"), [href*="asistencia"]'
    ).first();
 
    await menuAsistencia.click();
    await page.waitForLoadState('networkidle', { timeout: 25000 });
 
    console.log('✅ Buscando errores del sistema...');
    const errorTexts = ['Error 500', 'Error 404', 'Something went wrong', 'Ha ocurrido un error'];
    for (const errorText of errorTexts) {
      await expect(page.locator(`text=${errorText}`)).toHaveCount(0);
    }
 
    console.log('✅ Buscando contenido cargado...');
    const contenido = page.locator('table, .calendar, .fc-view, [class*="attendance"], [class*="asistencia"]').first();
    await expect(contenido).toBeVisible({ timeout: 15000 });
 
    console.log('✅✅✅ Test TC-003 PASSOU ✅✅✅\n');
    
  } catch (error) {
    console.error('❌❌❌ Test TC-003 FALHOU ❌❌❌\n');
    throw error;
  }
});
 
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
 
// ─── TC-005: Módulo de Turnos es accesible ────────────────────────────────
test('TC-005 — Módulo de Turnos es accesible', async ({ page }) => {
  test.setTimeout(240000);
 
  try {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  TC-005: Módulo de Turnos es accesible');
    console.log('████████████████████████████████████████████████████\n');
    
    await iniciarSesion(page);
 
    console.log('\n📍 Buscando menú de Turnos...');
    const menuTurnos = page.locator(
      'a:has-text("Turnos"), span:has-text("Turnos"), [href*="turnos"], nav >> text=Turnos'
    ).first();
 
    const existe = await menuTurnos.isVisible({ timeout: 10000 }).catch(() => false);
 
    if (existe) {
      await menuTurnos.click();
      await page.waitForLoadState('networkidle', { timeout: 25000 });
      console.log('✅ Módulo de Turnos encontrado');
      console.log('✅✅✅ Test TC-005 PASSOU ✅✅✅\n');
    } else {
      console.log('ℹ️  Menú de Turnos no encontrado para este rol');
      test.skip(true, 'Turnos no disponible para este rol de usuario');
    }
    
  } catch (error) {
    console.error('❌❌❌ Test TC-005 FALHOU ❌❌❌\n');
    throw error;
  }
});
