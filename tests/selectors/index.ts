/**
 * ============================================================================
 *  TALANA — CATÁLOGO CENTRAL DE SELECTORES
 *  Tests E2E con Playwright para módulos de Asistencia y Turnos
 * ============================================================================
 *
 *  Todos los valores en este archivo están VERIFICADOS en el código fuente
 *  del repositorio Talana (frontend Vue + templates Django).
 *  Ver mapeo completo en: data-cy-mapeo.md
 *
 *  REGLA DE ORO PARA EL MODELO QUE ESCRIBE LOS TESTS
 *  -------------------------------------------------
 *  1. Usa ÚNICAMENTE los selectores exportados desde este archivo.
 *  2. NO inventes selectores por texto (`getByText`, `:has-text`) — si el
 *     selector que necesitas no está aquí, DETENTE y pide que se agregue.
 *  3. NO uses fallbacks en cascada. Si un selector falla, el test debe
 *     fallar limpio con el nombre del selector que no respondió.
 * ============================================================================
 */

import type { Page } from '@playwright/test';

// ============================================================================
//  CONFIG BASE
// ============================================================================

export const BASE_URL_PROD = 'https://talana.com';
export const BASE_URL_QA = 'https://qa-asistencia.talana.dev';
export const BASE_URL = process.env.BASE_URL ?? BASE_URL_PROD;

// ============================================================================
//  LOGIN — Login.vue / Recover.vue / RecoverCode.vue
// ============================================================================

export const Auth = {
  loginPath: '/es/remuneraciones/login-vue?next=/es/remuneraciones/#/',
  urlLogin: (base = BASE_URL) => `${base}/es/remuneraciones/login-vue?next=/es/remuneraciones/#/`,

  // Login principal
  inputUsuario:           '[data-cy="talana-user-input"]',
  inputClave:             '[data-cy="talana-password-input"]',
  btnIngresar:            '[data-cy="talana-login-button"]',
  errorAcceso:            '[data-cy="talana-login-errorAccess"]',
  btnOlvideClave:         '[data-cy="talana-forgot-password-button"]',

  // Login multi-empresa
  selectEmpresa:          '[data-cy="talana-company-select"]',
  inputClaveEmpresa:      '[data-cy="talana-company-password-input"]',
  btnIngresarEmpresa:     '[data-cy="talana-company-login-button"]',
  btnOlvideClaveEmpresa:  '[data-cy="talana-company-forgot-password-button"]',
  btnVistaAntigua:        '[data-cy="talana-company-old-view-button"]',

  // Recuperación de contraseña
  inputEmailRut:          '[data-cy="talana-email-rut-input"]',
  btnEnviarRecuperacion:  '[data-cy="talana-login-submitRecoverButton"]',
  linkVolverLogin:        '[data-cy="talana-login-link"]',
  inputCodigo:            '[data-cy="talana-login-codeInput"]',
  linkOtroMetodo:         '[data-cy="talana-login-methodOptionLink"]',
};

// ============================================================================
//  SIDEBAR — asistenciaContainer.html
// ============================================================================

export const Sidebar = {
  home:                 '[data-cy="sidebar-home"]',
  empresa:              '[data-cy="sidebar-company"]',
  cargaDatos:           '[data-cy="sidebar-data-load"]',
  vacaciones:           '[data-cy="sidebar-vacation"]',
  creacionTurnos:       '[data-cy="sidebar-shift-creation"]',
  asignacionTurnos:     '[data-cy="sidebar-shift-assignment"]',
  marcas:               '[data-cy="sidebar-marks"]',
  correccionJornadas:   '[data-cy="sidebar-days-correction"]',
  correccionMarcas:     '[data-cy="sidebar-marks-correction"]',
  transferirRemu:       '[data-cy="sidebar-transfer-remunerations"]',
  reportes:             '[data-cy="sidebar-reports"]',
  utilidades:           '[data-cy="sidebar-utilities"]',
  iconoMenu:            '[data-cy="talana-menu-icon"]',
  breadcrumbs:          '[data-cy="talana-breadcrumbs-container"]',
};

// ============================================================================
//  TURNOS — workshifts.html + workshiftCreation2.html + turno-rotativo/
// ============================================================================

export const Turnos = {
  url:         (base = BASE_URL) => `${base}/es/asistencia/turnos/`,
  urlCreacion: /creacionTurnos/,

  // ── Dashboard / pantalla principal de Turnos ─────────────────────────────
  // OJO: NO son botones, son tarjetas (anchors con clase lv-item).
  // Al hacer clic se abre el modal #modalCrearTurno con el tipo preseleccionado.
  dashboard: {
    tarjetaSemanal:     '[data-cy="ayt-workshift-create-weekly-workshift-modal"]',
    tarjetaMensual:     '[data-cy="ayt-workshift-create-manual-workshift-modal"]',
    tarjetaRotativo:    '[data-cy="ayt-workshift-create-rotative-workshift-modal"]',
    btnListadoTurnos:   '[data-cy="ayt-workshift-workshift-list-button"]',
    btnCargadorTurnos:  '[data-cy="ayt-workshift-workshift-loader-button"]',
    selectTipoMapa:     '[data-cy="ayt-dashboard-show-marks-select"]',
  },

  // ── Modal "Creación del turno" (#modalCrearTurno) ────────────────────────
  modal: {
    inputNombre:        '[data-cy="ayt-workshift-modal-workshift-name-input"]',
    /** <select> con options: W=Semanal, M=Mensual, R=Rotativo */
    selectTipo:         '[data-cy="ayt-workshift-modal-workshift-type-select"]',
    btnCrear:           '[data-cy="ayt-workshift-modal-create-button"]',
    btnCancelar:        '[data-cy="ayt-workshift-modal-cancel-button"]',
  },

  // ── Pantalla de configuración (workshiftCreation2.html) ──────────────────
  config: {
    titulo:               '[data-cy="ayt-workshift-creation-title"]',
    btnGuardar:           '[data-cy="ayt-workshift-creation-save-button"]',
    inputNombre:          '[data-cy="ayt-workshift-creation-name-input"]',
    checkFestivos:        '[data-cy="ayt-workshift-creation-festivos-checkbox"]',
    checkColacion:        '[data-cy="ayt-workshift-creation-mark-checkbox"]',
    inputDuracion:        '[data-cy="ayt-workshift-creation-duration-input"]',
    inputTolerancia:      '[data-cy="ayt-workshift-creation-tolerance-input"]',
    btnReplicarHorario:   '[data-cy="ayt-workshift-creation-clone-modal-button"]',
    btnLimpiarTodo:       '[data-cy="ayt-workshift-creation-clear-button"]',
  },

  // ── Modal "Replicar horario" ─────────────────────────────────────────────
  modalReplicar: {
    modal:                '[data-cy="ayt-workshift-creation-clone-modal"]',
    inputDesde:           '[data-cy="ayt-workshift-creation-day-from-clone-input"]',
    inputHasta:           '[data-cy="ayt-workshift-creation-day-to-clone-input"]',
    inputColacionDesde:   '[data-cy="ayt-workshift-creation-snack-from-clone-input"]',
    inputColacionHasta:   '[data-cy="ayt-workshift-creation-snack-to-clone-input"]',
    btnCancelar:          '[data-cy="ayt-workshift-creation-cancel-clone-button"]',
    // El botón "Aceptar" del modal no tiene data-cy propio; usa el genérico:
    btnAceptar:           '[data-cy="ayt-modal-confirm-button"]',
  },

  // ── Turno rotativo (Vue: turno-rotativo/) ────────────────────────────────
  rotativo: {
    btnRestarDias:        '[data-cy="ayt-workshift-creation-day-down-button"]',
    btnSumarDias:         '[data-cy="ayt-workshift-creation-day-up-button"]',
    checkDiaLaborable:    '[data-cy="ayt-workshift-creation-work-day-checkbox"]',
    inputDesdePorDia:     '[data-cy="ayt-workshift-creation-from-time-input"]',
    inputHorasTrabajo:    '[data-cy="ayt-workshift-creation-working-hours-input"]',
    inputColacionDesde:   '[data-cy="ayt-workshift-creation-snack-from-time-input"]',
    inputHorasColacion:   '[data-cy="ayt-workshift-creation-snack-working-hours-input"]',
    btnEliminarDia:       '[data-cy="ayt-workshift-creation-delete-day-button"]',
  },
};

// ============================================================================
//  MARCAS INDIVIDUALES — frontend/asistencia (MainToolbarV2 + MainFilters + MainList)
// ============================================================================
//  URL ejemplo:
//    /es/asistencia/app/marcas-individuales?min_date=YYYY-MM-DD&max_date=YYYY-MM-DD
//  El botón "Exportar datos" es el MISMO data-cy que en Reportes ("Descargar
//  reporte"), el texto cambia según la ruta. Eso es esperado por diseño.
// ============================================================================

export const Marcaciones = {
  url: (params: { minDate: string; maxDate: string; base?: string }) => {
    const base = params.base ?? BASE_URL;
    return `${base}/es/asistencia/app/marcas-individuales?min_date=${params.minDate}&max_date=${params.maxDate}`;
  },

  // ── Toolbar superior ─────────────────────────────────────────────────────
  toolbar: {
    btnFechaAnterior:     '[data-cy="ayt-workingday-list-prev-button"]',
    btnDatePicker:        '[data-cy="ayt-workingday-list-date-picker-button"]',
    btnBuscar:            '[data-cy="ayt-workingday-list-search-button"]',
    inputBuscar:          '[data-cy="ayt-workingday-list-search-input"]',
    /** Botón "Exportar datos" en /marcas o "Descargar reporte" en otras vistas. */
    btnExportar:          '[data-cy="ayt-workingday-list-download"]',
    btnColumnas:          '[data-cy="ayt-workingday-list-columns"]',
    btnFiltros:           '[data-cy="ayt-workingday-list-filter"]',
    dropdown:             '[data-cy="ayt-workingday-dropdown"]',
    /** Opción de columna específica (por value del column). */
    opcionColumna:        (value: string) => `[data-cy="ayt-workingday-list-column-${value}"]`,
  },

  // ── Panel de filtros (MainFilters.vue) ──────────────────────────────────
  filtros: {
    panel:                '[data-cy="ayt-filters-panel"]',
    /** Filtro dinámico por vModel: company, branch, employee, etc. */
    selectContainer:      (vModel: string) => `[data-cy="ayt-filters-panel-filter-select-${vModel}-container"]`,
    selectInput:          (vModel: string) => `[data-cy="ayt-filters-panel-filter-select-${vModel}-input"]`,
    checkbox:             '[data-cy="ayt-filters-panel-filter-checkbox"]',
    btnLimpiar:           '[data-cy="ayt-filters-panel-remove-filters-button"]',
    btnAplicar:           '[data-cy="ayt-filters-panel-apply-filters-button"]',
  },

  // ── Tabla principal (MainList.vue) ──────────────────────────────────────
  tabla: {
    container:            '[data-cy="ayt-table"]',
    btnContrato:          '[data-cy="ayt-table-contract-button"]',
    btnTurno:             '[data-cy="ayt-table-workshift-button"]',
    btnDiagnostico:       '[data-cy="ayt-table-diagnostic-button"]',
    btnEdicionMasiva:     '[data-cy="ayt-bulk-update-open-modal-button"]',
  },
};

// ============================================================================
//  COMPONENTES COMUNES — Date pickers, modales, etc.
// ============================================================================

export const Comunes = {
  datePicker: {
    container:            '[data-cy="ayt-date-picker"]',
    btnActivador:         '[data-cy="ayt-date-picker-activator-button"]',
    btnMesAnterior:       '[data-cy="ayt-date-picker-prev-month"]',
    btnMesSiguiente:      '[data-cy="ayt-date-picker-next-month"]',
    btnLimpiar:           '[data-cy="ayt-date-picker-clean"]',
    btnAceptar:           '[data-cy="ayt-date-picker-accept"]',
    inputDesde:           '[data-cy="ayt-start-date-input"]',
    inputHasta:           '[data-cy="ayt-end-date-input"]',
  },

  /** Modales de confirmación (SweetAlert2 reasignados por jQuery). */
  modal: {
    container:            '[data-cy="ayt-modal"]',
    btnCancelar:          '[data-cy="ayt-modal-cancel-button"]',
    btnConfirmar:         '[data-cy="ayt-modal-confirm-button"]',
  },
};

// ============================================================================
//  HELPERS — Interacciones estables sin fallbacks por texto
// ============================================================================

/**
 * Click estable: espera a que el selector sea visible y clickeable.
 * Si no aparece en `timeout` ms, lanza un error claro con el selector
 * usado. NO intenta estrategias alternativas.
 */
export async function clickEstable(
  page: Page,
  selector: string,
  timeout = 10_000,
): Promise<void> {
  const locator = page.locator(selector);
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
  } catch (_e) {
    throw new Error(
      `[selectors] No se pudo clickear "${selector}" en ${timeout}ms. ` +
      `Verifica el atributo data-cy en DevTools y actualiza selectors.ts.`,
    );
  }
}

/**
 * Llena un input limpiando el contenido previo.
 */
export async function llenarEstable(
  page: Page,
  selector: string,
  valor: string,
  timeout = 10_000,
): Promise<void> {
  const locator = page.locator(selector);
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill('');
    await locator.fill(valor);
  } catch (_e) {
    throw new Error(
      `[selectors] No se pudo llenar "${selector}" en ${timeout}ms.`,
    );
  }
}

/**
 * Selecciona una opción de un <select> nativo por su `value`.
 * Útil para el select de tipo de turno: W=Semanal, M=Mensual, R=Rotativo.
 */
export async function seleccionarOpcion(
  page: Page,
  selector: string,
  value: string,
  timeout = 10_000,
): Promise<void> {
  const locator = page.locator(selector);
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.selectOption(value);
  } catch (_e) {
    throw new Error(
      `[selectors] No se pudo seleccionar "${value}" en "${selector}".`,
    );
  }
}

/**
 * Click + descarga: patrón oficial de Playwright. Devuelve el nombre
 * sugerido y el path temporal donde Playwright guardó el archivo.
 */
export async function clickYDescargar(
  page: Page,
  selector: string,
  timeoutDescarga = 30_000,
): Promise<{ suggestedFilename: string; path: string | null }> {
  const downloadPromise = page.waitForEvent('download', { timeout: timeoutDescarga });
  await clickEstable(page, selector);
  const download = await downloadPromise;
  return {
    suggestedFilename: download.suggestedFilename(),
    path: await download.path(),
  };
}

/**
 * Espera a que un selector aparezca como confirmación de que una acción
 * terminó. Devuelve true si apareció, false si superó el timeout.
 */
export async function esperarConfirmacion(
  page: Page,
  selector: string,
  timeout = 10_000,
): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
