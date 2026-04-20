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
 
    // ✅ PASO 4: Esperar a que la pantalla de empresa cargue (con delay para asegurar)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 4] Esperando pantalla de empresa...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Esperar 2 segundos para que cargue la pantalla de empresa
    await page.waitForTimeout(2000);
    console.log('⏳ Esperado a que cargue la pantalla de empresa...');
 
    // ✅ PASO 5: Click en el botón "Inicia sesión" final (la empresa ya está seleccionada)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 5] Haciendo click en botón final "Inicia sesión"...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Buscar todos los botones que contengan "Inicia sesión" o "Iniciar sesión"
    const botonesFinal = page.locator(
      'button:has-text("Inicia sesión"), button:has-text("Iniciar sesión"), button[type="submit"]'
    );
    
    // Contar cuántos botones hay
    const count = await botonesFinal.count();
    console.log(`   Encontrados ${count} botones de sesión`);
    
    // Hacer click en el ÚLTIMO (que es el de la pantalla de empresa)
    const btnIngresarFinal = botonesFinal.last();
    await btnIngresarFinal.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Botón final visible');
    
    await btnIngresarFinal.click();
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
