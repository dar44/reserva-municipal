'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import ProfileDropdown from "./ProfileDropdown";
import { ThemeToggle } from "./ThemeToggle";

export default function WorkerNavBar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `h-full flex items-center justify-center px-4 my-2 rounded-none text-sm font-medium transition-all duration-300 ${pathname.startsWith(href)
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground/70 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
    }`;
  const [profileName, setProfileName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const userUid = user?.id;
      if (!userUid) return;
      const { data } = await supabase
        .from("users")
        .select("name")
        .eq("uid", userUid)
        .single();
      if (data?.name) setProfileName(data.name);
    };
    loadUser();
  }, []);

  return (
    <nav className="border-b border-border bg-surface shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/worker/panel" className="text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
            ServiMunicipal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex h-full items-center gap-3">
            <Link href="/worker/panel" className={linkClass("/worker/panel")}>Panel</Link>
            <Link href="/worker/recintos" className={linkClass("/worker/recintos")}>Recintos</Link>
            <Link href="/worker/cursos" className={linkClass("/worker/cursos")}>Cursos</Link>
            <Link href="/worker/solicitudes" className={linkClass("/worker/solicitudes")}>Solicitudes</Link>
            <Link href="/worker/reservas" className={linkClass("/worker/reservas")}>Reservas</Link>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-none hover:bg-accent"
              >
                {profileName || ""} <span className="text-xs">▾</span>
              </button>
              {menuOpen && (
                <ProfileDropdown
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-none hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            <Link href="/worker/panel" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors" onClick={() => setMobileMenuOpen(false)}>Panel</Link>
            <Link href="/worker/recintos" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors" onClick={() => setMobileMenuOpen(false)}>Recintos</Link>
            <Link href="/worker/cursos" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors" onClick={() => setMobileMenuOpen(false)}>Cursos</Link>
            <Link href="/worker/solicitudes" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors" onClick={() => setMobileMenuOpen(false)}>Solicitudes</Link>
            <Link href="/worker/reservas" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-none transition-colors" onClick={() => setMobileMenuOpen(false)}>Reservas</Link>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
            {profileName && (
              <div className="px-4 py-3 mt-2 border-t border-border space-y-1">
                <span className="block text-xs font-medium text-foreground-secondary mb-2">{profileName}</span>
                <Link
                  href="/perfil"
                  className="block px-2 py-2 text-sm font-medium hover:bg-accent rounded-none transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ver perfil
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    const res = await fetch('/api/logout', { method: 'POST' })
                    const body = await res.json().catch(() => ({}))
                    window.location.href = body?.redirectTo || '/login'
                  }}
                  className="block w-full text-left px-2 py-2 text-sm font-medium text-destructive hover:bg-error-subtle rounded-none transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
