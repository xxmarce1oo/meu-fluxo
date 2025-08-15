// src/app/projects/[projectId]/page.tsx

import { getProjectById } from "@/lib/project-service";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";

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

  // Se o projeto não existir ou não pertencer ao usuário, mostra página 404
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

      {/* Futuramente, aqui entrarão os outros componentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-4 rounded-md shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Detalhes</h2>
          <p className="text-muted-foreground">(Em breve: campo para editar os detalhes da atividade)</p>
        </div>
        <div className="bg-card p-4 rounded-md shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Observações</h2>
          <p className="text-muted-foreground">(Em breve: campo para editar observações e dificuldades)</p>
        </div>
      </div>
    </div>
  );
}