import { test, expect } from '@playwright/test';

/**
 * TEST: Creación de Turno Semanal
 * 
 * Flujo:
 * 1. Login en Talana
 * 2. Seleccionar módulo AyT (Asistencia y Turnos)
 * 3. Ir a "Creación de turnos"
 * 4. Crear nuevo turno semanal con nombre dinámico
 * 5. Configurar horarios (8:00 - 17:00)
 * 6. Verificar que el turno aparece en el listado
 * 
 * NOTA IMPORTANTE: Cambiar el nombre del turno en cada ejecución
 * Ver la variable TURNO_NAME más abajo
 */

const TURNO_NAME = `prueba_automatizada_${Date.now()}`; // Genera nombre único basado en timestamp

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('https://talana.com/es/remuneraciones/login-vue#/');
    await page.fill('input[placeholder*="usuario"]', process.env.TALANA_EMAIL!);
    await page.fill('input[type="password"]', process.env.TALANA_PASS!);
    await page.click('button:has-text("Ingresar")');
    
    // Esperar a que cargue el dashboard
    await page.waitForURL(/remuneraciones\/#\//);
    await page.waitForLoadState('networkidle');
  });

  test('Debe crear un turno semanal con horario 8:00 - 17:00', async ({ page }) => {
    // PASO 1: Seleccionar módulo AyT desde el dropdown superior derecho
    await page.click('button:has-text("Remuneraciones")');
    await page.click('text=Asistencia y Turnos');
    
    // Esperar a que cargue el módulo AyT
    await page.waitForURL(/asistencia/);
    await page.waitForLoadState('networkidle');

    // PASO 2: Seleccionar "Creación de turnos" del menú izquierdo
    await page.click('text=Creación de turnos');
    await page.waitForLoadState('networkidle');

    // PASO 3: Hacer clic en "Semanal (Estándar)" para crear nuevo turno
    await page.click('[role="button"]:has-text("Semanal (Estándar)")');
    await page.waitForLoadState('networkidle');

    // PASO 4: Popup - Ingresar nombre del turno
    await page.fill('input[placeholder="Nombre del turno"]', TURNO_NAME);

    // PASO 5: Seleccionar tipo "Semanal (Estándar)" si no está ya seleccionado
    // (Nota: ya fue seleccionado en el paso anterior, pero confirmamos)
    
    // PASO 6: Hacer clic en botón "Crear"
    await page.click('button:has-text("Crear")');
    
    // Esperar redirección a página de configuración de turno
    await page.waitForURL(/creacionTurnos/);
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de "Creación de turno semanal"
    await expect(page.locator('h2:has-text("Creación de turno semanal")')).toBeVisible();

    // Verificar que el nombre del turno aparece en Configuración
    await expect(page.locator('input[value="' + TURNO_NAME + '"]')).toBeVisible();

    // PASO 7: Hacer clic en "Replicar horario"
    await page.click('button:has-text("Replicar horario")');
    
    // Esperar a que aparezca el popup "Replicar horario"
    await page.waitForSelector('text=Replicar horario');

    // PASO 8: Llenar horario inicio (8:00 a.m.)
    const desdeInput = page.locator('input[placeholder="Desde"]').first();
    await desdeInput.fill('08:00');

    // PASO 9: Llenar horario fin (17:00 / 5:00 p.m.)
    const hastaInput = page.locator('input[placeholder*="Hasta"]').first();
    await hastaInput.fill('17:00');

    // PASO 10: Hacer clic en "Aceptar"
    await page.click('button:has-text("Aceptar")');
    
    // Esperar a que se replique el horario
    await page.waitForTimeout(2000);

    // Verificar que los horarios fueron replicados en todos los días
    // (Verificamos que al menos 3 días tengan el horario 09:00 - 06:00 p.m.)
    const horariosInicio = await page.locator('text=09:00').count();
    expect(horariosInicio).toBeGreaterThanOrEqual(3);

    // PASO 11: Hacer clic en "Guardar"
    await page.click('button:has-text("Guardar")');
    
    // Esperar a que se guarde y redirija a la página de turnos
    await page.waitForURL(/asistencia\/turnos/);
    await page.waitForLoadState('networkidle');

    // PASO 12: Verificar que el turno aparece en la tabla "Turnos sin asignación de personas"
    const turnoEnTabla = page.locator(`text=${TURNO_NAME}`);
    await expect(turnoEnTabla).toBeVisible();

    // Verificar que aparezca con tipo "Semanal"
    const filaDelTurno = page.locator('tr', { has: page.locator(`text=${TURNO_NAME}`) });
    await expect(filaDelTurno.locator('text=Semanal')).toBeVisible();

    console.log(`✅ Turno "${TURNO_NAME}" creado exitosamente`);
  });

  test.afterEach(async ({ page }) => {
    // Captura de pantalla en caso de fallo (Playwright lo hace automáticamente)
    // Los videos se graban automáticamente si la prueba falla
  });
});
