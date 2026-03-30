/**
 * audit-citizen.mjs
 * ─────────────────
 * Lighthouse audit for the CITIZEN role.
 *
 * Usage:  node scripts/lighthouse/audit-citizen.mjs
 */

import { runAuditSuite } from './lighthouse-utils.mjs'

await runAuditSuite({
  role: 'citizen',
  email: 'citizen@example.com',
  password: 'Jesucristo',
  pages: [
    // Catálogo de recintos
    '/recintos',
    '/recintos/1',
    '/cursos/5',
    // Catálogo de cursos
    '/cursos',
    // Mis reservas
    '/reservas',
    // Perfil
    '/perfil',
  ],
})
