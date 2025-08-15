// src/components/TimeTracker.tsx
"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ProjectData } from "@/lib/project-service";
import { useRouter } from "next/navigation";
import { Play, Pause, StopCircle } from "lucide-react";
import { useTimerStore } from "@/lib/store/timerStore"; // <-- Importar a store

interface TimeTrackerProps {
  projects: ProjectData[];
}

// Função de formatação continua a mesma
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(v => (v < 10 ? "0" + v : v)).join(":");
};

export default function TimeTracker({ projects }: TimeTrackerProps) {
  const router = useRouter();
  // Pegar o estado e as ações da store global
  const { isRunning, isPaused, elapsedTime, description, selectedProject, actions } = useTimerStore();

  // Funções de manipulação agora chamam as ações da store
  const handleStart = () => {
    const project = projects.find(p => p.id === selectedProject?.id);
    if (!project) {
      alert("Por favor, selecione um projeto para iniciar.");
      return;
    }
    actions.startTimer(project, description);
  };

  const handleStop = async () => {
    await actions.stopTimer();
    router.refresh(); // Atualiza dados em outras páginas, como a de detalhes
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // Atualiza o projeto selecionado na store
      useTimerStore.setState({ selectedProject: project });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Atualiza a descrição na store
    useTimerStore.setState({ description: e.target.value });
  };

  const renderButtons = () => {
    if (!isRunning) {
      return <Button onClick={handleStart} className="w-full md:w-auto"><Play className="mr-2 h-4 w-4"/> Iniciar</Button>;
    }
    return (
      <div className="flex gap-2 w-full">
        {isPaused ? (
          <Button onClick={actions.resumeTimer} variant="outline" className="flex-1"><Play className="mr-2 h-4 w-4"/> Continuar</Button>
        ) : (
          <Button onClick={actions.pauseTimer} variant="outline" className="flex-1"><Pause className="mr-2 h-4 w-4"/> Pausar</Button>
        )}
        <Button onClick={handleStop} variant="destructive" className="flex-1"><StopCircle className="mr-2 h-4 w-4"/> Parar</Button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          type="text"
          placeholder="O que você está fazendo?"
          className="flex-grow"
          value={description}
          onChange={handleDescriptionChange}
          disabled={isRunning}
        />
        <Select onValueChange={handleSelectProject} value={selectedProject?.id} disabled={isRunning}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-2xl font-mono bg-background px-4 py-2 rounded-md w-full text-center md:w-auto">
            {formatTime(elapsedTime)}
          </div>
          <div className="w-full md:w-[220px]">
            {renderButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}