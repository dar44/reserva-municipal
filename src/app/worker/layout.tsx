import { ReactNode } from "react";
import WorkerNavBar from "@/components/WorkerNavBar";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
       <WorkerNavBar />
      <main className="flex-1 p-4 container mx-auto">{children}</main>
    </div>
  );
}