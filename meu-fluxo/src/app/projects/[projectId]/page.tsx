// src/app/projects/[projectId]/page.tsx

import { getProjectById } from "@/lib/project-service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import ProjectDetailsForm from "@/components/ProjectDetailsForm"; // <-- IMPORTAR

interface ProjectDetailsPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  // Proteger a página
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  // Buscar os dados do projeto específico
  const project = await getProjectById(params.projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header da Página */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        <p className="text-lg text-muted-foreground">
          {project.estimatedHours} horas estimadas
        </p>
      </div>

      {/* Usar o novo formulário interativo */}
     <div className="bg-card p-4 rounded-md shadow-sm border">
    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes</h2>
    {/* Renderiza o texto ou uma mensagem padrão */}
    <p className="text-muted-foreground whitespace-pre-wrap">
        {project.details || "Nenhum detalhe adicionado."}
    </p>
</div>
    </div>
  );
}