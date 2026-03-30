/**
 * audit-organizer.mjs
 * ───────────────────
 * Lighthouse audit for the ORGANIZER role.
 *
 * Usage:  node scripts/lighthouse/audit-organizer.mjs
 */

import { runAuditSuite } from './lighthouse-utils.mjs'

await runAuditSuite({
  role: 'organizer',
  email: 'organizer@gmail.com',
  password: 'Jesucristo',
  pages: [
    // Panel principal
    '/organizer/panel',
    // Cursos
    '/organizer/cursos',
    // Recintos
    '/organizer/recintos',
    // Solicitudes
    '/organizer/solicitudes',
    // Perfil
    '/perfil',
  ],
})
