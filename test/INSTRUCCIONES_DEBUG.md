# 🔍 Guía para Ejecutar el Debug Ultra-Detallado

## Paso 1: Copiar el archivo de test

Copia el archivo `debug-ultra-detallado.spec.ts` a tu carpeta de tests:
```bash
cp debug-ultra-detallado.spec.ts test/debug-ultra-detallado.spec.ts
```

## Paso 2: Ejecutar el test de debug

```bash
npx playwright test test/debug-ultra-detallado.spec.ts --reporter=list
```

## Paso 3: Revisar la salida

El test generará:
1. **Logs en consola** — Ver TODO lo que encontró
2. **Captura `debug-turno-full.png`** — Imagen visual de la página

## Paso 4: Buscar pistas en los logs

El test buscará específicamente:

### ✅ Si encuentras en los logs:
```
[INFO 2] TODOS LOS BOTONES EN LA PÁGINA
Total de botones: X

[0] ✅ "Nuevo" (activo)
[1] ✅ "Crear" (activo)
[2] ✅ "Semanal (Estándar)" (activo)
```
→ Entonces "Semanal" **SÍ existe** como botón. Necesitamos el selector correcto.

### ❌ Si encuentras:
```
[INFO 3] BÚSQUEDA DE "SEMANAL" EN LA PÁGINA
Ocurrencias de "Semanal": 0
```
→ Entonces "Semanal" **NO existe** en la página visible. Podría estar:
- En un elemento oculto
- En un iframe
- Requiere hacer clic en algo primero
- La página es diferente de lo esperado

### 🎯 Claves que buscar:

1. **¿Hay un botón "Nuevo" o "Crear"?**
   - Si sí → necesitamos hacer clic en él primero
   - Si no → la página es diferente

2. **¿Aparece "Semanal" en [INFO 3]?**
   - Si sí → está visible
   - Si no → revisa [INFO 9] para elementos ocultos

3. **¿Hay iframes [INFO 8]?**
   - Si sí → el contenido podría estar dentro de un iframe
   - Necesitaríamos cambiar a ese iframe antes de buscar

4. **¿Qué botones aparecen [INFO 2]?**
   - Copia el nombre exacto de cada botón
   - Esto nos dirá qué clickear

## Paso 5: Revisar la captura de pantalla

Abre `debug-turno-full.png` y observa:
- ¿Hay opciones visibles en la página?
- ¿Hay un modal o dialog abierto?
- ¿Qué botones ves?
- ¿Falta algo que deberías ver?

## Paso 6: Compartir resultados

Cuando ejecutes el test, **copia y pega TODA la salida** de consola aquí:
```
[Pega aquí la salida completa del test]
```

También describe qué ves en `debug-turno-full.png`:
```
[Describe aquí lo que ves en la captura de pantalla]
```

---

## Señales de alerta

Si ves estos mensajes, el test encontró algo interesante:

```
❌ NO SE ENCONTRÓ LA OPCIÓN SEMANAL
```
→ "Semanal" NO está visible. Revisa qué sí está.

```
[INFO 8] IFRAMES EN LA PÁGINA
Total de iframes: 1
```
→ Hay un iframe. El contenido podría estar dentro.

```
[INFO 9] ELEMENTOS OCULTOS (hidden, display:none, visibility:hidden)
Elementos ocultos con "semanal": 1
[0] <DIV> "Semanal (Estándar)" (display: none, visibility: visible)
```
→ ¡"Semanal" existe pero está oculto! Necesitamos hacer algo para mostrarlo.

---

## Resumen rápido

|Si ves...|Significa...|Siguiente paso|
|---------|-----------|--------------|
|"Semanal" en [INFO 2]|Existe como botón|Copiar el texto exacto del botón|
|"Semanal" en [INFO 3]|Existe pero no es botón|Buscar su tag HTML|
|"Semanal" en [INFO 9]|Está oculto|Hacer clic en algo para mostrarlo|
|"Nuevo" o "Crear" en [INFO 2]|Hay botón de creación|Clickear primero, luego buscar Semanal|
|iframes > 0|Contenido en iframe|Cambiar contexto a iframe|

