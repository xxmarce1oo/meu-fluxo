// src/app/page.tsx
"use client";

import LoginButton from "@/components/LoginButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já está logado, redirecionar para o dashboard
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Mostrar loading enquanto verifica a sessão
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Carregando...</p>
      </main>
    );
  }

  // Se já está logado, não mostrar a página de login
  if (session) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meu Fluxo
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          Gerencie seus projetos, tempo e finanças em um só lugar
        </p>
        
        <div className="space-y-4">
          <LoginButton />
          
          <div className="mt-8 text-sm text-gray-500">
            <p>✨ Controle de tempo</p>
            <p>📊 Gestão financeira</p>
            <p>🎯 Acompanhamento de metas</p>
          </div>
        </div>
      </div>
    </main>
  );
}