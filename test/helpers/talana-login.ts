import * as fs from 'fs';

// Cargar credenciales
const creds = JSON.parse(
  fs.readFileSync('data/credenciales.json', 'utf-8')
);

const BASE_URL = 'https://talana.com';
const LOGIN_PATH = '/es/remuneraciones/login-vue?next=/es/remuneraciones/#/';
const USUARIO = creds.usuario;
const CLAVE = creds.clave;

// Helper: Navegar con reintentos
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

// Helper: Iniciar sesión completa
export async function iniciarSesion(page: any) {
  try {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 1] Navegando a login...');
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   Login Path: ${LOGIN_PATH}`);
    console.log('═══════════════════════════════════════════════════════');
    
    await navegarConReintentos(page, BASE_URL + LOGIN_PATH, 3);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 2] Buscando campos de credenciales...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Campo usuario con selector correcto
    const campoUsuario = page.locator('[data-cy="talana-user-input"]');
    await campoUsuario.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Campo de usuario visible');
    
    await campoUsuario.fill(USUARIO);
    console.log(`✍️  Usuario ingresado: ***`);

    // Campo contraseña
    const campoPass = page.locator('input[type="password"]').first();
    await campoPass.waitFor({ state: 'visible', timeout: 15000 });
    await campoPass.fill(CLAVE);
    console.log('✍️  Contraseña ingresada');

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

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 4] Esperando pantalla de empresa...');
    console.log('═══════════════════════════════════════════════════════');
    
    let buttonCount = 0;
    let intentos = 0;
    const maxIntentos = 10;
    
    while (buttonCount < 2 && intentos < maxIntentos) {
      intentos++;
      await page.waitForTimeout(500);
      
      const allButtons = page.locator('button[type="submit"], button:has-text("Iniciar sesión"), button:has-text("Inicia sesión")');
      buttonCount = await allButtons.count();
      console.log(`   Intento ${intentos}: ${buttonCount} botones encontrados`);
      
      if (buttonCount >= 2) {
        console.log('✅ Pantalla de empresa cargada');
        break;
      }
    }

    if (buttonCount < 2) {
      console.log('⚠️  Solo se encontró 1 botón, asumiendo que la página está lista');
      await page.waitForTimeout(1000);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📍 [PASO 5] Haciendo click en botón final...');
    console.log('═══════════════════════════════════════════════════════');
    
    const todosBotones = page.locator('button');
    const totalBotones = await todosBotones.count();
    console.log(`   Total de botones en la página: ${totalBotones}`);
    
    const ultimoBoton = todosBotones.last();
    await ultimoBoton.waitFor({ state: 'visible', timeout: 10000 });
    
    const textoBoton = await ultimoBoton.textContent();
    console.log(`✅ Botón final encontrado: "${textoBoton}"`);
    
    await ultimoBoton.click();
    console.log('🔐 Click ejecutado en botón final');

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
    throw error;
  }
}
