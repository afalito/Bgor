/**
 * GOOGLE APPS SCRIPT — Sorteo Aniversario BGOR
 * =============================================
 * Genera DOS números ALEATORIOS únicos por inscrito, entre 00000–99999.
 * LockService garantiza que nunca se asigne el mismo número dos veces,
 * incluso si llegan múltiples requests al mismo tiempo.
 *
 * SETUP (hacerlo una sola vez):
 * ─────────────────────────────
 * 1. Ve a Google Sheets → crea un nuevo spreadsheet
 * 2. Renombra la hoja "Hoja 1" a exactamente: Sorteo Aniversario
 * 3. En la fila 1 escribe estos encabezados (uno por celda):
 *    A1: Fecha  |  B1: Nombre  |  C1: Guía  |  D1: Celular  |  E1: Número 1  |  F1: Número 2
 * 4. Ve a Extensions → Apps Script
 * 5. Borra el código de ejemplo y pega ESTE código completo
 * 6. Guarda (Ctrl+S)
 * 7. Clic en "Deploy" → "New deployment"
 * 8. Tipo: Web app
 * 9. Execute as: Me
 * 10. Who has access: Anyone  ← ¡importante! para que Netlify pueda llamarlo
 * 11. Clic "Deploy" → autoriza → copia la URL que aparece
 * 12. En Netlify → Site settings → Environment variables:
 *     Nombre: SORTEO_GAS_URL
 *     Valor:  [pega la URL del paso 11]
 * 13. Redeploy el sitio en Netlify (Deploys → Trigger deploy)
 */

function doGet(e) {
  const lock = LockService.getScriptLock();

  // Espera hasta 15 segundos para obtener el lock
  // (garantiza que requests simultáneos se procesen uno a la vez)
  try {
    lock.waitLock(15000);
  } catch (err) {
    return respuestaError('Servidor ocupado. Intenta de nuevo en unos segundos.');
  }

  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Sorteo Aniversario');

    if (!sheet) {
      return respuestaError('Hoja "Sorteo Aniversario" no encontrada. Revisa el setup.');
    }

    // ── Leer TODOS los números ya asignados (columnas E y F) ─────
    // Esto previene duplicados globales: nadie puede tener un número
    // que ya tenga otra persona, sea en el campo 1 o en el campo 2.
    const totalFilas = sheet.getLastRow();
    const numerosUsados = new Set();

    if (totalFilas > 1) {
      // Leemos columnas E y F desde fila 2 (saltamos la fila de encabezados)
      const datos = sheet.getRange(2, 5, totalFilas - 1, 2).getValues();
      datos.forEach(function(fila) {
        if (fila[0]) numerosUsados.add(String(fila[0])); // Número 1
        if (fila[1]) numerosUsados.add(String(fila[1])); // Número 2
      });
    }

    const MAX_INTENTOS = 500;

    // ── Generar Número 1 ─────────────────────────────────────────
    let numero1;
    let intentos1 = 0;
    do {
      numero1 = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
      if (++intentos1 > MAX_INTENTOS) {
        return respuestaError('No se pudo generar Número 1 único. Contacta a soporte.');
      }
    } while (numerosUsados.has(numero1));

    // Agregar número 1 al set para que número 2 no pueda repetirlo
    numerosUsados.add(numero1);

    // ── Generar Número 2 ─────────────────────────────────────────
    let numero2;
    let intentos2 = 0;
    do {
      numero2 = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
      if (++intentos2 > MAX_INTENTOS) {
        return respuestaError('No se pudo generar Número 2 único. Contacta a soporte.');
      }
    } while (numerosUsados.has(numero2));

    // ── Guardar fila en la hoja ──────────────────────────────────
    const nombre  = e.parameter.nombre  || '(sin nombre)';
    const guia    = e.parameter.guia    || '(sin guía)';
    const celular = e.parameter.celular || '(sin celular)';
    const fecha   = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    sheet.appendRow([fecha, nombre, guia, celular, numero1, numero2]);

    // ── Respuesta exitosa ────────────────────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, numero1: numero1, numero2: numero2 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error en doGet: ' + err.message);
    return respuestaError('Error interno: ' + err.message);

  } finally {
    // Liberar lock SIEMPRE, incluso si hubo error
    lock.releaseLock();
  }
}

function respuestaError(mensaje) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}
