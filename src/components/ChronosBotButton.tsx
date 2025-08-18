// src/components/ChronosBotControls.tsx
"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Importar para verificar o usuário
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';

export default function ChronosBotControls() {
  const { data: session, status } = useSession(); // Pegar dados da sessão
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [isLoading, setIsLoading] = useState<'start' | 'pause' | false>(false);

  // Lógica de exibição condicional
  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL === session?.user?.email;

  const handleApiCall = async (action: 'start' | 'pause') => {
    if (!activityName.trim()) {
      toast.error("Por favor, digite um nome para a atividade.");
      return;
    }
    
    setIsLoading(action);
    const endpoint = action === 'start' ? '/api/bot/start-chronos-activity' : '/api/bot/pause-chronos-activity';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro no servidor.');
      }
      
      toast.success(data.message);
      setIsOpen(false);
      setActivityName('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Se não for admin ou se a sessão estiver carregando, não renderiza nada
  if (status !== 'authenticated' || !isAdmin) {
    return null;
  }

  // Se for admin, renderiza o botão
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Bot className="mr-2 h-4 w-4" />
          Automatizar Chronos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automação de Atividade no Chronos</DialogTitle>
          <DialogDescription>
            Digite o nome da atividade para iniciar ou pausar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nome exato da Atividade"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button 
            onClick={() => handleApiCall('pause')} 
            disabled={!!isLoading}
            variant="outline"
          >
            <Pause className="mr-2 h-4 w-4" />
            {isLoading === 'pause' ? "Pausando..." : "Pausar Tarefa"}
          </Button>
          <Button 
            onClick={() => handleApiCall('start')} 
            disabled={!!isLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            {isLoading === 'start' ? "Iniciando..." : "Iniciar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}