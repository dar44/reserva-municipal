//components/NavBar.tsx
'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import ProfileDropdown from "./ProfileDropdown";
import ProfileModal from "./ProfileModal";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `rounded-md text-sm font-medium transition-all duration-300 ${pathname.startsWith(href)
      ? "px-4 py-2.5 bg-primary text-primary-foreground shadow-sm"
      : "px-2 py-1 text-foreground/70 hover:px-4 hover:py-2.5 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
    }`;
  const [profileName, setProfileName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
          <Link href="/recintos" className="text-lg sm:text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
            ServiMunicipal
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/recintos" className={linkClass("/recintos")}>Recintos</Link>
            <Link href="/cursos" className={linkClass("/cursos")}>Cursos</Link>
            <Link href="/reservas" className={linkClass("/reservas")}>Reservas</Link>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-accent"
              >
                {profileName || ""} <span className="text-xs">▾</span>
              </button>
              {menuOpen && (
                <ProfileDropdown
                  onClose={() => setMenuOpen(false)}
                  onViewProfile={() => setProfileOpen(true)}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            <Link href="/recintos" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Recintos</Link>
            <Link href="/cursos" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Cursos</Link>
            <Link href="/reservas" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Reservas</Link>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
            {profileName && (
              <div className="px-4 py-3 mt-2 border-t border-border">
                <button type="button" onClick={() => { setMobileMenuOpen(false); setProfileOpen(true); }} className="text-sm text-foreground-secondary hover:text-foreground w-full text-left">
                  {profileName}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          onUpdated={setProfileName}
        />
      )}
    </nav>
  );
}