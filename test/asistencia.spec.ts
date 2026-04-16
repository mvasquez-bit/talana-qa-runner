import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// ─── Cargar credenciales desde archivo generado por el workflow ────────────
const creds = JSON.parse(
  fs.readFileSync('data/credenciales.json', 'utf-8')
);

const BASE_URL   = creds.baseUrl;
const LOGIN_PATH = creds.loginPath;
const USUARIO    = creds.usuario;
const CLAVE      = creds.clave;
const EMPRESA    = 'LinQ SPA'; // ← CAMBIAR SI ES NECESARIO (ej: "Empresa para Capacitación")

// ─── Helper: iniciar sesión en Talana (CON FLUJO DE DOS PASOS) ──────────────
async function iniciarSesion(page: any) {
  // ✅ PASO 1: Navegar a la página de login
  // Usar 'domcontentloaded' en lugar de 'networkidle' para evitar timeouts
  await page.goto(BASE_URL + LOGIN_PATH, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });

  console.log('📍 Navegó a página de login');

  // ✅ PASO 2: Llenar credenciales (PRIMERA PANTALLA)
  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"], input[placeholder*="correo"]'
  ).first();

  await campoUsuario.waitFor({ state: 'visible', timeout: 15000 });
  await campoUsuario.fill(USUARIO);
  console.log('✍️  Usuario ingresado:', USUARIO);

  // Campo contraseña
  const campoPass = page.locator('input[type="password"]').first();
  await campoPass.waitFor({ state: 'visible', timeout: 10000 });
  await campoPass.fill(CLAVE);
  console.log('✍️  Contraseña ingresada');

  // ✅ PASO 3: Hacer click en el botón "Iniciar sesión" (PRIMERA VEZ)
  const btnIngresar = page.locator(
    'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
  ).first();

  await btnIngresar.waitFor({ state: 'visible', timeout: 10000 });
  await btnIngresar.click();
  console.log('🔐 Click en primer "Iniciar sesión"');

  // ✅ PASO 4: ESPERAR la pantalla de selección de empresa
  // Esto es IMPORTANTE - esperamos a que aparezca el dropdown o el título de empresa
  await page.waitForSelector(
    'select, [class*="empresa"], text=/¿En qué empresa/i',
    { timeout: 15000 }
  ).catch(() => {
    console.log('⚠️  Dropdown de empresa no encontrado inmediatamente, esperando...');
  });

  // Pequeño delay para asegurar que todo está cargado
  await page.waitForTimeout(1000);
  console.log('📍 Pantalla de selección de empresa cargada');

  // ✅ PASO 5: Seleccionar empresa del dropdown
  const empresaSelect = page.locator('select').first();

  try {
    await empresaSelect.waitFor({ state: 'visible', timeout: 10000 });
    await empresaSelect.selectOption(EMPRESA);
    console.log('🏢 Empresa seleccionada:', EMPRESA);
  } catch (error) {
    console.log('⚠️  Dropdown select no encontrado, intentando con selectores alternativos...');
    
    // Si no es un <select>, podría ser un dropdown custom
    const dropdownBtn = page.locator('[class*="empresa"], [class*="company"]').first();
    const empresaOption = page.locator(`text=${EMPRESA}`);
    
    const dropdownExists = await dropdownBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (dropdownExists) {
      await dropdownBtn.click();
      await empresaOption.click();
      console.log('🏢 Empresa seleccionada (dropdown custom):', EMPRESA);
    }
  }

  // ✅ PASO 6: Click en el botón "Iniciar sesión" (SEGUNDA VEZ)
  const btnIngresarEmpresa = page.locator(
    'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar sesión")'
  ).last(); // Usar .last() para el segundo botón

  await btnIngresarEmpresa.waitFor({ state: 'visible', timeout: 10000 });
  await btnIngresarEmpresa.click();
  console.log('🔐 Click en segundo "Iniciar sesión" (empresa seleccionada)');

  // ✅ PASO 7: ESPERAR a que cargue la aplicación final
  // Esperar a que la URL cambie a la aplicación principal
  await page.waitForURL(/\/#\//, { timeout: 25000 }).catch(async () => {
    console.log('⚠️  URL no cambió a esperada, verificando carga...');
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  });

  console.log('✅ Login completado - URL actual:', page.url());
}

// ─── TC-001: Login exitoso (CON SELECCIÓN DE EMPRESA) ──────────────────────
test('TC-001 — Login exitoso en Talana (incluye selección de empresa)', async ({ page }) => {
  test.slow(); // Marca el test como potencialmente lento

  // ✅ PASO 1: Navegar a login
  await page.goto(BASE_URL + LOGIN_PATH, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });

  console.log('📍 Navegó a página de login');

  // ✅ PASO 2: Buscar campo de usuario
  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"]'
  ).first();

  await expect(campoUsuario).toBeVisible({ timeout: 15000 });
  console.log('✅ Campo de usuario visible');

  // ✅ PASO 3: Llenar usuario y contraseña
  await campoUsuario.fill(USUARIO);
  await page.locator('input[type="password"]').first().fill(CLAVE);
  console.log('✍️  Credenciales ingresadas');

  // ✅ PASO 4: Click en primer "Iniciar sesión"
  await page.locator(
    'button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar sesión")'
  ).first().click();

  console.log('🔐 Click en primer "Iniciar sesión"');

  // ✅ PASO 5: Esperar pantalla de empresa
  await page.waitForTimeout(2000); // Small delay para que cargue
  console.log('📍 Esperando pantalla de selección de empresa...');

  // ✅ PASO 6: Seleccionar empresa
  const empresaSelect = page.locator('select').first();
  await empresaSelect.selectOption(EMPRESA);
  console.log('🏢 Empresa seleccionada:', EMPRESA);

  // ✅ PASO 7: Click en segundo "Iniciar sesión"
  await page.locator(
    'button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar sesión")'
  ).last().click();

  console.log('🔐 Click en segundo "Iniciar sesión"');

  // ✅ PASO 8: Verificar que estamos en el dashboard
  await expect(page).toHaveURL(/\/#\//, { timeout: 25000 });
  console.log('✅ Login exitoso — URL actual:', page.url());
});

// ─── TC-002: Módulo de asistencia es accesible ────────────────────────────
test('TC-002 — Módulo de Asistencia es accesible', async ({ page }) => {
  await iniciarSesion(page);

  // Buscar el menú de Asistencia
  const menuAsistencia = page.locator(
    'a:has-text("Asistencia"), span:has-text("Asistencia"), [href*="asistencia"], nav >> text=Asistencia'
  ).first();

  await expect(menuAsistencia).toBeVisible({ timeout: 15000 });
  console.log('📍 Menú de Asistencia encontrado');

  await menuAsistencia.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // Verificar que estamos en la sección correcta
  await expect(page.locator('h1, h2, .page-title, [class*="title"]').first())
    .toContainText(/asistencia/i, { timeout: 10000 });

  console.log('✓ Módulo de Asistencia encontrado y accesible');
});

// ─── TC-003: Vista del calendario de asistencia carga ─────────────────────
test('TC-003 — Calendario de asistencia carga sin errores', async ({ page }) => {
  await iniciarSesion(page);

  // Navegar a asistencia
  const menuAsistencia = page.locator(
    'a:has-text("Asistencia"), [href*="asistencia"]'
  ).first();

  await menuAsistencia.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // Verificar que no hay errores de sistema visibles
  const errorTexts = ['Error 500', 'Error 404', 'Something went wrong', 'Ha ocurrido un error'];
  for (const errorText of errorTexts) {
    await expect(page.locator(`text=${errorText}`)).toHaveCount(0);
  }

  // Verificar que hay contenido cargado
  const contenido = page.locator('table, .calendar, .fc-view, [class*="attendance"], [class*="asistencia"]').first();
  await expect(contenido).toBeVisible({ timeout: 15000 });

  console.log('✓ Calendario/vista de asistencia cargó correctamente');
});

// ─── TC-004: Login con credenciales incorrectas muestra error ─────────────
test('TC-004 — Login con contraseña incorrecta muestra error', async ({ page }) => {
  await page.goto(BASE_URL + LOGIN_PATH, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });

  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"]'
  ).first();

  await campoUsuario.waitFor({ state: 'visible', timeout: 15000 });
  await campoUsuario.fill(USUARIO);
  await page.locator('input[type="password"]').first().fill('ClaveIncorrecta999!');
  await page.locator('button[type="submit"], button:has-text("Ingresar")').first().click();

  // El sistema debe mostrar un mensaje de error
  await page.waitForTimeout(7000);

  const errorVisible = await page.locator(
    '[class*="error"], [class*="alert"], .invalid-feedback, text=/incorrecto/i, text=/inválido/i, text=/error/i'
  ).first().isVisible().catch(() => false);

  const sigueEnLogin = page.url().includes('login');

  expect(errorVisible || sigueEnLogin).toBeTruthy();
  console.log('✓ Sistema rechazó credenciales incorrectas correctamente');
});

// ─── TC-005: Módulo de Turnos es accesible ────────────────────────────────
test('TC-005 — Módulo de Turnos es accesible', async ({ page }) => {
  await iniciarSesion(page);

  const menuTurnos = page.locator(
    'a:has-text("Turnos"), span:has-text("Turnos"), [href*="turnos"], nav >> text=Turnos'
  ).first();

  const existe = await menuTurnos.isVisible({ timeout: 10000 }).catch(() => false);

  if (existe) {
    await menuTurnos.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('✓ Módulo de Turnos encontrado — URL:', page.url());
  } else {
    console.log('ℹ Menú de Turnos no encontrado para este rol — puede requerir rol supervisor');
    test.skip(true, 'Turnos no disponible para este rol de usuario');
  }
});
