// src/app/projects/[projectId]/page.tsx

import { getProjectById, getProjectObservations } from "@/lib/project-service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProjectObservations from "@/components/ProjectObservations";

interface ProjectDetailsPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  // Buscar dados do projeto e das observações em paralelo para mais performance
  const [project, observations] = await Promise.all([
    getProjectById(params.projectId),
    getProjectObservations(params.projectId)
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground">
          {project.estimatedHours} horas estimadas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção de Detalhes */}
        <div className="bg-card p-4 rounded-md shadow-sm border">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {project.details || "Nenhum detalhe adicionado."}
          </p>
        </div>

        {/* Seção de Observações Interativa */}
        <ProjectObservations projectId={project.id} initialObservations={observations} />
      </div>
    </div>
  );
}