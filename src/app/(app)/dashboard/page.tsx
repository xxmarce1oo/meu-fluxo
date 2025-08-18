// src/app/(app)/dashboard/page.tsx
import { getUserProjects } from "@/lib/project-service";
import { getUserProgressReport } from "@/lib/analytics-service";
import GoalCircle from "@/components/GoalCircle";
import TimeTracker from "@/components/TimeTracker";
import ChronosBotManager from "@/components/ChronosBotManager";
import { getRecentActivityFeed } from "@/lib/dashboard-service"; // 1. Importar o novo serviço
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed"; // 2. Importar o novo componente

export default async function DashboardPage() {
  // Busca todos os dados necessários para o dashboard em paralelo
  const [projects, progressReport, recentActivity] = await Promise.all([
    getUserProjects(),
    getUserProgressReport(),
    getRecentActivityFeed() // 3. Chamar a nova função
  ]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Sua visão geral de produtividade e finanças.</p>
        </div>
        <div className="flex items-center gap-2">
            <ChronosBotManager />
        </div>
      </div>
      
      {/* Componente principal do cronômetro */}
      <TimeTracker projects={projects} />

      {/* Grid para organizar os cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna do Feed de Atividades (ocupa 2/3 da largura em telas grandes) */}
        <RecentActivityFeed items={recentActivity} />

        {/* Coluna das Metas (ocupa 1/3 da largura em telas grandes) */}
        <div className="space-y-6">
          <GoalCircle label="Meta Diária" completed={progressReport.daily.completed} goal={progressReport.daily.goal} />
          <GoalCircle label="Meta Semanal" completed={progressReport.weekly.completed} goal={progressReport.weekly.goal} />
          <GoalCircle label="Meta Mensal" completed={progressReport.monthly.completed} goal={progressReport.monthly.goal} />
        </div>
      </div>
    </div>
  );
}