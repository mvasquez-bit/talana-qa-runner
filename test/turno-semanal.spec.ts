import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    // Usa la función de login compartida
    await iniciarSesion(page);
  });

  test('Debe crear un turno semanal con horario 8:00 - 17:00', async ({ page }) => {
    console.log('\n\n████████████████████████████████████████████████████');
    console.log('█  Turno Semanal: Creación');
    console.log('████████████████████████████████████████████████████\n');

    try {
      // PASO 1: Seleccionar módulo AyT
      console.log('\n[PASO 1] Seleccionando módulo Asistencia y Turnos...');
      await page.click('button:has-text("Remuneraciones")');
      await page.click('text=Asistencia y Turnos');
      
      await page.waitForURL(/asistencia/);
      await page.waitForLoadState('networkidle');
      console.log('✅ Módulo AyT cargado');

      // PASO 2: Ir a Creación de turnos
      console.log('\n[PASO 2] Navegando a Creación de turnos...');
      await page.click('text=Creación de turnos');
      await page.waitForLoadState('networkidle');
      console.log('✅ Página de Creación cargada');

      // PASO 3: Crear turno Semanal
      console.log('\n[PASO 3] Seleccionando tipo Semanal...');
      await page.click('[role="button"]:has-text("Semanal (Estándar)")');
      await page.waitForLoadState('networkidle');
      console.log('✅ Popup de creación abierto');

      // PASO 4: Ingresar nombre
      console.log('\n[PASO 4] Ingresando nombre del turno...');
      await page.fill('input[placeholder="Nombre del turno"]', TURNO_NAME);
      console.log(`✅ Nombre ingresado: ${TURNO_NAME}`);

      // PASO 5: Crear
      console.log('\n[PASO 5] Haciendo clic en Crear...');
      await page.click('button:has-text("Crear")');
      await page.waitForURL(/creacionTurnos/);
      await page.waitForLoadState('networkidle');
      console.log('✅ Página de configuración abierta');

      // PASO 6: Verificar que estamos en la página correcta
      console.log('\n[PASO 6] Verificando página de configuración...');
      await expect(page.locator('h2:has-text("Creación de turno semanal")')).toBeVisible();
      console.log('✅ Página correcta confirmada');

      // PASO 7: Replicar horario
      console.log('\n[PASO 7] Abriendo diálogo de replicación...');
      await page.click('button:has-text("Replicar horario")');
      await page.waitForSelector('text=Replicar horario');
      console.log('✅ Diálogo abierto');

      // PASO 8: Llenar horarios
      console.log('\n[PASO 8] Ingresando horarios...');
      const desdeInput = page.locator('input[placeholder="Desde"]').first();
      await desdeInput.fill('08:00');
      console.log('✅ Hora inicio: 08:00');

      const hastaInput = page.locator('input[placeholder*="Hasta"]').first();
      await hastaInput.fill('17:00');
      console.log('✅ Hora fin: 17:00');

      // PASO 9: Aceptar
      console.log('\n[PASO 9] Aceptando horarios...');
      await page.click('button:has-text("Aceptar")');
      await page.waitForTimeout(2000);
      console.log('✅ Horarios replicados');

      // PASO 10: Verificar replicación
      console.log('\n[PASO 10] Verificando replicación...');
      const horariosInicio = await page.locator('text=09:00').count();
      expect(horariosInicio).toBeGreaterThanOrEqual(3);
      console.log(`✅ Horarios encontrados en ${horariosInicio} días`);

      // PASO 11: Guardar
      console.log('\n[PASO 11] Guardando turno...');
      await page.click('button:has-text("Guardar")');
      await page.waitForURL(/asistencia\/turnos/);
      await page.waitForLoadState('networkidle');
      console.log('✅ Turno guardado');

      // PASO 12: Verificar en listado
      console.log('\n[PASO 12] Verificando en listado...');
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
