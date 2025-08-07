'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname.startsWith(href) ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between h-12 px-4">
        <Link href="/dashboard" className="text-lg font-semibold">ServiMunicipal</Link>
        <div className="space-x-2">
          <Link href="/recintos" className={linkClass("/recintos")}>Recintos</Link>
          <Link href="/cursos" className={linkClass("/cursos")}>Cursos</Link>
          <Link href="/reservas" className={linkClass("/reservas")}>Reservas</Link>
        </div>
        <Link href="/profile" className="text-sm">yo ▾</Link>
      </div>
    </nav>
  );
}