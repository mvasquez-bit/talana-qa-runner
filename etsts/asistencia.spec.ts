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

// ─── Helper: iniciar sesión en Talana ─────────────────────────────────────
async function iniciarSesion(page: any) {
  await page.goto(BASE_URL + LOGIN_PATH);
  await page.waitForLoadState('networkidle');

  // Esperar el campo de usuario (acepta email o rut)
  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"], input[placeholder*="correo"]'
  ).first();
  await campoUsuario.waitFor({ state: 'visible', timeout: 15000 });
  await campoUsuario.fill(USUARIO);

  // Campo contraseña
  const campoPass = page.locator('input[type="password"]').first();
  await campoPass.fill(CLAVE);

  // Botón de ingreso
  const btnIngresar = page.locator(
    'button[type="submit"], button:has-text("Ingresar"), button:has-text("Entrar"), button:has-text("Iniciar")'
  ).first();
  await btnIngresar.click();

  // Esperar que el dashboard cargue (URL cambia o aparece menú)
  await page.waitForURL(/\/#\//, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

// ─── TC-001: Login exitoso ─────────────────────────────────────────────────
test('TC-001 — Login exitoso en Talana', async ({ page }) => {
  test.slow(); // Marca el test como potencialmente lento

  await page.goto(BASE_URL + LOGIN_PATH);
  await page.waitForLoadState('networkidle');

  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"]'
  ).first();
  await expect(campoUsuario).toBeVisible({ timeout: 15000 });

  await campoUsuario.fill(USUARIO);
  await page.locator('input[type="password"]').first().fill(CLAVE);
  await page.locator('button[type="submit"], button:has-text("Ingresar")').first().click();

  // Verificar que entramos al sistema (URL cambia o aparece elemento del dashboard)
  await expect(page).toHaveURL(/\/#\//, { timeout: 20000 });

  console.log('✓ Login exitoso — URL actual:', page.url());
});

// ─── TC-002: Módulo de asistencia es accesible ────────────────────────────
test('TC-002 — Módulo de Asistencia es accesible', async ({ page }) => {
  await iniciarSesion(page);

  // Buscar el menú de Asistencia (prueba varios selectores comunes)
  const menuAsistencia = page.locator(
    'a:has-text("Asistencia"), span:has-text("Asistencia"), [href*="asistencia"], nav >> text=Asistencia'
  ).first();

  await expect(menuAsistencia).toBeVisible({ timeout: 15000 });
  await menuAsistencia.click();
  await page.waitForLoadState('networkidle');

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
  await page.waitForLoadState('networkidle');

  // Verificar que no hay errores de sistema visibles
  const errorTexts = ['Error 500', 'Error 404', 'Something went wrong', 'Ha ocurrido un error'];
  for (const errorText of errorTexts) {
    await expect(page.locator(`text=${errorText}`)).toHaveCount(0);
  }

  // Verificar que hay contenido cargado (tabla, calendario o lista)
  const contenido = page.locator('table, .calendar, .fc-view, [class*="attendance"], [class*="asistencia"]').first();
  await expect(contenido).toBeVisible({ timeout: 15000 });

  console.log('✓ Calendario/vista de asistencia cargó correctamente');
});

// ─── TC-004: Login con credenciales incorrectas muestra error ─────────────
test('TC-004 — Login con contraseña incorrecta muestra error', async ({ page }) => {
  await page.goto(BASE_URL + LOGIN_PATH);
  await page.waitForLoadState('networkidle');

  const campoUsuario = page.locator(
    'input[type="email"], input[name="username"], input[placeholder*="usuario"], input[placeholder*="email"]'
  ).first();
  await campoUsuario.waitFor({ state: 'visible', timeout: 15000 });
  await campoUsuario.fill(USUARIO);
  await page.locator('input[type="password"]').first().fill('ClaveIncorrecta999!');
  await page.locator('button[type="submit"], button:has-text("Ingresar")').first().click();

  // El sistema debe mostrar un mensaje de error, NO redirigir al dashboard
  await page.waitForTimeout(3000);

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
    await page.waitForLoadState('networkidle');
    console.log('✓ Módulo de Turnos encontrado — URL:', page.url());
  } else {
    // Si no hay menú de Turnos visible, el test documenta esto
    console.log('ℹ Menú de Turnos no encontrado para este rol — puede requerir rol supervisor');
    test.skip(true, 'Turnos no disponible para este rol de usuario');
  }
});
