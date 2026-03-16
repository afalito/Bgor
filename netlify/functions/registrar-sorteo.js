// Netlify Function: registrar-sorteo
// Recibe: nombre, guia, celular (JSON body)
// Llama a Google Apps Script (SORTEO_GAS_URL) vía GET
// GAS genera número aleatorio único, guarda en Sheets y lo devuelve
// Retorna { numero: '04729' } al cliente

exports.handler = async (event) => {
    // Solo POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // CORS preflight
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    const GAS_URL = process.env.SORTEO_GAS_URL;
    if (!GAS_URL) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Servidor no configurado. Falta SORTEO_GAS_URL.' })
        };
    }

    let nombre, guia, celular;
    try {
        const body = JSON.parse(event.body);
        nombre  = (body.nombre  || '').trim();
        guia    = (body.guia    || '').trim();
        celular = (body.celular || '').trim();
    } catch {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Cuerpo de solicitud inválido.' })
        };
    }

    if (!nombre || !guia || !celular) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Faltan campos requeridos: nombre, guia, celular.' })
        };
    }

    try {
        const params = new URLSearchParams({ nombre, guia, celular });
        const url = `${GAS_URL}?${params.toString()}`;

        const gasRes = await fetch(url, { method: 'GET', redirect: 'follow' });
        const text   = await gasRes.text();

        let gasData;
        try {
            gasData = JSON.parse(text);
        } catch {
            console.error('GAS respuesta no es JSON:', text);
            throw new Error('Respuesta inválida del servidor de sorteo.');
        }

        if (!gasData.success || !gasData.numero1 || !gasData.numero2) {
            throw new Error(gasData.error || 'Error en el servidor de sorteo.');
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ numero1: gasData.numero1, numero2: gasData.numero2 })
        };

    } catch (err) {
        console.error('ERROR registrar-sorteo:', err.message);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message })
        };
    }
};
