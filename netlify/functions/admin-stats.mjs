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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function pctConfirmacion(confirmado, gestionados) {
  if (!gestionados) return 0;
  return Math.round((confirmado / gestionados) * 1000) / 10;
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!verifyToken(token)) {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401, headers: cors });
  }

  if (req.method !== 'GET') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: cors });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const url = new URL(req.url);
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');

    // Parsear fechas. Si no vienen, usar rango muy amplio (todo).
    const from = fromParam ? new Date(fromParam).toISOString() : '1970-01-01T00:00:00Z';
    const to = toParam ? new Date(toParam).toISOString() : '2999-12-31T23:59:59Z';

    // Stats globales en rango
    const globalRows = await sql`
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status IS NULL OR status = 'pendiente' THEN 1 ELSE 0 END)::int AS pendiente,
        SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END)::int AS confirmado,
        SUM(CASE WHEN status = 'rechazado' THEN 1 ELSE 0 END)::int AS rechazado,
        SUM(CASE WHEN status = 'sin_comunicacion' THEN 1 ELSE 0 END)::int AS sin_comunicacion,
        COALESCE(SUM(total), 0)::numeric AS monto_total,
        COALESCE(SUM(CASE WHEN status = 'confirmado' THEN total ELSE 0 END), 0)::numeric AS monto_confirmado
      FROM orders
      WHERE created_at >= ${from} AND created_at <= ${to}
    `;
    const g = globalRows[0] || {};
    const gGestionados = (g.confirmado || 0) + (g.rechazado || 0) + (g.sin_comunicacion || 0);
    const global = {
      total: g.total || 0,
      pendiente: g.pendiente || 0,
      confirmado: g.confirmado || 0,
      rechazado: g.rechazado || 0,
      sin_comunicacion: g.sin_comunicacion || 0,
      gestionados: gGestionados,
      tasa_confirmacion: pctConfirmacion(g.confirmado || 0, gGestionados),
      tasa_confirmacion_total: pctConfirmacion(g.confirmado || 0, g.total || 0),
      monto_total: Number(g.monto_total || 0),
      monto_confirmado: Number(g.monto_confirmado || 0),
    };

    // Stats por landing en rango
    const byLandingRows = await sql`
      SELECT
        COALESCE(l.slug, 'sin-landing') AS landing_slug,
        COUNT(*)::int AS total,
        SUM(CASE WHEN o.status IS NULL OR o.status = 'pendiente' THEN 1 ELSE 0 END)::int AS pendiente,
        SUM(CASE WHEN o.status = 'confirmado' THEN 1 ELSE 0 END)::int AS confirmado,
        SUM(CASE WHEN o.status = 'rechazado' THEN 1 ELSE 0 END)::int AS rechazado,
        SUM(CASE WHEN o.status = 'sin_comunicacion' THEN 1 ELSE 0 END)::int AS sin_comunicacion,
        COALESCE(SUM(o.total), 0)::numeric AS monto_total,
        COALESCE(SUM(CASE WHEN o.status = 'confirmado' THEN o.total ELSE 0 END), 0)::numeric AS monto_confirmado
      FROM orders o
      LEFT JOIN landings l ON o.landing_id = l.id
      WHERE o.created_at >= ${from} AND o.created_at <= ${to}
      GROUP BY l.slug
      ORDER BY COUNT(*) DESC
    `;

    const byLanding = byLandingRows.map(function (r) {
      const gestionados = (r.confirmado || 0) + (r.rechazado || 0) + (r.sin_comunicacion || 0);
      return {
        landing_slug: r.landing_slug,
        total: r.total || 0,
        pendiente: r.pendiente || 0,
        confirmado: r.confirmado || 0,
        rechazado: r.rechazado || 0,
        sin_comunicacion: r.sin_comunicacion || 0,
        gestionados: gestionados,
        tasa_confirmacion: pctConfirmacion(r.confirmado || 0, gestionados),
        tasa_confirmacion_total: pctConfirmacion(r.confirmado || 0, r.total || 0),
        monto_total: Number(r.monto_total || 0),
        monto_confirmado: Number(r.monto_confirmado || 0),
      };
    });

    return Response.json({
      ok: true,
      range: { from, to },
      global,
      byLanding,
    }, { headers: cors });

  } catch (err) {
    console.error('admin-stats error:', err);
    return Response.json({ ok: false, error: 'Error interno' }, { status: 500, headers: cors });
  }
}

export const config = {
  path: '/.netlify/functions/admin-stats',
};
