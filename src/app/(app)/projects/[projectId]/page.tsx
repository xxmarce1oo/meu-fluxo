// src/app/(app)/projects/[projectId]/page.tsx

import { getProjectById, getProjectObservations, getProjectTimeLogs } from "@/lib/project-service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProjectObservations from "@/components/ProjectObservations";
import ActivityTimerView from "@/components/ActivityTimerView";
import TimeLogList from "@/components/TimeLogList";

interface ProjectDetailsPageProps {
  params: Promise<{ 
    projectId: string;
  }>;
}

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const [observations, timeLogs] = await Promise.all([
    getProjectObservations(projectId),
    getProjectTimeLogs(projectId)
  ]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground">
          {project.estimatedHours} horas estimadas
        </p>
        <ActivityTimerView projectId={project.id} />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Details and Observations */}
        <div className="space-y-8">
          <div className="bg-card p-4 rounded-md shadow-sm border">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.details || "Nenhum detalhe adicionado."}
            </p>
          </div>
          <ProjectObservations projectId={project.id} initialObservations={observations} />
        </div>

        {/* Right Column: Time Logs */}
        <div>
          <TimeLogList logs={timeLogs} />
        </div>
      </div>
    </div>
  );
}