// src/lib/project-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kv } from "@vercel/kv";

interface ProjectData {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  estimatedHours: number;
  details?: string; // Adicionado
  notes?: string;   // Adicionado
}

export async function getUserProjects() {
  // 1. Get the user session directly
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Não autorizado");
  }
  const userId = session.user.email;

  // 2. Fetch all project IDs for the user
  const projectIds = await kv.smembers(`projects:by-user:${userId}`);

  if (projectIds.length === 0) {
    return []; // Return an empty array if no projects exist
  }

  // 3. Fetch the details for each project
  const pipeline = kv.pipeline();
  projectIds.forEach(id => pipeline.hgetall(`project:${id}`));
  const projects = await pipeline.exec<ProjectData[]>();

  return projects;
}

export async function getProjectById(projectId: string) {
  // 1. Pega a sessão do usuário
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Não autorizado");
  }
  const userId = session.user.email;

  // 2. Busca os detalhes do projeto
  const project = await kv.hgetall(`project:${projectId}`);

  // 3. Validação de segurança
  if (!project || project.userId !== userId) {
    return null; // Retorna nulo se o projeto não for encontrado ou não pertencer ao usuário
  }

return project as unknown as ProjectData;
}