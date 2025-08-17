// src/components/ProjectActions.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import ProjectEditForm from "./ProjectEditionForm"; // Corrected component name
import DeleteProjectButton from "./DeleteProjectButton";
import { toast } from "sonner"; // Adicionar import do toast

interface ProjectActionsProps {
  project: {
    id: string;
    name: string;
    estimatedHours?: number;
  };
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Projeto deletado com sucesso!");
        
        // Se estamos na página de detalhes do projeto, redirecionar para a lista de projetos
        if (pathname.includes(`/projects/${project.id}`)) {
          router.push("/projects");
        } else {
          // Se estamos na lista de projetos, apenas refresh
          router.refresh();
        }
      } else {
        throw new Error("Falha ao deletar projeto");
      }
    } catch (error) {
      console.error("Falha ao deletar o projeto", error);
      toast.error("Falha ao deletar o projeto. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      {/* Pass the entire 'project' object as a single prop */}
      <ProjectEditForm project={project} />

      <DeleteProjectButton 
        projectName={project.name}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}