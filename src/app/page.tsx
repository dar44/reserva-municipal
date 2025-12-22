"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      {/* Skip Link para accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold text-foreground">ServiMunicipal</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2.5 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                aria-label="Ir a la página de inicio de sesión"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Crear una cuenta nueva"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="hero-heading">
          {/* Animated gradient orbs - decorativos, ocultos para lectores de pantalla */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              // Respetar preferencias de movimiento reducido
              style={{
                animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-96 h-96 bg-success/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                animationPlayState: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 border border-primary/20"
                role="status"
                aria-label="Etiqueta del sistema"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">Sistema de Reservas Inteligente</span>
              </motion.div>

              {/* Jerarquía visual clara - Refactoring UI */}
              <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                Reserva tus espacios{" "}
                <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
                  de forma simple y rápida
                </span>
              </h1>

              {/* Carga cognitiva reducida - mensaje claro y conciso */}
              <p className="text-xl sm:text-2xl text-foreground-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                Gestiona reservas de espacios, cursos y eventos municipales en una sola plataforma.
              </p>

              {/* Ley de Hick: solo 2 opciones claras */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                {/* Ley de Fitts: botón principal más grande y prominente */}
                <Link
                  href="/signup"
                  className="group px-10 py-5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 min-w-[200px] justify-center"
                  aria-label="Comenzar a usar la plataforma registrándote"
                >
                  Comenzar ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-10 py-5 bg-surface hover:bg-surface-secondary border-2 border-border hover:border-primary/30 rounded-xl font-semibold text-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[200px]"
                  aria-label="Ver características del sistema - desplazarse a la sección de características"
                >
                  Conocer más
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative scroll-mt-16" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Todo lo que necesitas
              </h2>
              <p className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto">
                Plataforma completa para ciudadanos, organizadores y administradores
              </p>
            </motion.div>

            {/* Ley de Miller: exactamente 3 características para memoria de trabajo óptima */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: "Reservas Simplificadas",
                  description: "Reserva espacios y cursos en segundos. Sistema intuitivo que te guía paso a paso.",
                  gradient: "from-primary/10 to-primary/5",
                  iconColor: "text-primary",
                },
                {
                  icon: MapPin,
                  title: "Ubicaciones Precisas",
                  description: "Encuentra fácilmente recintos y ubicaciones con mapas interactivos integrados.",
                  gradient: "from-success/10 to-success/5",
                  iconColor: "text-success",
                },
                {
                  icon: Users,
                  title: "Multi-rol",
                  description: "Diferentes perfiles para ciudadanos, organizadores, trabajadores y administradores.",
                  gradient: "from-info/10 to-info/5",
                  iconColor: "text-info",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                  role="article"
                  aria-labelledby={`feature-${index}`}
                >
                  <div
                    className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-${feature.iconColor.split('-')[1]}/30`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`} aria-hidden="true">
                      <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <h3 id={`feature-${index}`} className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-success p-12 sm:p-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" aria-hidden="true" />

              <div className="relative z-10">
                {/* Efecto de Posición en Serie: CTA importante al final */}
                <h2 id="cta-heading" className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  ¿Listo para empezar?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Únete a nuestra comunidad y gestiona tus reservas de forma eficiente
                </p>
                {/* Efecto Von Restorff: botón oscuro destaca claramente sobre fondo de gradiente */}
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-2xl transition-all hover:scale-105 hover:shadow-3xl border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                  aria-label="Crear cuenta gratuita y comenzar a usar el sistema ahora"
                >
                  Crear cuenta ahora
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-surface/50" role="contentinfo" aria-label="Pie de página">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" aria-hidden="true" />
              <span className="text-lg font-semibold text-foreground">ServiMunicipal</span>
            </div>
            <p className="text-sm text-foreground-secondary">
              © 2025 ServiMunicipal. Sistema de gestión de reservas municipales.
            </p>
            <nav className="flex items-center gap-6" aria-label="Enlaces del pie de página">
              <Link href="/login" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded" aria-label="Ir a iniciar sesión">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded" aria-label="Ir a registrarse">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
