import { neon } from '@neondatabase/serverless';

const PHONE = '573209216434';

const LINKS = {
  monogastricos: 'Hola, tengo un cupón de 20,000 pesos SMS y quiero redimirlo. La especie de animales que tengo es: Monogástricos (cerdos y aves)',
  poligastricos: 'Hola, tengo un cupón de 20,000 pesos SMS y quiero redimirlo. La especie de animales que tengo es: Poligástricos (bovinos, caprinos, ovinos)',
  equinos: 'Hola, tengo un cupón de 20,000 pesos SMS y quiero redimirlo. La especie de animales que tengo es: Equinos (caballos)',
  general: 'Hola, tengo un cupón de 20,000 pesos SMS y quiero redimirlo.',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const slug = url.pathname.replace('/contacto/', '').replace(/\/$/, '');

  const message = LINKS[slug];
  if (!message) {
    return new Response('Link no válido', { status: 404 });
  }

  const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

  // Registrar clic en background (no bloquea el redirect)
  try {
    const sql = neon(process.env.DATABASE_URL);
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const ua = req.headers.get('user-agent') || null;
    await sql`
      INSERT INTO link_clicks (slug, ip_address, user_agent)
      VALUES (${slug}, ${ip}, ${ua})
    `;
  } catch (e) {
    console.error('click track error:', e);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: waUrl },
  });
}

export const config = {
  path: ['/contacto/monogastricos', '/contacto/poligastricos', '/contacto/equinos', '/contacto/general'],
};
