// src/components/ChronosBotManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, PauseCircle } from "lucide-react"; // Trocamos PlayCircle por Bot
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';

export default function ChronosBotManager() {
  const { data: session, status } = useSession();
  
  const [activeTaskName, setActiveTaskName] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL === session?.user?.email;

  useEffect(() => {
    const savedTaskName = localStorage.getItem('activeChronosTask');
    if (savedTaskName) {
      setActiveTaskName(savedTaskName);
    }
  }, []);

  const handleStart = async () => {
    if (!newTaskName.trim()) {
      toast.error("Por favor, digite um nome para a atividade.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/bot/start-chronos-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityName: newTaskName }),
      });

      const data = await response.json();
      if (!response.ok) { throw new Error(data.error); }
      
      toast.success(data.message);
      setActiveTaskName(newTaskName);
      localStorage.setItem('activeChronosTask', newTaskName);
      
      setIsDialogOpen(false);
      setNewTaskName('');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeTaskName) {
        toast.error("Não há nenhuma tarefa ativa registrada para pausar.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bot/pause-chronos-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityName: activeTaskName }),
      });

      const data = await response.json();
      if (!response.ok) { throw new Error(data.error); }

      toast.success(data.message);
      setActiveTaskName(null);
      localStorage.removeItem('activeChronosTask');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== 'authenticated' || !isAdmin) {
    return null;
  }

  if (activeTaskName) {
    return (
      <Button onClick={handlePause} disabled={isLoading} variant="destructive">
        <PauseCircle className="mr-2 h-4 w-4" />
        {isLoading ? "Pausando..." : `Pausar "${activeTaskName}"`}
      </Button>
    );
  }

  // Se a tarefa estiver INATIVA, mostra o botão de INICIAR que abre um Dialog
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {/* ** MUDANÇA APLICADA AQUI ** */}
        <Button variant="secondary">
          <Bot className="mr-2 h-4 w-4" />
          Iniciar Atividade no Chronos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Atividade no Chronos</DialogTitle>
          <DialogDescription>
            Digite o nome da nova atividade que o bot deve criar e iniciar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nome da Atividade"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleStart} disabled={isLoading}>
            {isLoading ? "Executando..." : "Executar Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}