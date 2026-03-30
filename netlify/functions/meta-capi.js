const crypto = require('crypto');

const PIXEL_ID = '2100044310527360';
const API_VERSION = 'v20.0';
const API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
    const digits = String(value || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    return digits.startsWith('57') ? digits : `57${digits}`;
}

function getHeader(event, key) {
    if (!event.headers) return '';
    return event.headers[key] || event.headers[key.toLowerCase()] || '';
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const accessToken = process.env.META_ACCESS_TOKEN_EQUINOS || process.env.META_ACCESS_TOKEN;
    if (!accessToken) {
        console.warn('[meta-capi] META_ACCESS_TOKEN_EQUINOS no configurado; omitiendo evento');
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ skipped: true, reason: 'token_not_configured' })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body || '{}');
    } catch (error) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Invalid JSON body' })
        };
    }

    const forwardedFor = getHeader(event, 'x-forwarded-for');
    const clientIp = forwardedFor.split(',')[0].trim() || getHeader(event, 'client-ip');
    const userAgent = getHeader(event, 'user-agent');

    const userData = {};

    if (data.fbp) userData.fbp = data.fbp;
    if (data.fbc) userData.fbc = data.fbc;
    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;

    const phone = normalizePhone(data.phone);
    const firstName = normalizeText(data.firstName);
    const lastName = normalizeText(data.lastName);
    const city = normalizeText(data.city);
    const state = normalizeText(data.state);

    if (phone) userData.ph = sha256(phone);
    if (firstName) userData.fn = sha256(firstName);
    if (lastName) userData.ln = sha256(lastName);
    if (city) userData.ct = sha256(city);
    if (state) userData.st = sha256(state);

    const payload = {
        data: [
            {
                event_name: data.eventName || 'PageView',
                event_time: Math.floor(Date.now() / 1000),
                event_id: data.eventId,
                action_source: 'website',
                event_source_url: data.sourceUrl || 'https://bgor.com.co/equinos',
                user_data: userData,
                custom_data: {
                    value: Number(data.value) || 0,
                    currency: data.currency || 'COP',
                    content_name: data.contentName,
                    content_category: data.contentCategory,
                    content_ids: Array.isArray(data.contentIds) ? data.contentIds : [],
                    content_type: data.contentType || 'product',
                    num_items: Number(data.numItems) || undefined
                }
            }
        ]
    };

    Object.keys(payload.data[0].custom_data).forEach((key) => {
        if (
            payload.data[0].custom_data[key] === undefined ||
            payload.data[0].custom_data[key] === '' ||
            (Array.isArray(payload.data[0].custom_data[key]) && payload.data[0].custom_data[key].length === 0)
        ) {
            delete payload.data[0].custom_data[key];
        }
    });

    try {
        const response = await fetch(`${API_URL}?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('[meta-capi] Status:', response.status, '| Body:', responseText);

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('[meta-capi] Error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
