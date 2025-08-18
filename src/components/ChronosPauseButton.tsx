// src/components/ChronosPauseButton.tsx
"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "./ui/button";
import { PauseCircle } from "lucide-react";
import { toast } from "sonner";

export default function ChronosPauseButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se o usuário logado é o admin definido nas variáveis de ambiente
  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL === session?.user?.email;

  const handlePause = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bot/pause-chronos-activity', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível pausar a atividade.');
      }
      
      toast.success(data.message);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Se não for o admin ou se a sessão ainda estiver carregando, não mostra nada
  if (status !== 'authenticated' || !isAdmin) {
    return null;
  }

  // Renderiza o botão de pausa global
  return (
    <Button 
      onClick={handlePause} 
      disabled={isLoading}
      variant="destructive"
    >
      <PauseCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Pausando..." : "Pausar Chronos"}
    </Button>
  );
}