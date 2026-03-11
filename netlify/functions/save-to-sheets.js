const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz3ayUuYOWpUPjekIxyvdrRFY-xIcTZQcCERumfkFJKjCBZ-r6-q2jxKiJhqDZdCpIM/exec';

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const params = new URLSearchParams(event.body);
        const getUrl = `${SHEETS_URL}?${params.toString()}`;

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
