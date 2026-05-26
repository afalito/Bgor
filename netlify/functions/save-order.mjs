import { neon } from '@neondatabase/serverless';

export default async function handler(req) {
  // CORS
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

  const sql = neon(process.env.DATABASE_URL);

  try {
    const body = await req.json();
    const {
      landing,
      nombre, apellido, celular,
      direccion, ciudad, departamento, indicaciones,
      items, subtotal, descuento,
      envio_prioritario, envio_costo, total,
    } = body;

    // Validación básica
    if (!nombre || !celular || !items || !items.length) {
      return Response.json({ ok: false, error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Obtener landing_id por slug
    const landingRows = await sql`
      SELECT id FROM landings WHERE slug = ${landing || 'bgor-monogastricos'} LIMIT 1
    `;
    if (!landingRows.length) {
      return Response.json({ ok: false, error: 'Landing no registrada' }, { status: 400 });
    }
    const landingId = landingRows[0].id;

    // UTM params (si vienen en el body)
    const utm_source = body.utm_source || null;
    const utm_medium = body.utm_medium || null;
    const utm_campaign = body.utm_campaign || null;

    // IP y User Agent desde headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const ua = req.headers.get('user-agent') || null;

    // Insertar order
    const orderRows = await sql`
      INSERT INTO orders (
        landing_id, nombre, apellido, celular,
        direccion, ciudad, departamento, indicaciones,
        subtotal, descuento, envio_prioritario, envio_costo, total,
        ip_address, user_agent, utm_source, utm_medium, utm_campaign
      ) VALUES (
        ${landingId}, ${nombre}, ${apellido}, ${celular},
        ${direccion}, ${ciudad}, ${departamento}, ${indicaciones || ''},
        ${subtotal}, ${descuento || 0}, ${envio_prioritario || false}, ${envio_costo || 0}, ${total},
        ${ip}::inet, ${ua}, ${utm_source}, ${utm_medium}, ${utm_campaign}
      )
      RETURNING id, order_number
    `;

    const orderId = orderRows[0].id;
    const orderNumber = orderRows[0].order_number;

    // Insertar items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id, producto, presentacion, tamano,
          cantidad, kg_total, precio_unitario, subtotal
        ) VALUES (
          ${orderId}, ${item.producto}, ${item.presentacion}, ${item.tamano || ''},
          ${item.cantidad}, ${item.kg_total || null}, ${item.precio_unitario}, ${item.subtotal}
        )
      `;
    }

    return Response.json({
      ok: true,
      order_id: orderId,
      order_number: orderNumber,
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    console.error('save-order error:', err);
    return Response.json({ ok: false, error: 'Error interno' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export const config = {
  path: '/.netlify/functions/save-order',
};
