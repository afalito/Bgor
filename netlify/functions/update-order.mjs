import { neon } from '@neondatabase/serverless';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'PUT') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: cors });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const body = await req.json();
    const {
      order_id,
      nombre, apellido, celular,
      direccion, ciudad, departamento, indicaciones,
      items, subtotal, descuento,
      envio_prioritario, envio_costo, total,
    } = body;

    if (!order_id || !nombre || !celular || !items || !items.length) {
      return Response.json({ ok: false, error: 'Campos requeridos faltantes' }, { status: 400, headers: cors });
    }

    // Verificar que el pedido existe, el celular coincide, y está pendiente
    const existing = await sql`
      SELECT id, order_number, celular, status FROM orders WHERE id = ${order_id}
    `;

    if (!existing.length) {
      return Response.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404, headers: cors });
    }

    const order = existing[0];

    if (order.celular !== celular) {
      return Response.json({ ok: false, error: 'No autorizado' }, { status: 403, headers: cors });
    }

    if (order.status !== 'pendiente') {
      return Response.json({ ok: false, error: 'Pedido ya ' + order.status + ', no se puede modificar' }, { status: 400, headers: cors });
    }

    // Actualizar datos del pedido
    await sql`
      UPDATE orders SET
        nombre = ${nombre},
        apellido = ${apellido},
        celular = ${celular},
        direccion = ${direccion},
        ciudad = ${ciudad},
        departamento = ${departamento},
        indicaciones = ${indicaciones || ''},
        subtotal = ${subtotal},
        descuento = ${descuento || 0},
        envio_prioritario = ${envio_prioritario || false},
        envio_costo = ${envio_costo || 0},
        total = ${total},
        updated_at = NOW()
      WHERE id = ${order_id} AND status = 'pendiente'
    `;

    // Reemplazar items: eliminar viejos e insertar nuevos
    await sql`DELETE FROM order_items WHERE order_id = ${order_id}`;

    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id, producto, presentacion, tamano,
          cantidad, kg_total, precio_unitario, subtotal
        ) VALUES (
          ${order_id}, ${item.producto}, ${item.presentacion}, ${item.tamano || ''},
          ${item.cantidad}, ${item.kg_total || null}, ${item.precio_unitario}, ${item.subtotal}
        )
      `;
    }

    return Response.json({
      ok: true,
      order_number: order.order_number,
    }, { headers: cors });

  } catch (err) {
    console.error('update-order error:', err);
    return Response.json({ ok: false, error: 'Error interno' }, { status: 500, headers: cors });
  }
}

export const config = {
  path: '/.netlify/functions/update-order',
};
