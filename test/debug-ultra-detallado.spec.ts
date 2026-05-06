import { test, expect } from '@playwright/test';
import { iniciarSesion } from './helpers/talana-login';

test('DEBUG ULTRA: Inspeccionar página de Turnos en detalle', async ({ page }) => {
  await iniciarSesion(page);

  console.log('\n' + '='.repeat(70));
  console.log('🔍 DEBUG ULTRA-DETALLADO DE PÁGINA DE TURNOS');
  console.log('='.repeat(70) + '\n');

  // Navegar a la página de turnos
  console.log('[PASO 1] Navegando a https://talana.com/es/asistencia/turnos/');
  await page.goto('https://talana.com/es/asistencia/turnos/', { waitUntil: 'load' });
  await page.waitForURL('**/asistencia/turnos/**');
  console.log('✅ URL confirmada\n');

  // Esperar 5 segundos para que TODO cargue
  console.log('[PASO 2] Esperando 5 segundos para que la página cargue completamente...');
  await page.waitForTimeout(5000);
  console.log('✅ Tiempo de espera completado\n');

  // Hacer scroll para asegurar que vemos todo
  console.log('[PASO 3] Realizando scroll a inicio de página...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  console.log('✅ Scroll completado\n');

  // 1. ESTADO GENERAL DE LA PÁGINA
  console.log('📊 [INFO 1] ESTADO GENERAL DE LA PÁGINA');
  console.log('-'.repeat(70));
  const title = await page.title();
  const url = page.url();
  const bodyText = await page.locator('body').textContent();
  const bodyLength = bodyText?.length || 0;
  
  console.log(`URL: ${url}`);
  console.log(`Título: ${title}`);
  console.log(`Tamaño del contenido: ${bodyLength} caracteres\n`);

  // 2. TODOS LOS BOTONES
  console.log('📌 [INFO 2] TODOS LOS BOTONES EN LA PÁGINA');
  console.log('-'.repeat(70));
  const botones = await page.locator('button').all();
  console.log(`Total de botones: ${botones.length}\n`);
  
  for (let i = 0; i < botones.length; i++) {
    const btn = botones[i];
    const texto = await btn.textContent();
    const visible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
    const enabled = await btn.isEnabled().catch(() => false);
    const classes = await btn.getAttribute('class');
    console.log(`[${i}] ${visible ? '✅' : '❌'} "${texto?.trim() || '(vacío)'}" ${enabled ? '(activo)' : '(desactivo)'}`);
    if (classes) {
      console.log(`    Classes: ${classes.substring(0, 80)}`);
    }
  }
  console.log('');

  // 3. BUSCAR "SEMANAL" EN TODO
  console.log('📌 [INFO 3] BÚSQUEDA DE "SEMANAL" EN LA PÁGINA');
  console.log('-'.repeat(70));
  const tiene_semanal = await page.locator('text=/semanal/i').count();
  console.log(`Ocurrencias de "Semanal": ${tiene_semanal}\n`);

  if (tiene_semanal > 0) {
    const elementos = await page.locator('text=/semanal/i').all();
    for (let i = 0; i < elementos.length; i++) {
      const texto = await elementos[i].textContent();
      const tagName = await elementos[i].evaluate(el => el.tagName);
      console.log(`[${i}] <${tagName}> "${texto?.trim()}"`);
    }
  } else {
    console.log('❌ No se encontró "Semanal" en la página');
  }
  console.log('');

  // 4. TODOS LOS ELEMENTOS CON ROLE="BUTTON"
  console.log('📌 [INFO 4] ELEMENTOS CON role="button"');
  console.log('-'.repeat(70));
  const roleButtons = await page.getByRole('button').all();
  console.log(`Total: ${roleButtons.length}\n`);
  for (let i = 0; i < roleButtons.length; i++) {
    const texto = await roleButtons[i].textContent();
    console.log(`[${i}] "${texto?.trim()}"`);
  }
  console.log('');

  // 5. TODOS LOS DIVS CON CLASES
  console.log('📌 [INFO 5] ELEMENTOS TIPO CARD/CONTAINER');
  console.log('-'.repeat(70));
  const containers = await page.locator('[class*="card"], [class*="option"], [class*="modal"], [class*="dialog"], [class*="section"]').all();
  console.log(`Total encontrados: ${containers.length}\n`);
  
  for (let i = 0; i < Math.min(10, containers.length); i++) {
    const classes = await containers[i].getAttribute('class');
    const texto = await containers[i].textContent();
    const preview = texto?.substring(0, 60).trim() || '(vacío)';
    console.log(`[${i}] Classes: ${classes?.substring(0, 50)}`);
    console.log(`     Texto: "${preview}..."\n`);
  }
  console.log('');

  // 6. INPUTS Y SELECTS
  console.log('📌 [INFO 6] INPUTS, SELECTS Y CAMPOS DE FORMULARIO');
  console.log('-'.repeat(70));
  const inputs = await page.locator('input, select, textarea').all();
  console.log(`Total: ${inputs.length}\n`);
  for (let i = 0; i < inputs.length; i++) {
    const tipo = await inputs[i].getAttribute('type');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const value = await inputs[i].getAttribute('value');
    console.log(`[${i}] <input type="${tipo}" placeholder="${placeholder}" value="${value}" />`);
  }
  console.log('');

  // 7. ESTRUCTURA HTML PRINCIPAL (solo los tags principales)
  console.log('📌 [INFO 7] ESTRUCTURA HTML PRINCIPAL');
  console.log('-'.repeat(70));
  const html = await page.content();
  
  // Extraer solo los primeros 3000 caracteres útiles
  const startBody = html.indexOf('<body');
  const endHead = html.indexOf('</body>');
  const bodyContent = html.substring(startBody, Math.min(startBody + 3000, endHead));
  
  console.log('Fragmento del HTML:');
  console.log(bodyContent.substring(0, 1500));
  console.log('\n...(continuación omitida por brevedad)\n');

  // 8. VERIFICAR SI HAY IFRAMES
  console.log('📌 [INFO 8] IFRAMES EN LA PÁGINA');
  console.log('-'.repeat(70));
  const iframes = await page.locator('iframe').all();
  console.log(`Total de iframes: ${iframes.length}`);
  for (let i = 0; i < iframes.length; i++) {
    const src = await iframes[i].getAttribute('src');
    const id = await iframes[i].getAttribute('id');
    console.log(`[${i}] id="${id}" src="${src}"`);
  }
  console.log('');

  // 9. ELEMENTOS HIDDEN
  console.log('📌 [INFO 9] ELEMENTOS OCULTOS (hidden, display:none, visibility:hidden)');
  console.log('-'.repeat(70));
  const hidden = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const hiddenElements = [];
    
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || el.hasAttribute('hidden')) {
        const texto = el.textContent?.substring(0, 50) || '';
        if (texto.toLowerCase().includes('semanal')) {
          hiddenElements.push({
            tag: el.tagName,
            text: texto,
            display: style.display,
            visibility: style.visibility
          });
        }
      }
    });
    
    return hiddenElements;
  });
  
  console.log(`Elementos ocultos con "semanal": ${hidden.length}`);
  hidden.forEach((el, i) => {
    console.log(`[${i}] <${el.tag}> "${el.text}" (display: ${el.display}, visibility: ${el.visibility})`);
  });
  console.log('');

  // 10. CAPTURAS DE PANTALLA
  console.log('📌 [INFO 10] CAPTURA DE PANTALLA');
  console.log('-'.repeat(70));
  await page.screenshot({ path: './debug-turno-full.png', fullPage: true });
  console.log('✅ Captura guardada en: debug-turno-full.png\n');

  // 11. VIEWPORT
  console.log('📌 [INFO 11] VIEWPORT Y TAMAÑO DE PÁGINA');
  console.log('-'.repeat(70));
  const viewport = page.viewportSize();
  const pageSize = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }));
  
  console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
  console.log(`Tamaño de página: ${pageSize.width}x${pageSize.height}\n`);

  // 12. VERIFICACIÓN DE ELEMENTOS ESPECÍFICOS
  console.log('📌 [INFO 12] BÚSQUEDA DE ELEMENTOS ESPECÍFICOS');
  console.log('-'.repeat(70));
  
  const busquedas = [
    { selector: 'text=/nuevo/i', desc: 'Botón "Nuevo"' },
    { selector: 'text=/crear/i', desc: 'Botón "Crear"' },
    { selector: 'text=/turno/i', desc: 'Palabra "Turno"' },
    { selector: '[data-cy*="turno"]', desc: 'Elementos con data-cy turno' },
    { selector: '[class*="turno"]', desc: 'Elementos con class turno' },
    { selector: 'button:has-text("Nuevo")', desc: 'Button con "Nuevo"' },
    { selector: 'button:has-text("Crear")', desc: 'Button con "Crear"' },
  ];
  
  for (const busqueda of busquedas) {
    const count = await page.locator(busqueda.selector).count();
    console.log(`${busqueda.desc}: ${count > 0 ? '✅ ' + count : '❌ 0'}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('✅ DEBUG COMPLETADO');
  console.log('='.repeat(70) + '\n');

  expect(true).toBe(true);
});
