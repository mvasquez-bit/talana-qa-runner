import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

const TURNO_NAME = `prueba_automatizada_${Date.now()}`;

test.describe('Creación de Turno Semanal', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
  });

  test('Debe crear un turno semanal con horario 08:00 - 17:00', async ({ page }) => {
    // Aumentamos el timeout solo para este test si es necesario
    test.setTimeout(120000); 

    console.log('\n🚀 Iniciando creación de turno...');

    // PASO 1: Navegación
    await page.goto('https://talana.com/es/asistencia/turnos/');
    // En lugar de networkidle (que es lento), esperamos a que el botón de añadir sea visible
    await page.waitForSelector('text=Semanal (Estándar)');
    console.log('✅ Página de Turnos cargada');

    // PASO 2: Seleccionar tipo Semanal
    // Optimizamos el selector: Buscamos el texto y forzamos el click en el elemento
    console.log('[PASO 2] Seleccionando tipo Semanal...');
    await page.getByText('Semanal (Estándar)').click();

    // PASO 3: Ingresar nombre (Corregido con tu nuevo selector)
    console.log('[PASO 3] Ingresando nombre...');
    const inputNombre = page.locator('[data-cy="ayt-workshift-modal-workshift-name-input"]');
    await inputNombre.waitFor({ state: 'visible' });
    await inputNombre.fill(TURNO_NAME);

    // PASO 4: Click en Crear
    console.log('[PASO 4] Haciendo clic en Crear...');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    
    // Esperamos a que la URL cambie a la página de configuración
    await page.waitForURL(/creacionTurnos/);
    console.log('✅ Configuración de turno abierta');

    // PASO 6 & 7: Replicar horario
    console.log('[PASO 6/7] Configurando horarios...');
    await page.getByRole('button', { name: 'Replicar horario' }).click();
    
    // Usamos locators más específicos para los inputs de tiempo
    await page.locator('input[placeholder="Desde"]').first().fill('08:00');
    // Corregimos el placeholder exacto del "Hasta"
    await page.locator('input[placeholder="Hasta"]').first().fill('17:00');
    
    // PASO 8: Aceptar
    await page.getByRole('button', { name: 'Aceptar' }).click();
    // En lugar de waitForTimeout(2000), esperamos a que el diálogo desaparezca
    await page.waitForSelector('text=Replicar horario', { state: 'hidden' });
    console.log('✅ Horarios replicados');

    // PASO 9: Verificar replicación (¡CORREGIDO!)
    // Antes buscabas "09:00" pero habías ingresado "08:00". Ahora coinciden.
    const conteoHorarios = await page.locator('input[value="08:00"]').count();
    expect(conteoHorarios).toBeGreaterThanOrEqual(1); 
    console.log(`✅ Se verificaron los horarios de inicio`);

    // PASO 10: Guardar
    console.log('[PASO 10] Guardando turno...');
    await page.getByRole('button', { name: 'Guardar' }).click();
    
    // Esperamos volver al listado
    await page.waitForURL(/asistencia\/turnos/);
    
    // PASO 11: Verificación final en la tabla
    console.log('[PASO 11] Verificando en listado...');
    await expect(page.locator(`text=${TURNO_NAME}`)).toBeVisible({ timeout: 10000 });
    console.log(`🎉 ¡Test completado con éxito! Turno: ${TURNO_NAME}`);
  });
});
