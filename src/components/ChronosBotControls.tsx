// src/components/ChronosBotControls.tsx
"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "./ui/button";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface ChronosBotControlsProps {
  projectName: string;
}

export default function ChronosBotControls({ projectName }: ChronosBotControlsProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<'start' | 'pause' | false>(false);

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL === session?.user?.email;

  const handleApiCall = async (action: 'start' | 'pause') => {
    // Apenas a ação 'start' precisa do nome do projeto
    if (action === 'start' && !projectName) {
      toast.error("O nome do projeto não está disponível.");
      return;
    }
    
    setIsLoading(action);
    const endpoint = action === 'start' ? '/api/bot/start-chronos-activity' : '/api/bot/pause-chronos-activity';
    
    // O body só é necessário para a ação 'start'
    const body = action === 'start' ? JSON.stringify({ activityName: projectName }) : null;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro no servidor.');
      }
      
      toast.success(data.message);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== 'authenticated' || !isAdmin) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => handleApiCall('start')} 
        disabled={!!isLoading}
        variant="outline"
        size="sm"
      >
        <Play className="mr-2 h-4 w-4" />
        {isLoading === 'start' ? "Iniciando..." : "Iniciar no Chronos"}
      </Button>
      <Button 
        onClick={() => handleApiCall('pause')} 
        disabled={!!isLoading}
        variant="destructive"
        size="sm"
      >
        <Pause className="mr-2 h-4 w-4" />
        {isLoading === 'pause' ? "Pausando..." : "Pausar no Chronos"}
      </Button>
    </div>
  );
}