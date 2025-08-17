// src/components/LoginButton.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Github, LogOut } from "lucide-react";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { 
        callbackUrl: "/dashboard",
        redirect: true 
      });
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Button disabled className="w-full">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Carregando...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-lg font-medium">Olá, {session.user?.name}!</p>
          <p className="text-sm text-gray-600">{session.user?.email}</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          disabled={isLoading}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoading ? "Saindo..." : "Sair"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2 py-3 text-lg"
    >
      <Github className="h-5 w-5" />
      {isLoading ? "Entrando..." : "Entrar com GitHub"}
    </Button>
  );
}