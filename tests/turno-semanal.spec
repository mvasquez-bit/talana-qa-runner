import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';
import {
  Turnos,
  Comunes,
  clickEstable,
  llenarEstable,
  seleccionarOpcion,
  esperarConfirmacion,
} from '../selectors';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
  });

  test('Debe crear un turno semanal con horario 08:00 - 17:00', async ({ page }) => {
    test.setTimeout(120_000);

    console.log('\n🚀 Iniciando creación de turno...');

    // ────────────────────────────────────────────────────────────────────
    // PASO 1: Navegar al dashboard de turnos
    // ────────────────────────────────────────────────────────────────────
    console.log('\n[PASO 1] Navegando al dashboard de Turnos...');
    await page.goto(Turnos.url(), { waitUntil: 'load' });
    await page.waitForURL('**/asistencia/turnos/**');
    console.log('   ✅ URL confirmada');

    // ────────────────────────────────────────────────────────────────────
    // PASO 2: Click directo en la tarjeta "Semanal (Estándar)"
    //   → Abre el modal #modalCrearTurno con tipo preseleccionado en "W"
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 2] Click en tarjeta "Semanal (Estándar)"...');
    await clickEstable(page, Turnos.dashboard.tarjetaSemanal);

    // Verificar que el modal abrió
    await page.locator(Turnos.modal.inputNombre).waitFor({ state: 'visible', timeout: 10_000 });
    console.log('   ✅ Modal de creación abierto');

    // ────────────────────────────────────────────────────────────────────
    // PASO 3: Llenar nombre y forzar tipo "W" (Semanal) por seguridad
    // ────────────────────────────────────────────────────────────────────
    console.log(`[PASO 3] Configurando turno: nombre="${TURNO_NAME}", tipo=W`);
    await llenarEstable(page, Turnos.modal.inputNombre, TURNO_NAME);
    await seleccionarOpcion(page, Turnos.modal.selectTipo, 'W');
    console.log('   ✅ Nombre y tipo configurados');

    // ────────────────────────────────────────────────────────────────────
    // PASO 4: Click en "Crear" → redirige a pantalla de configuración
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 4] Confirmando creación...');
    await clickEstable(page, Turnos.modal.btnCrear);
    await page.waitForURL(Turnos.urlCreacion, { timeout: 15_000 });
    console.log('   ✅ Pantalla de configuración abierta');

    // Verificar que el título cargó
    await page.locator(Turnos.config.titulo).waitFor({ state: 'visible', timeout: 10_000 });

    // ────────────────────────────────────────────────────────────────────
    // PASO 5: Abrir modal "Replicar horario"
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 5] Abriendo modal "Replicar horario"...');
    await clickEstable(page, Turnos.config.btnReplicarHorario);
    await page.locator(Turnos.modalReplicar.modal).waitFor({ state: 'visible', timeout: 10_000 });
    console.log('   ✅ Modal abierto');

    // ────────────────────────────────────────────────────────────────────
    // PASO 6: Configurar horarios 08:00 - 17:00 en el modal de replicación
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 6] Configurando horarios 08:00 - 17:00...');
    await llenarEstable(page, Turnos.modalReplicar.inputDesde, '08:00');
    await llenarEstable(page, Turnos.modalReplicar.inputHasta, '17:00');
    console.log('   ✅ Horarios ingresados');

    // ────────────────────────────────────────────────────────────────────
    // PASO 7: Aceptar replicación (botón modal-confirm del SweetAlert)
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 7] Aceptando replicación...');
    await clickEstable(page, Turnos.modalReplicar.btnAceptar);
    await page.locator(Turnos.modalReplicar.modal).waitFor({ state: 'hidden', timeout: 10_000 });
    console.log('   ✅ Replicación aplicada, modal cerrado');

    // ────────────────────────────────────────────────────────────────────
    // PASO 8: Verificar que los horarios se aplicaron al menos a un día
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 8] Verificando que los horarios se aplicaron...');
    const horariosAplicados = await page.locator('input[value="08:00"]').count();
    expect(horariosAplicados, 'Se esperaba al menos un horario 08:00 aplicado').toBeGreaterThanOrEqual(1);
    console.log(`   ✅ ${horariosAplicados} horarios de inicio detectados`);

    // ────────────────────────────────────────────────────────────────────
    // PASO 9: Guardar el turno
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 9] Guardando turno...');
    await clickEstable(page, Turnos.config.btnGuardar);

    // El guardado puede mostrar un modal de confirmación SweetAlert.
    // Si aparece, aceptamos; si no, seguimos.
    const aparecioConfirmacion = await esperarConfirmacion(page, Comunes.modal.container, 3_000);
    if (aparecioConfirmacion) {
      console.log('   ℹ️  Modal de confirmación detectado, aceptando...');
      await clickEstable(page, Comunes.modal.btnConfirmar);
    }

    // Esperar redirección al listado
    await page.waitForURL(/asistencia\/turnos/, { timeout: 15_000 });
    console.log('   ✅ Redirigido al dashboard de turnos');

    // ────────────────────────────────────────────────────────────────────
    // PASO 10: Verificación final — el turno aparece en el listado
    // ────────────────────────────────────────────────────────────────────
    console.log('[PASO 10] Verificación final...');
    // Navegamos al listado de turnos para confirmar
    await clickEstable(page, Turnos.dashboard.btnListadoTurnos);

    const aparece = await esperarConfirmacion(
      page,
      `text=${TURNO_NAME}`,
      15_000,
    );

    if (!aparece) {
      await page.screenshot({
        path: `./error-verificacion-${Date.now()}.png`,
        fullPage: true,
      });
      throw new Error(`El turno "${TURNO_NAME}" no aparece en el listado tras 15s.`);
    }

    console.log(`🎉 Test completado con éxito — Turno creado: ${TURNO_NAME}`);
  });
});
