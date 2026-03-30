/**
 * audit-worker.mjs
 * ────────────────
 * Lighthouse audit for the WORKER role.
 *
 * Usage:  node scripts/lighthouse/audit-worker.mjs
 */

import { runAuditSuite } from './lighthouse-utils.mjs'

await runAuditSuite({
  role: 'worker',
  email: 'tumulo@gmail.com',
  password: 'Jesucristo',
  pages: [
    // Panel principal
    '/worker/panel',
    // Recintos
    '/worker/recintos',
    '/worker/recintos/1/reservar',
    // Cursos
    '/worker/cursos',
    '/worker/cursos/5',
    '/worker/cursos/5/inscripcion',
    // Reservas
    '/worker/reservas',
    // Solicitudes
    '/worker/solicitudes',
    // Perfil
    '/perfil',
  ],
})
