// src/components/ActivityTimerView.tsx
"use client";

import { useTimerStore } from "@/lib/store/timerStore";
import { Timer } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface ActivityTimerViewProps {
  projectId: string;
}

export default function ActivityTimerView({ projectId }: ActivityTimerViewProps) {
  // Conecta-se à store global para ler o estado do timer
  const { isRunning, isPaused, elapsedTime, selectedProject } = useTimerStore();

  // A condição principal: só renderiza se o timer estiver rodando PARA ESTE PROJETO
  if (!isRunning || selectedProject?.id !== projectId) {
    return null; // Não mostra nada se não for o projeto ativo
  }

  // Define a cor do indicador de status (verde para rodando, amarelo para pausado)
  const statusColor = isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse";

  return (
    <div className="mt-4 flex items-center gap-3 p-3 bg-card border rounded-lg">
      <Timer className="h-5 w-5 text-primary" />
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`}></span>
        <span className="font-semibold">{isPaused ? "Pausado" : "Tempo Ativo:"}</span>
      </div>
      <span className="text-lg font-mono text-muted-foreground">{formatTime(elapsedTime)}</span>
    </div>
  );
}