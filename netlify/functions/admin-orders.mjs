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
        const rows = await sql`
          SELECT o.*, l.slug AS landing_slug
          FROM orders o
          LEFT JOIN landings l ON o.landing_id = l.id
          WHERE o.id = ${id}
        `;
        if (!rows.length) {
          return Response.json({ ok: false, error: 'No encontrado' }, { status: 404, headers: cors });
        }
        const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;
        return Response.json({ ok: true, order: { ...rows[0], items } }, { headers: cors });
      }

      // Paginación + filtros server-side
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const pageSize = Math.min(500, Math.max(1, parseInt(url.searchParams.get('pageSize') || '100', 10)));
      const offset = (page - 1) * pageSize;
      const status = (url.searchParams.get('status') || '').trim();
      const search = (url.searchParams.get('search') || '').trim();

      const searchLike = '%' + search.toLowerCase() + '%';
      const hasSearch = search.length > 0;

      // Stats agregados — siempre del total, independientes del filtro/búsqueda
      const statsRows = await sql`
        SELECT
          COUNT(*)::int AS total,
          SUM(CASE WHEN status IS NULL OR status = 'pendiente' THEN 1 ELSE 0 END)::int AS pendiente,
          SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END)::int AS confirmado,
          SUM(CASE WHEN status = 'rechazado' THEN 1 ELSE 0 END)::int AS rechazado,
          SUM(CASE WHEN status = 'sin_comunicacion' THEN 1 ELSE 0 END)::int AS sin_comunicacion
        FROM orders
      `;
      const stats = statsRows[0] || { total: 0, pendiente: 0, confirmado: 0, rechazado: 0, sin_comunicacion: 0 };

      // Query con filtros condicionales — usa CASE para incluir/excluir cada cláusula sin SQL dinámico
      const countRows = await sql`
        SELECT COUNT(*)::int AS n
        FROM orders o
        LEFT JOIN landings l ON o.landing_id = l.id
        WHERE
          (${status} = '' OR
           (${status} = 'pendiente' AND (o.status IS NULL OR o.status = 'pendiente')) OR
           (${status} <> 'pendiente' AND o.status = ${status}))
          AND (${!hasSearch} OR
               LOWER(COALESCE(o.nombre,'') || ' ' || COALESCE(o.apellido,'') || ' ' || COALESCE(o.ciudad,'') || ' ' || COALESCE(o.celular,'') || ' ' || COALESCE(o.order_number::text,'') || ' ' || COALESCE(l.slug,'') || ' ' || COALESCE(o.notas,'')) LIKE ${searchLike})
      `;
      const filteredTotal = countRows[0]?.n || 0;

      const orders = await sql`
        SELECT o.*, l.slug AS landing_slug
        FROM orders o
        LEFT JOIN landings l ON o.landing_id = l.id
        WHERE
          (${status} = '' OR
           (${status} = 'pendiente' AND (o.status IS NULL OR o.status = 'pendiente')) OR
           (${status} <> 'pendiente' AND o.status = ${status}))
          AND (${!hasSearch} OR
               LOWER(COALESCE(o.nombre,'') || ' ' || COALESCE(o.apellido,'') || ' ' || COALESCE(o.ciudad,'') || ' ' || COALESCE(o.celular,'') || ' ' || COALESCE(o.order_number::text,'') || ' ' || COALESCE(l.slug,'') || ' ' || COALESCE(o.notas,'')) LIKE ${searchLike})
        ORDER BY o.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      return Response.json({
        ok: true,
        orders,
        page,
        pageSize,
        filteredTotal,
        totalPages: Math.max(1, Math.ceil(filteredTotal / pageSize)),
        stats,
      }, { headers: cors });
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
