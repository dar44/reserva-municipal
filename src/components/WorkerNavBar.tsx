'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProfileDropdown from "./ProfileDropdown";
import ProfileModal from "./ProfileModal";

export default function WorkerNavBar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname.startsWith(href) ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"
    }`;
  const [profileName, setProfileName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between h-12 px-4">
        <Link href="/worker/panel" className="text-lg font-semibold">
          ServiMunicipal
        </Link>
        <div className="space-x-2">
          <Link href="/worker/panel" className={linkClass("/worker/panel")}>Panel</Link>
          <Link href="/worker/recintos" className={linkClass("/worker/recintos")}>Recintos</Link>
          <Link href="/worker/cursos" className={linkClass("/worker/cursos")}>Cursos</Link>
          <Link href="/worker/reservas" className={linkClass("/worker/reservas")}>Reservas</Link>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="text-sm">
            {profileName || ""} ▾
          </button>
          {menuOpen && (
            <ProfileDropdown
              onClose={() => setMenuOpen(false)}
              onViewProfile={() => setProfileOpen(true)}
            />
          )}
        </div>
        {profileOpen && (
          <ProfileModal
            onClose={() => setProfileOpen(false)}
            onUpdated={setProfileName}
          />
        )}
      </div>
    </nav>
  );
}