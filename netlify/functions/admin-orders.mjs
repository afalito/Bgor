import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

function verifyToken(token) {
  const secret = process.env.ADMIN_PASS;
  const [payload, sig] = (token || '').split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!verifyToken(token)) {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401, headers: cors });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (id) {
        const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
        if (!rows.length) {
          return Response.json({ ok: false, error: 'No encontrado' }, { status: 404, headers: cors });
        }
        const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;
        return Response.json({ ok: true, order: { ...rows[0], items } }, { headers: cors });
      }

      const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return Response.json({ ok: true, orders }, { headers: cors });
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const { id } = body;
      if (!id) {
        return Response.json({ ok: false, error: 'ID requerido' }, { status: 400, headers: cors });
      }

      const toTs = v => (v && v.trim && v.trim()) ? v : null;

      await sql`
        UPDATE orders SET
          status = ${body.status || 'pendiente'},
          notas = ${body.notas || ''},
          contacto_1_fecha = ${toTs(body.contacto_1_fecha)},
          contacto_1_canal = ${body.contacto_1_canal || null},
          contacto_2_fecha = ${toTs(body.contacto_2_fecha)},
          contacto_2_canal = ${body.contacto_2_canal || null},
          contacto_3_fecha = ${toTs(body.contacto_3_fecha)},
          contacto_3_canal = ${body.contacto_3_canal || null},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      return Response.json({ ok: true }, { headers: cors });
    }

    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: cors });

  } catch (err) {
    console.error('admin-orders error:', err);
    return Response.json({ ok: false, error: 'Error interno' }, { status: 500, headers: cors });
  }
}

export const config = {
  path: '/.netlify/functions/admin-orders',
};
