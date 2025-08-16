// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Landmark, LayoutDashboard, Settings } from "lucide-react"; // Adicionar Settings

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Atividades", icon: FolderKanban },
  { href: "/settings", label: "Configurações", icon: Settings },
  { href: "/financeiro", label: "Financeiro", icon: Landmark }, // <-- NOVA LINHA
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background border-r w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] p-4">
      <nav className="flex flex-col gap-2">
        {navLinks.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? "bg-muted text-primary" : ""}`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}