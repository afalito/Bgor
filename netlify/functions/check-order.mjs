import { neon } from '@neondatabase/serverless';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'GET') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: cors });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const cel = url.searchParams.get('cel');

  if (!id || !cel) {
    return Response.json({ ok: false, error: 'Parámetros requeridos: id, cel' }, { status: 400, headers: cors });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const rows = await sql`
      SELECT o.* FROM orders o
      JOIN landings l ON o.landing_id = l.id
      WHERE o.id = ${id} AND o.celular = ${cel} AND l.slug = 'bgor-monogastricos'
      LIMIT 1
    `;

    if (!rows.length) {
      return Response.json({ ok: false, error: 'No encontrado' }, { status: 404, headers: cors });
    }

    const order = rows[0];
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;

    return Response.json({
      ok: true,
      status: order.status,
      order: { ...order, items },
    }, { headers: cors });

  } catch (err) {
    console.error('check-order error:', err);
    return Response.json({ ok: false, error: 'Error interno' }, { status: 500, headers: cors });
  }
}

export const config = {
  path: '/.netlify/functions/check-order',
};
