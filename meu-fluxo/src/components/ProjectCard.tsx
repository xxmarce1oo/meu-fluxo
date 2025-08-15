// src/components/ProjectCard.tsx
"use client";

import Link from "next/link";
import ProjectActions from "./ProjectActions";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    estimatedHours?: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div className="p-4 border rounded-md shadow-sm bg-card text-card-foreground flex flex-col justify-between h-full hover:border-primary transition-colors">
        <div>
          <h3 className="font-bold text-lg">{project.name}</h3>
          <p className="text-sm text-muted-foreground">
            {project.estimatedHours} horas estimadas
          </p>
        </div>
        {/* This div stops the click on the buttons from navigating the page */}
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActions project={project} />
        </div>
      </div>
    </Link>
  );
}