/**
 * audit-public.mjs
 * ────────────────
 * Lighthouse audit for PUBLIC pages (no authentication required).
 *
 * Usage:  node scripts/lighthouse/audit-public.mjs
 */

import puppeteer from 'puppeteer'
import lighthouse from 'lighthouse'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const PAGES = [
  '/',
  '/login',
  '/signup',
]

function scoreLabel(score) {
  const v = Math.round(score * 100)
  if (v >= 90) return `\x1b[32m${v}\x1b[0m`
  if (v >= 50) return `\x1b[33m${v}\x1b[0m`
  return `\x1b[31m${v}\x1b[0m`
}

function scoreClass(v) {
  if (v >= 90) return 'good'
  if (v >= 50) return 'ok'
  return 'bad'
}

function generateSummaryHTML(results) {
  const rows = results
    .map(
      (r) => `
    <tr>
      <td>${r.url}</td>
      <td class="${scoreClass(r.performance)}">${r.performance}</td>
      <td class="${scoreClass(r.accessibility)}">${r.accessibility}</td>
      <td class="${scoreClass(r.bestPractices)}">${r.bestPractices}</td>
      <td class="${scoreClass(r.seo)}">${r.seo}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lighthouse Audit — Páginas Públicas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    h1 { font-size: 1.8rem; margin-bottom: .5rem; }
    .meta { color: #94a3b8; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: .75rem 1rem; text-align: left; border-bottom: 1px solid #1e293b; }
    th { background: #1e293b; color: #94a3b8; text-transform: uppercase; font-size: .75rem; letter-spacing: .05em; }
    td { font-size: .9rem; }
    .good { color: #4ade80; font-weight: 700; }
    .ok   { color: #facc15; font-weight: 700; }
    .bad  { color: #f87171; font-weight: 700; }
    tr:hover { background: #1e293b40; }
  </style>
</head>
<body>
  <h1>🔦 Lighthouse — PÁGINAS PÚBLICAS</h1>
  <p class="meta">Generado: ${new Date().toLocaleString('es-ES')} · ${results.length} páginas auditadas</p>
  <table>
    <thead>
      <tr><th>Página</th><th>Performance</th><th>Accessibility</th><th>Best Practices</th><th>SEO</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

async function main() {
  const outDir = path.resolve(__dirname, '..', '..', 'lighthouse-reports', 'public')
  fs.mkdirSync(outDir, { recursive: true })

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  🔦 Lighthouse Audit — PÁGINAS PÚBLICAS`)
  console.log(`  📄 ${PAGES.length} pages to audit`)
  console.log(`${'═'.repeat(60)}\n`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--remote-debugging-port=0', '--no-sandbox', '--disable-gpu'],
  })

  const port = new URL(browser.wsEndpoint()).port
  const results = []

  try {
    for (let i = 0; i < PAGES.length; i++) {
      const pagePath = PAGES[i]
      const fullUrl = `${BASE_URL}${pagePath}`
      const label = pagePath.replace(/\//g, '_').replace(/^_/, '') || 'home'

      console.log(`  [${i + 1}/${PAGES.length}] Auditing ${pagePath} ...`)

      try {
        const { lhr } = await lighthouse(fullUrl, {
          port: Number(port),
          output: 'json',
          logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          formFactor: 'desktop',
          screenEmulation: { disabled: true },
          throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
        })

        const scores = {
          url: pagePath,
          performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
          accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
          bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
          seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
        }
        results.push(scores)

        console.log(
          `           Perf: ${scoreLabel(lhr.categories.performance?.score ?? 0)}  ` +
          `A11y: ${scoreLabel(lhr.categories.accessibility?.score ?? 0)}  ` +
          `BP: ${scoreLabel(lhr.categories['best-practices']?.score ?? 0)}  ` +
          `SEO: ${scoreLabel(lhr.categories.seo?.score ?? 0)}`
        )

        fs.writeFileSync(path.join(outDir, `${label}.json`), JSON.stringify(lhr, null, 2))
      } catch (err) {
        console.error(`  ❌ Error auditing ${pagePath}: ${err.message}`)
        results.push({ url: pagePath, performance: 0, accessibility: 0, bestPractices: 0, seo: 0 })
      }
    }

    // Summary
    const avg = (key) => Math.round(results.reduce((s, r) => s + r[key], 0) / results.length)
    console.log(`\n${'─'.repeat(60)}`)
    console.log('  Página'.padEnd(30) + 'Perf'.padStart(6) + 'A11y'.padStart(6) + 'BP'.padStart(6) + 'SEO'.padStart(6))
    console.log(`  ${'─'.repeat(50)}`)
    for (const r of results) {
      console.log(`  ${r.url.padEnd(28)}${String(r.performance).padStart(6)}${String(r.accessibility).padStart(6)}${String(r.bestPractices).padStart(6)}${String(r.seo).padStart(6)}`)
    }
    console.log(`  ${'─'.repeat(50)}`)
    console.log(`  ${'PROMEDIO'.padEnd(28)}${String(avg('performance')).padStart(6)}${String(avg('accessibility')).padStart(6)}${String(avg('bestPractices')).padStart(6)}${String(avg('seo')).padStart(6)}`)

    fs.writeFileSync(path.join(outDir, `_summary.html`), generateSummaryHTML(results))
    console.log(`\n  📊 Resumen: lighthouse-reports/public/_summary.html\n`)
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
