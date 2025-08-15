// src/components/ProjectActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";
import ProjectEditForm from "./ProjectEditionForm"; // Corrected component name

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
      await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Falha ao deletar o projeto", error);
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