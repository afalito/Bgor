import { neon } from '@neondatabase/serverless';

export default async function handler(req) {
  const sql = neon(process.env.DATABASE_URL);

  const existing = await sql`SELECT id, slug FROM landings WHERE slug = 'bgor-rumiantes' LIMIT 1`;
  if (existing.length) {
    return Response.json({ ok: true, message: 'Ya existe', landing: existing[0] });
  }

  const result = await sql`
    INSERT INTO landings (slug, nombre)
    VALUES ('bgor-rumiantes', 'B-GOR Rumiantes')
    RETURNING id, slug, nombre
  `;

  return Response.json({ ok: true, created: result[0] });
}
