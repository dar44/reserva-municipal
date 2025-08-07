import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";

export default function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  );
}