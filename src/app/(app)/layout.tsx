// src/app/(app)/layout.tsx
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TimerEffect from "@/components/layout/TimerEffect"; // <-- IMPORTAR

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TimerEffect /> {/* <-- ADICIONAR AQUI */}
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pl-64 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}