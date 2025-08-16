// src/app/(app)/projects/page.tsx
"use client"; // Precisa ser um client component para usar a animação

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ProjectCreationForm from "@/components/ProjectCreationForm";
import { ProjectData } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const { status } = useSession();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
      return;
    }

    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status]);

  const handleProjectCreated = () => {
    fetchProjects(); // Recarrega a lista quando um projeto é criado
  };

  // Animação container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Atraso entre cada cartão
      }
    }
  };

  // Animação de cada item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meus Projetos</h1>
        <ProjectCreationForm onProjectCreated={handleProjectCreated} />
      </div>

      <div>
        {projects.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center text-center text-gray-500 mt-16 border-2 border-dashed rounded-lg p-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FolderKanban className="h-12 w-12 mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold">Nenhum projeto encontrado</h2>
            <p className="mt-2">Clique em &quot;+ Novo Projeto&quot; para começar a organizar suas atividades.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {projects.map((project: ProjectData) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}