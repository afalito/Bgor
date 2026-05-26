import crypto from 'crypto';

function makeToken(user) {
  const secret = process.env.ADMIN_PASS;
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return payload + '.' + sig;
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const { user, pass } = await req.json();

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return Response.json({ ok: true, token: makeToken(user) }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  return Response.json({ ok: false, error: 'Credenciales inválidas' }, {
    status: 401,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export const config = {
  path: '/.netlify/functions/admin-login',
};
