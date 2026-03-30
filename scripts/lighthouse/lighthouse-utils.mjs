/**
 * lighthouse-utils.mjs
 * ────────────────────
 * Shared helpers for authenticated Lighthouse audits.
 *
 * Usage (from a per-role script):
 *   import { runAuditSuite } from './lighthouse-utils.mjs'
 *   await runAuditSuite({ role, email, password, pages })
 */

import puppeteer from 'puppeteer'
import lighthouse from 'lighthouse'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

/* ------------------------------------------------------------------ */
/*  Login helper — calls /api/login and keeps the resulting cookies    */
/* ------------------------------------------------------------------ */
async function login(page, email, password) {
  // Navigate to the login page first so cookies are set on the right domain
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })

  // Perform login via the API (same as the SPA form does)
  const response = await page.evaluate(
    async (url, em, pw) => {
      const res = await fetch(`${url}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, password: pw }),
      })
      return { status: res.status, body: await res.json() }
    },
    BASE_URL,
    email,
    password
  )

  if (response.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${response.body?.message || response.status}`
    )
  }

  console.log(`  ✅ Logged in as ${email} (role: ${response.body.role})`)
  return response.body.role
}

/* ------------------------------------------------------------------ */
/*  Single page audit                                                 */
/* ------------------------------------------------------------------ */
async function auditPage(url, port, runnerResult) {
  const { lhr } = await lighthouse(url, {
    port,
    output: ['html', 'json'],
    logLevel: 'error',
    disableStorageReset: true,   // ← keeps auth cookies
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    screenEmulation: { disabled: true },
    throttling: {
      // Slight throttling for realistic but not extreme results
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
  })
  return lhr
}

/* ------------------------------------------------------------------ */
/*  Format a score as coloured text for the console                    */
/* ------------------------------------------------------------------ */
function scoreLabel(score) {
  const v = Math.round(score * 100)
  if (v >= 90) return `\x1b[32m${v}\x1b[0m`    // green
  if (v >= 50) return `\x1b[33m${v}\x1b[0m`    // yellow
  return `\x1b[31m${v}\x1b[0m`                  // red
}

/* ------------------------------------------------------------------ */
/*  Generate an HTML summary report for all pages                      */
/* ------------------------------------------------------------------ */
function generateSummaryHTML(role, results) {
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
  <title>Lighthouse Audit — ${role}</title>
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
  <h1>🔦 Lighthouse — Rol: ${role.toUpperCase()}</h1>
  <p class="meta">Generado: ${new Date().toLocaleString('es-ES')} · ${results.length} páginas auditadas</p>
  <table>
    <thead>
      <tr>
        <th>Página</th>
        <th>Performance</th>
        <th>Accessibility</th>
        <th>Best Practices</th>
        <th>SEO</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</body>
</html>`
}

function scoreClass(v) {
  if (v >= 90) return 'good'
  if (v >= 50) return 'ok'
  return 'bad'
}

/* ------------------------------------------------------------------ */
/*  Main entry point — runs full suite for one role                    */
/* ------------------------------------------------------------------ */
export async function runAuditSuite({ role, email, password, pages }) {
  const outDir = path.resolve(__dirname, '..', '..', 'lighthouse-reports', role)
  fs.mkdirSync(outDir, { recursive: true })

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  🔦 Lighthouse Audit — ${role.toUpperCase()}`)
  console.log(`  📧 ${email}`)
  console.log(`  📄 ${pages.length} pages to audit`)
  console.log(`${'═'.repeat(60)}\n`)

  // Launch browser with remote debugging so Lighthouse can connect
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--remote-debugging-port=0', '--no-sandbox', '--disable-gpu'],
  })

  const port = new URL(browser.wsEndpoint()).port

  try {
    // --- Login ---
    const page = await browser.newPage()
    await login(page, email, password)

    // --- Audit each page ---
    const results = []

    for (let i = 0; i < pages.length; i++) {
      const pagePath = pages[i]
      const fullUrl = `${BASE_URL}${pagePath}`
      const label = pagePath.replace(/\//g, '_').replace(/^_/, '') || 'home'

      console.log(
        `  [${i + 1}/${pages.length}] Auditing ${pagePath} ...`
      )

      try {
        const lhr = await auditPage(fullUrl, Number(port))

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

        // Save individual HTML report
        const htmlReport = lhr.artifacts ? undefined : lhr
        // Lighthouse returns report content in the 'report' field when output specified
        // Re-run is expensive, so we save the JSON
        const reportJson = JSON.stringify(lhr, null, 2)
        fs.writeFileSync(path.join(outDir, `${label}.json`), reportJson)
      } catch (err) {
        console.error(`  ❌ Error auditing ${pagePath}: ${err.message}`)
        results.push({
          url: pagePath,
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
          error: err.message,
        })
      }
    }

    // --- Summary ---
    console.log(`\n${'─'.repeat(60)}`)
    console.log('  RESUMEN:')
    console.log(`${'─'.repeat(60)}`)
    console.log(
      '  Página'.padEnd(45) +
      'Perf'.padStart(6) +
      'A11y'.padStart(6) +
      'BP'.padStart(6) +
      'SEO'.padStart(6)
    )
    console.log(`  ${'─'.repeat(56)}`)

    for (const r of results) {
      console.log(
        `  ${r.url.padEnd(43)}` +
        `${String(r.performance).padStart(6)}` +
        `${String(r.accessibility).padStart(6)}` +
        `${String(r.bestPractices).padStart(6)}` +
        `${String(r.seo).padStart(6)}`
      )
    }

    // Averages
    const avg = (key) =>
      Math.round(results.reduce((s, r) => s + r[key], 0) / results.length)
    console.log(`  ${'─'.repeat(56)}`)
    console.log(
      `  ${'PROMEDIO'.padEnd(43)}` +
      `${String(avg('performance')).padStart(6)}` +
      `${String(avg('accessibility')).padStart(6)}` +
      `${String(avg('bestPractices')).padStart(6)}` +
      `${String(avg('seo')).padStart(6)}`
    )

    // Save HTML summary
    const summaryHtml = generateSummaryHTML(role, results)
    fs.writeFileSync(path.join(outDir, `_summary.html`), summaryHtml)
    console.log(`\n  📊 Resumen HTML: lighthouse-reports/${role}/_summary.html`)
    console.log(`  📁 Informes JSON: lighthouse-reports/${role}/\n`)

    return results
  } finally {
    await browser.close()
  }
}
