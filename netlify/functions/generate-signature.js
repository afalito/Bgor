const crypto = require('crypto');

exports.handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Obtener el integrity secret desde las variables de entorno
        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

        if (!integritySecret) {
            console.error('WOMPI_INTEGRITY_SECRET no está configurado');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Error de configuración del servidor' })
            };
        }

        // Parsear el body de la petición
        const { reference, amountInCents } = JSON.parse(event.body);

        // Validar datos requeridos
        if (!reference || !amountInCents) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Faltan datos requeridos (reference, amountInCents)' })
            };
        }

        // Validar que amountInCents sea un número
        if (isNaN(amountInCents) || amountInCents <= 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'El monto debe ser un número válido mayor a cero' })
            };
        }

        // Generar la firma de integridad
        // Formato: reference + amountInCents + currency + integritySecret
        const currency = 'COP';
        const dataToSign = `${reference}${amountInCents}${currency}${integritySecret}`;

        // Crear hash SHA256
        const signature = crypto
            .createHash('sha256')
            .update(dataToSign)
            .digest('hex');

        console.log('Firma generada exitosamente para referencia:', reference);

        // Retornar la firma
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                signature: signature,
                reference: reference
            })
        };

    } catch (error) {
        console.error('Error al generar firma:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error interno del servidor' })
        };
    }
};
