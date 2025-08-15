// src/app/projects/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ProjectCreationForm from "@/components/ProjectCreationForm";
import { getUserProjects } from "@/lib/project-service";
import ProjectCard from "@/components/ProjectCard"; // <-- IMPORT THE NEW COMPONENT

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const projects = await getUserProjects();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meus Projetos</h1>
        <ProjectCreationForm />
      </div>

      <div>
        {projects.length === 0 ? (
          <p className="text-center text-gray-500 mt-16">Nenhum projeto encontrado. Crie um para começar!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Simply map over the projects and render the new card component */}
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}