const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SITE = 'https://dar44.netlify.app';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const FOLDER_NAME = `dar44.netlify.app`;
const OUTPUT_PATH = `./auditorias-tfg/${FOLDER_NAME}`;
const HISTORY_PATH = `./auditorias-tfg/_historial_dar44.json`;

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   Auditoría de Rendimiento — dar44.netlify.app       ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`\n📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
console.log(`📁 Resultados en: ${OUTPUT_PATH}\n`);

try {
  const command = [
    'npx unlighthouse-ci',
    `--site ${SITE}`,
    '--build-static',
    `--output-path ${OUTPUT_PATH}`,
    '--no-cache',
    '--desktop',
  ].join(' ');

  console.log(`⚙️  Ejecutando: ${command}\n`);
  execSync(command, { stdio: 'inherit' });
  console.log(`\n✅ Auditoría completada.`);

} catch (error) {
  console.error('\n❌ Error durante la auditoría. Puede ser un bloqueo temporal o problema de red.');
}

// ──────────────────────────────────────────
// 1. Leer resultados del ci-result.json
// ──────────────────────────────────────────
function loadResults() {
  const jsonPath = path.join(OUTPUT_PATH, 'ci-result.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('\n⚠️  No se encontró ci-result.json. Saltando análisis.');
    return null;
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

// ──────────────────────────────────────────
// 2. Guardar en historial para comparar
// ──────────────────────────────────────────
function saveToHistory(results) {
  let history = [];
  if (fs.existsSync(HISTORY_PATH)) {
    try { history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')); } catch {}
  }
  history.push({ timestamp: TIMESTAMP, date: new Date().toLocaleString('es-ES'), results });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  console.log(`\n📊 Historial actualizado: ${HISTORY_PATH} (${history.length} entradas)`);
  return history;
}

// ──────────────────────────────────────────
// 3. Generar reporte HTML con historial
// ──────────────────────────────────────────
function generateReport(currentResults, history) {
  const formatScore = (val) => {
    if (val === undefined || val === null) return '<span class="score score-none">-</span>';
    const num = Math.round(val * 100);
    let cls = 'score-low';
    if (num >= 90) cls = 'score-high';
    else if (num >= 50) cls = 'score-medium';
    return `<span class="score ${cls}">${num}</span>`;
  };

  const avg = (routes, key) => {
    const vals = routes.filter(r => r[key] != null).map(r => Math.round(r[key] * 100));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const avgClass = (n) => {
    if (n == null) return 'score-none';
    if (n >= 90) return 'score-high';
    if (n >= 50) return 'score-medium';
    return 'score-low';
  };

  // Tabla de rutas actuales
  const routeRows = currentResults.map(r => `
    <tr>
      <td class="path">${r.path}</td>
      <td>${formatScore(r.score)}</td>
      <td>${formatScore(r.performance)}</td>
      <td>${formatScore(r.accessibility)}</td>
      <td>${formatScore(r['best-practices'])}</td>
      <td>${formatScore(r.seo)}</td>
    </tr>`).join('');

  // Historial de medias
  const historyRows = history.map(entry => {
    const rs = entry.results;
    const keys = ['score', 'performance', 'accessibility', 'best-practices', 'seo'];
    return `
    <tr>
      <td class="path">${entry.date}</td>
      ${keys.map(k => {
        const a = avg(rs, k);
        return `<td><span class="score ${avgClass(a)}">${a ?? '-'}</span></td>`;
      }).join('')}
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auditoría dar44.netlify.app — ${TIMESTAMP}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 2rem; text-align: center; }
    header h1 { font-size: 1.75rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; }
    header p { color: #bfdbfe; font-size: 0.95rem; }
    main { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
    h2 { font-size: 1.1rem; font-weight: 700; color: #93c5fd; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #334155; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 550px; }
    th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #334155; font-size: 0.875rem; }
    th { background: #0f172a; font-weight: 600; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    tr:hover td { background: #1a2744; }
    .path { font-family: monospace; color: #94a3b8; }
    .score { font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; text-align: center; display: inline-block; min-width: 40px; font-size: 0.85rem; }
    .score-high { background: #14532d; color: #86efac; }
    .score-medium { background: #713f12; color: #fde68a; }
    .score-low { background: #7f1d1d; color: #fca5a5; }
    .score-none { background: #1e293b; color: #64748b; border: 1px solid #334155; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .summary-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1rem; text-align: center; }
    .summary-card .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 0.5rem; }
    .summary-card .value { font-size: 2rem; font-weight: 800; }
    .value-high { color: #4ade80; }
    .value-medium { color: #facc15; }
    .value-low { color: #f87171; }
    .delta { font-size: 0.8rem; margin-top: 0.25rem; color: #64748b; }
    .delta-pos { color: #4ade80; }
    .delta-neg { color: #f87171; }
  </style>
</head>
<body>
  <header>
    <h1>🔍 Auditoría — dar44.netlify.app</h1>
    <p>Generado el ${new Date().toLocaleString('es-ES')} · Desktop mode</p>
  </header>
  <main>

    <!-- Medias actuales -->
    <div class="summary-grid">
      ${['score','performance','accessibility','best-practices','seo'].map(k => {
        const a = avg(currentResults, k);
        const label = { score:'Global', performance:'Rendimiento', accessibility:'Accesibilidad', 'best-practices':'B. Prácticas', seo:'SEO' }[k];
        const cls = a >= 90 ? 'value-high' : a >= 50 ? 'value-medium' : 'value-low';
        // Comparar con penúltima entrada del historial
        const prev = history.length >= 2 ? avg(history[history.length - 2].results, k) : null;
        const delta = prev != null ? a - prev : null;
        const deltaStr = delta != null ? `<div class="delta ${delta > 0 ? 'delta-pos' : delta < 0 ? 'delta-neg' : ''}">${delta > 0 ? '▲' : delta < 0 ? '▼' : '='} ${Math.abs(delta)} vs anterior</div>` : '';
        return `<div class="summary-card"><div class="label">${label}</div><div class="value ${cls}">${a ?? '–'}</div>${deltaStr}</div>`;
      }).join('')}
    </div>

    <!-- Tabla por ruta -->
    <div class="card">
      <h2>📄 Resultados por Ruta</h2>
      <table>
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Global</th>
            <th>Rendimiento</th>
            <th>Accesibilidad</th>
            <th>B. Prácticas</th>
            <th>SEO</th>
          </tr>
        </thead>
        <tbody>${routeRows}</tbody>
      </table>
    </div>

    <!-- Historial de medias -->
    ${history.length > 1 ? `
    <div class="card">
      <h2>📈 Historial de Medias</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Global</th>
            <th>Rendimiento</th>
            <th>Accesibilidad</th>
            <th>B. Prácticas</th>
            <th>SEO</th>
          </tr>
        </thead>
        <tbody>${historyRows}</tbody>
      </table>
    </div>` : ''}

  </main>
</body>
</html>`;

  const outPath = path.join(OUTPUT_PATH, `reporte_${TIMESTAMP}.html`);
  fs.writeFileSync(outPath, html);
  console.log(`\n📋 Reporte HTML generado: ${outPath}`);
  return outPath;
}

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
const results = loadResults();
if (results) {
  const history = saveToHistory(results);
  const reportPath = generateReport(results, history);

  // Mostrar resumen en consola
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│            RESUMEN DE MEDIAS                │');
  console.log('├──────────────────┬──────────────────────────┤');
  ['score','performance','accessibility','best-practices','seo'].forEach(k => {
    const label = { score:'Global         ', performance:'Rendimiento     ', accessibility:'Accesibilidad   ', 'best-practices':'B. Prácticas    ', seo:'SEO             ' }[k];
    const vals = results.filter(r => r[k] != null).map(r => Math.round(r[k] * 100));
    const a = vals.length ? Math.round(vals.reduce((a,b) => a+b,0) / vals.length) : '-';
    const bar = typeof a === 'number' ? '█'.repeat(Math.floor(a/10)) + '░'.repeat(10 - Math.floor(a/10)) : '';
    const status = typeof a === 'number' ? (a >= 90 ? '✅' : a >= 50 ? '⚠️ ' : '❌') : '❓';
    console.log(`│ ${label}│  ${String(a).padStart(3)}  ${bar} ${status} │`);
  });
  console.log('└─────────────────────────────────────────────┘');

  console.log('\n🚀 Iniciando servidor para ver el reporte completo...');
  console.log('   (Pulsa Ctrl+C cuando termines)\n');
  try {
    execSync(`npx http-server ./auditorias-tfg -c-1 -p 5001 -o ./auditorias-tfg/${FOLDER_NAME}/reporte_${TIMESTAMP}.html`, { stdio: 'inherit' });
  } catch {
    console.log('\nServidor cerrado.');
  }
}
