import { neon } from '@neondatabase/serverless';

export default async function handler(req) {
  // Basic auth
  const auth = req.headers.get('authorization');
  const expected = 'Basic ' + btoa(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASS}`);
  if (auth !== expected) {
    return new Response('Acceso denegado', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Stats"' },
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  // Total por link
  const totals = await sql`
    SELECT slug, COUNT(*) as clicks
    FROM link_clicks
    GROUP BY slug
    ORDER BY clicks DESC
  `;

  // Hoy por link
  const today = await sql`
    SELECT slug, COUNT(*) as clicks
    FROM link_clicks
    WHERE clicked_at >= CURRENT_DATE
    GROUP BY slug
    ORDER BY clicks DESC
  `;

  // Últimos 20 clics
  const recent = await sql`
    SELECT slug, clicked_at, ip_address
    FROM link_clicks
    ORDER BY clicked_at DESC
    LIMIT 20
  `;

  const totalAll = totals.reduce((a, r) => a + Number(r.clicks), 0);
  const todayAll = today.reduce((a, r) => a + Number(r.clicks), 0);

  const slugNames = {
    monogastricos: 'Monogástricos',
    poligastricos: 'Poligástricos',
    equinos: 'Equinos',
    general: 'General',
  };

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Campaña SMS — Clics</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;background:#f5f5f5;color:#333;padding:20px}
h1{font-size:22px;margin-bottom:4px}
.sub{color:#888;font-size:14px;margin-bottom:24px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px}
.card{background:#fff;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.card-num{font-size:32px;font-weight:800;color:#FF5700}
.card-label{font-size:12px;color:#888;margin-top:4px}
.card-today{font-size:13px;color:#2471a3;font-weight:600;margin-top:2px}
table{width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-collapse:collapse;margin-bottom:24px}
th{background:#333;color:#fff;padding:10px 12px;text-align:left;font-size:13px}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}
.links{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:24px}
.links h3{font-size:15px;margin-bottom:10px}
.link-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px}
.link-url{background:#f0f0f0;padding:4px 10px;border-radius:6px;font-family:monospace;font-size:12px;flex:1;word-break:break-all}
.copy-btn{background:#FF5700;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap}
.copy-btn:active{transform:scale(0.95)}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.b-mono{background:#e8f5e9;color:#2e7d32}
.b-poli{background:#e3f2fd;color:#1565c0}
.b-equi{background:#fff3e0;color:#e65100}
.b-gen{background:#f3e5f5;color:#7b1fa2}
</style>
</head>
<body>
<h1>Campaña SMS — Tracking de Clics</h1>
<p class="sub">Actualizado: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>

<div class="cards">
  <div class="card">
    <div class="card-num">${totalAll}</div>
    <div class="card-label">Clics totales</div>
    <div class="card-today">${todayAll} hoy</div>
  </div>
  ${['monogastricos', 'poligastricos', 'equinos', 'general'].map(s => {
    const t = totals.find(r => r.slug === s);
    const td = today.find(r => r.slug === s);
    return `<div class="card">
    <div class="card-num">${t ? t.clicks : 0}</div>
    <div class="card-label">${slugNames[s]}</div>
    <div class="card-today">${td ? td.clicks : 0} hoy</div>
  </div>`;
  }).join('')}
</div>

<div class="links">
  <h3>Links de la campaña</h3>
  ${['monogastricos', 'poligastricos', 'equinos', 'general'].map(s => `
  <div class="link-row">
    <span class="badge b-${s.substring(0,4)}">${slugNames[s]}</span>
    <span class="link-url">bgor.com.co/contacto/${s}</span>
    <button class="copy-btn" onclick="navigator.clipboard.writeText('https://bgor.com.co/contacto/${s}');this.textContent='Copiado!';setTimeout(()=>this.textContent='Copiar',1500)">Copiar</button>
  </div>`).join('')}
</div>

<table>
  <thead><tr><th>Último clic</th><th>Link</th><th>IP</th></tr></thead>
  <tbody>
  ${recent.length ? recent.map(r => `<tr>
    <td>${new Date(r.clicked_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td>
    <td><span class="badge b-${r.slug.substring(0,4)}">${slugNames[r.slug] || r.slug}</span></td>
    <td>${r.ip_address || '-'}</td>
  </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;color:#888">Sin clics aún</td></tr>'}
  </tbody>
</table>

<p style="text-align:center;color:#aaa;font-size:12px">Recarga la página para actualizar</p>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  path: '/contacto/stats',
};
