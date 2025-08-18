// src/app/(app)/dashboard/page.tsx

import { getUserProjects, getTodaysUserLogs } from "@/lib/project-service";
import TimeTracker from "@/components/TimeTracker";
import { getUserProgressReport } from "@/lib/analytics-service";
import GoalCircle from "@/components/GoalCircle";
import TimeLogList from "@/components/TimeLogList"; // <-- Garantir que a lista está importada
import ChronosBotButton from "@/components/ChronosBotButton"; // <-- Importe o novo componente

export default async function DashboardPage() {
  // Agora buscamos os 3 conjuntos de dados em paralelo
  const [projects, progressReport, todaysLogs] = await Promise.all([
    getUserProjects(),
    getUserProgressReport(),
    getTodaysUserLogs() // <-- Adicionar a busca dos logs de hoje de volta
  ]);

   return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Seu progresso de hoje, pronto para começar?</p>
        </div>
        <ChronosBotButton /> {/* <-- Adicione o botão aqui */}
      </div>
      

      {/* Seção de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GoalCircle label="Meta Diária" completed={progressReport.daily.completed} goal={progressReport.daily.goal} />
        <GoalCircle label="Meta Semanal" completed={progressReport.weekly.completed} goal={progressReport.weekly.goal} />
        <GoalCircle label="Meta Mensal" completed={progressReport.monthly.completed} goal={progressReport.monthly.goal} />
      </div>

      {/* Componente principal do cronômetro */}
      <TimeTracker projects={projects} />

      {/* Lista de registros de hoje (ADICIONADA DE VOLTA) */}
      <div className="mt-8">
        <TimeLogList logs={todaysLogs} />
      </div>
    </div>
  );
}