// src/components/ProjectActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";
import ProjectEditForm from "./ProjectEditionForm"; // Corrected component name
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Projeto deletado com sucesso!");
        router.refresh();
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

      <Button 
        variant="destructive" 
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deletando...' : 'Deletar'}
      </Button>
    </div>
  );
}