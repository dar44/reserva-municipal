/**
 * audit-all.mjs
 * ─────────────
 * Runs ALL Lighthouse audit suites (public + all roles) sequentially.
 *
 * Usage:  node scripts/lighthouse/audit-all.mjs
 */

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const scripts = [
  'audit-public.mjs',
  'audit-citizen.mjs',
  'audit-worker.mjs',
  'audit-organizer.mjs',
  'audit-admin.mjs',
]

console.log('\n🚀 Starting full Lighthouse audit suite...\n')
console.log('   Make sure the dev server is running (npm run dev)\n')

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script)
  console.log(`\n▶️  Running ${script}...`)
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit', cwd: path.resolve(__dirname, '..', '..') })
  } catch (err) {
    console.error(`\n❌ ${script} failed — continuing with next suite...\n`)
  }
}

console.log('\n' + '═'.repeat(60))
console.log('  ✅ All audit suites completed!')
console.log('  📁 Reports saved in: lighthouse-reports/')
console.log('═'.repeat(60) + '\n')
