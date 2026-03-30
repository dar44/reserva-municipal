/**
 * audit-admin.mjs
 * ───────────────
 * Lighthouse audit for the ADMIN role.
 *
 * Usage:  node scripts/lighthouse/audit-admin.mjs
 */

import { runAuditSuite } from './lighthouse-utils.mjs'

await runAuditSuite({
  role: 'admin',
  email: 'gloria@gmail.com',
  password: 'Jesucristo',
  pages: [
    // Panel principal
    '/admin/panel',
    // Recintos
    '/admin/recintos',
    '/admin/recintos/1',
    '/admin/recintos/nuevo',
    '/admin/recintos/1/editar',
    // Cursos
    '/admin/cursos',
    '/admin/cursos/3',
    '/admin/cursos/3/editar',
    '/admin/cursos/nuevo',
    // Usuarios
    '/admin/usuarios',
    '/admin/usuarios/462fdc0b-a951-4468-9327-5b280338c42c',
    '/admin/usuarios/nuevo',
    '/admin/usuarios/462fdc0b-a951-4468-9327-5b280338c42c/editar',
    // Reservas
    '/admin/reservas',
    '/admin/reservas/83/editar',
    // Perfil
    '/perfil',
  ],
})
