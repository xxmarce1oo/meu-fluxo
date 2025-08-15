// src/app/(app)/dashboard/page.tsx

import { getUserProjects, getTodaysUserLogs } from "@/lib/project-service";
import TimeTracker from "@/components/TimeTracker";
import TimeLogList from "@/components/TimeLogList";

export default async function DashboardPage() {
  const [projects, todaysLogs] = await Promise.all([
    getUserProjects(),
    getTodaysUserLogs()
  ]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Pronto para começar a trabalhar?</p>
      </div>

      <TimeTracker projects={projects} />

      <div className="mt-8">
        <TimeLogList logs={todaysLogs} />
      </div>
    </div>
  );
}