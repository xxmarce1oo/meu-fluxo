// src/components/layout/LogoutButton.tsx
"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()} className="w-full text-left flex items-center">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sair</span>
    </button>
  );
}