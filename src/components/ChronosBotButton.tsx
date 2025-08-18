// src/components/ChronosBotButton.tsx
"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';

export default function ChronosBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartBot = async () => {
    if (!activityName.trim()) {
      toast.error("Por favor, digite um nome para a atividade.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/bot/start-chronos-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Bot className="mr-2 h-4 w-4" />
          Iniciar Atividade no Chronos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automatizar Início de Atividade</DialogTitle>
          <DialogDescription>
            Digite o nome da atividade que o bot deve criar e iniciar no Chronos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Nome da Atividade"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStartBot();
            }}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleStartBot} disabled={isLoading}>
            {isLoading ? "Executando..." : "Executar Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}