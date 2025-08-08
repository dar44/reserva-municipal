import { ReactNode } from "react";
import Link from "next/link";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto flex items-center justify-between h-12 px-4">
          <span className="font-semibold">ServiMunicipal</span>
          <Link href="/worker/panel" className="text-sm">Panel</Link>
          <span className="text-sm">Worker</span>
        </div>
      </nav>
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  );
}