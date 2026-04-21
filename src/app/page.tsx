import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";

const ScrollToFeatures = dynamic(
  () => import("./scroll-to-features").then((mod) => mod.ScrollToFeatures),
  {
    loading: () => (
      <button
        className="px-10 py-5 bg-surface hover:bg-surface-secondary border-2 border-border hover:border-primary/30 rounded-xl font-semibold text-lg transition-all min-w-[200px]"
      >
        Conocer más
      </button>
    ),
  }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm" aria-label="Navegación principal">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
              ServiMunicipal
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex h-full items-center gap-3">
              <Link
                href="/public/recintos"
                className="h-full flex items-center justify-center px-4 my-2 rounded-none text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
              >
                Recintos
              </Link>
              <Link
                href="/public/cursos"
                className="h-full flex items-center justify-center px-4 my-2 rounded-none text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
              >
                Cursos
              </Link>
              <ThemeToggle />
            </div>

            {/* Right side: auth buttons */}
            <div className="flex h-full items-center gap-1">
              <Link
                href="/login"
                className="h-full flex items-center justify-center px-4 rounded-none text-sm font-medium transition-all duration-300 text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm hidden sm:flex"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="h-full flex items-center justify-center px-4 rounded-none text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
            <div
              className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full opacity-50 blur-[100px] will-change-transform"
            />
            <div
              className="absolute bottom-0 left-0 w-96 h-96 bg-primary/15 rounded-full opacity-50 blur-[100px] will-change-transform"
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 border border-primary/20"
                aria-hidden="true"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">Sistema de Reservas Inteligente</span>
              </div>

              {/* Jerarquía visual clara - Refactoring UI */}
              <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                Reserva tus espacios{" "}
                <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent">
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
                >
                  Comenzar ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <ScrollToFeatures />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative scroll-mt-16" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Todo lo que necesitas
              </h2>
              <p className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto">
                Plataforma completa para ciudadanos, organizadores y administradores
              </p>
            </div>

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
                  gradient: "from-primary/10 to-primary/5",
                  iconColor: "text-primary",
                },
                {
                  icon: Users,
                  title: "Multi-rol",
                  description: "Diferentes perfiles para ciudadanos, organizadores, trabajadores y administradores.",
                  gradient: "from-primary/10 to-primary/5",
                  iconColor: "text-primary",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                  role="article"
                  aria-labelledby={`feature-${index}`}
                >
                  <div
                    className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
          <div className="max-w-5xl mx-auto">
            <div
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-12 sm:p-16 text-center"
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" aria-hidden="true" />

              <div className="relative z-10">
                {/* Efecto de Posición en Serie: CTA importante al final */}
                <h2 id="cta-heading" className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
                  ¿Listo para empezar?
                </h2>
                <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
                  Únete a nuestra comunidad y gestiona tus reservas de forma eficiente
                </p>
                {/* Efecto Von Restorff: botón oscuro destaca claramente sobre fondo de gradiente */}
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-background hover:bg-surface text-foreground rounded-xl font-bold text-lg shadow-2xl transition-all hover:scale-105 hover:shadow-3xl border-2 border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-primary"
                >
                  Crear cuenta ahora
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-surface/50" role="contentinfo" aria-label="Pie de página">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
              ServiMunicipal
            </Link>
            <p className="text-sm text-foreground-secondary">
              © 2025 ServiMunicipal. Sistema de gestión de reservas municipales.
            </p>
            <nav className="flex items-center gap-6" aria-label="Enlaces del pie de página">
              <Link href="/public/recintos" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">
                Recintos
              </Link>
              <Link href="/public/cursos" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">
                Cursos
              </Link>
              <Link href="/login" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="text-sm text-foreground-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
