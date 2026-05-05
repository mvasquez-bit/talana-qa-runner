import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
    // Ya estamos en https://talana.com/es/asistencia/ gracias al helper
  });

  test('Debe crear un turno semanal con horario 8:00 - 17:00', async ({ page }) => {
    test.setTimeout(240000);

    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  Turno Semanal: Creación');
    console.log('████████████████████████████████████████████████████\n');

    try {
      // PASO 1: Ir a Creación de turnos (YA ESTAMOS EN ASISTENCIA)
      console.log('\n[PASO 1] Navegando a Creación de turnos...');
      await page.goto('https://talana.com/es/asistencia/turnos/');
      await page.waitForLoadState('networkidle');
      console.log('✅ Página de Creación cargada');

      // PASO 2: Crear turno Semanal
      console.log('\n[PASO 2] Seleccionando tipo Semanal...');
      await page.click('[role="button"]:has-text("Semanal (Estándar)")');
      await page.waitForLoadState('networkidle');
      console.log('✅ Popup de creación abierto');

      // PASO 3: Ingresar nombre
      console.log('\n[PASO 3] Ingresando nombre del turno...');
      await page.fill('input[placeholder="Nombre del turno"]', TURNO_NAME);
      console.log(`✅ Nombre ingresado: ${TURNO_NAME}`);

      // PASO 4: Crear
      console.log('\n[PASO 4] Haciendo clic en Crear...');
      await page.click('button:has-text("Crear")');
      await page.waitForURL(/creacionTurnos/);
      await page.waitForLoadState('networkidle');
      console.log('✅ Página de configuración abierta');

      // PASO 5: Verificar que estamos en la página correcta
      console.log('\n[PASO 5] Verificando página de configuración...');
      await expect(page.locator('h2:has-text("Creación de turno semanal")')).toBeVisible();
      console.log('✅ Página correcta confirmada');

      // PASO 6: Replicar horario
      console.log('\n[PASO 6] Abriendo diálogo de replicación...');
      await page.click('button:has-text("Replicar horario")');
      await page.waitForSelector('text=Replicar horario');
      console.log('✅ Diálogo abierto');

      // PASO 7: Llenar horarios
      console.log('\n[PASO 7] Ingresando horarios...');
      const desdeInput = page.locator('input[placeholder="Desde"]').first();
      await desdeInput.fill('08:00');
      console.log('✅ Hora inicio: 08:00');

      const hastaInput = page.locator('input[placeholder*="Hasta"]').first();
      await hastaInput.fill('17:00');
      console.log('✅ Hora fin: 17:00');

      // PASO 8: Aceptar
      console.log('\n[PASO 8] Aceptando horarios...');
      await page.click('button:has-text("Aceptar")');
      await page.waitForTimeout(2000);
      console.log('✅ Horarios replicados');

      // PASO 9: Verificar replicación
      console.log('\n[PASO 9] Verificando replicación...');
      const horariosInicio = await page.locator('text=09:00').count();
      expect(horariosInicio).toBeGreaterThanOrEqual(3);
      console.log(`✅ Horarios encontrados en ${horariosInicio} días`);

      // PASO 10: Guardar
      console.log('\n[PASO 10] Guardando turno...');
      await page.click('button:has-text("Guardar")');
      await page.waitForURL(/asistencia\/turnos/);
      await page.waitForLoadState('networkidle');
      console.log('✅ Turno guardado');

      // PASO 11: Verificar en listado
      console.log('\n[PASO 11] Verificando en listado...');
      const turnoEnTabla = page.locator(`text=${TURNO_NAME}`);
      await expect(turnoEnTabla).toBeVisible();
      console.log(`✅ Turno "${TURNO_NAME}" visible en listado`);

      // Verificar tipo
      const filaDelTurno = page.locator('tr', { has: page.locator(`text=${TURNO_NAME}`) });
      await expect(filaDelTurno.locator('text=Semanal')).toBeVisible();
      console.log('✅ Tipo correcto: Semanal');

      console.log('\n✅✅✅ Test PASSOU ✅✅✅\n');
      
    } catch (error) {
      console.error('\n❌ Test FALHOU ❌\n');
      throw error;
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup opcional
  });
});
