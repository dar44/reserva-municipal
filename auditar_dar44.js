const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lista completa de plataformas para el análisis
const competencias = [
  "https://dar44.netlify.app",
  "https://servimunicipal.vercel.app"
];

console.log("Iniciando el proceso de auditoría general para el TFG...");

for (const site of competencias) {
  // Limpiamos la URL para crear un nombre de carpeta válido y limpio
  const folderName = site
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/[^\w.-]/g, '_');

  console.log(`\n========================================================`);
  console.log(`  Auditando competencia: ${site}`);
  console.log(`========================================================\n`);

  try {
    // Usamos 'unlighthouse-ci' para que el script se cierre correctamente y continúe con el siguiente.
    // Añadimos '--no-cache' para evitar que devuelva resultados antiguos y mida el performance real actual.
    // Añadimos '--desktop' de manera opcional en caso de que quieras comparar el rendimiento simulando ordenador.
    const command = `npx unlighthouse-ci --site ${site} --build-static --output-path ./auditorias-tfg/${folderName} --no-cache --desktop`;

    // Ejecutamos heredando el stdio para ver por consola el proceso tal cual
    execSync(command, { stdio: 'inherit' });

    console.log(`¡Auditoría de ${site} completada exitosamente! Guardada en ./auditorias-tfg/${folderName}`);


  } catch (error) {
    console.error(`Ha habido algún error escaneando ${site}. (Posible bloqueo anti-bots o ruta inaccesible).`);
  }
}

console.log("\n¡Proceso finalizado! Todas las auditorías estáticas se han guardado en la carpeta '/auditorias-tfg'.");

function generateOfflineSummary() {
  console.log("\nGenerando reporte offline resumen...");
  const baseDir = './auditorias-tfg-dar44';
  if (!fs.existsSync(baseDir)) return;

  const folders = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen de Auditorías - TFG</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #f9fafb; color: #111827; }
    h1 { color: #1f2937; text-align: center; margin-bottom: 2rem; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow-x: auto; }
    .site-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #2563eb; text-decoration: none; display: inline-block; }
    .site-title:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; min-width: 600px; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; color: #4b5563; }
    .score { font-weight: bold; padding: 0.25rem 0.5rem; border-radius: 9999px; text-align: center; display: inline-block; width: 45px; font-size: 0.875rem; }
    .score-high { background: #dcfce7; color: #166534; }
    .score-medium { background: #fef08a; color: #854d0e; }
    .score-low { background: #fee2e2; color: #991b1b; }
    .score-none { background: #f3f4f6; color: #9ca3af; }
    .path-link { color: #4b5563; font-family: monospace; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Resumen de Rendimiento (Offline)</h1>
`;

  let hasData = false;

  for (const folder of folders) {
    const jsonPath = path.join(baseDir, folder, 'ci-result.json');
    if (!fs.existsSync(jsonPath)) continue;

    hasData = true;
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      html += `  <div class="card">
    <a href="./${folder}/index.html" class="site-title" title="Abrir reporte original (puede requerir servidor local)">${folder.replace(/_/g, '/')}</a>
    <table>
      <thead>
        <tr>
          <th>Ruta</th>
          <th>Score Global</th>
          <th>Rendimiento</th>
          <th>Accesibilidad</th>
          <th>B. Prácticas</th>
          <th>SEO</th>
        </tr>
      </thead>
      <tbody>`;

      data.forEach(route => {
        const formatScore = (val) => {
          if (val === undefined || val === null) return '<span class="score score-none">-</span>';
          const num = Math.round(val * 100);
          let cls = 'score-low';
          if (num >= 90) cls = 'score-high';
          else if (num >= 50) cls = 'score-medium';
          return `<span class="score ${cls}">${num}</span>`;
        };

        html += `
        <tr>
          <td class="path-link">${route.path}</td>
          <td>${formatScore(route.score)}</td>
          <td>${formatScore(route.performance)}</td>
          <td>${formatScore(route.accessibility)}</td>
          <td>${formatScore(route['best-practices'])}</td>
          <td>${formatScore(route.seo)}</td>
        </tr>`;
      });

      html += `
      </tbody>
    </table>
  </div>\n`;
    } catch (e) {
      console.error("Error leyendo JSON de " + folder, e);
    }
  }

  html += `
</body>
</html>`;

  if (hasData) {
    const outPath = path.join(baseDir, 'indice_offline.html');
    fs.writeFileSync(outPath, html);
    console.log(`¡Índice generado con éxito en: ${outPath}!`);
    console.log("Puedes abrir el archivo 'indice_offline.html' directamente en tu navegador sin necesidad de servidor local.");
  } else {
    console.log("No se encontraron archivos ci-result.json para generar el resumen.");
  }
}

// Generamos el índice primero por si el servidor nunca se inicia o se cierra
generateOfflineSummary();

console.log("\nIniciando servidor local para poder visualizar la 'vista general' completa original...");
console.log("(Pulsa Ctrl+C en esta consola cuando termines de ver los reportes para cerrar el servidor)");

try {
  // 'http-server' creará un servidor local apuntando a nuestra carpeta y abrirá el navegador ('-o') automáticamente en el puerto 5000.
  // Es necesario simular un servidor real para que la web de Unlighthouse de 'vista general' pueda cargar los archivos JS y JSON subyacentes.
  execSync('npx http-server ./auditorias-tfg -c-1 -p 5000 -o', { stdio: 'inherit' });
} catch (error) {
  console.log("\nServidor cerrado.");
}
