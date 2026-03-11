exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
    if (!sheetsUrl) {
        console.error('GOOGLE_SHEETS_URL no configurado');
        return { statusCode: 500, body: JSON.stringify({ error: 'GOOGLE_SHEETS_URL not set' }) };
    }

    try {
        const params = new URLSearchParams(event.body);
        const getUrl = `${sheetsUrl}?${params.toString()}`;

        const response = await fetch(getUrl, {
            method: 'GET',
            redirect: 'follow'
        });

        const responseText = await response.text();
        console.log('Apps Script status:', response.status, '| body:', responseText);

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('ERROR save-to-sheets:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
