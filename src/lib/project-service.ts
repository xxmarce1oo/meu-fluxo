// src/lib/project-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";

export interface ProjectData {
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

export interface ObservationData {
  id: string;
  text: string;
  createdAt: number;
  projectId: string;
}

export async function getProjectObservations(projectId: string): Promise<ObservationData[]> {
  // (A validação de segurança já acontece em getProjectById, que será chamada antes)

  // Busca os IDs das observações, ordenados por data de criação (score)
  const observationIds = await kv.zrange(`observations:by-project:${projectId}`, 0, -1);

  if (observationIds.length === 0) {
    return [];
  }

  // Busca os detalhes de cada observação
  const pipeline = kv.pipeline();
  observationIds.forEach(id => pipeline.hgetall(`observation:${id}`));
  const observations = await pipeline.exec();

  return observations as ObservationData[];
}

export interface TimeLogData {
  id: string;
  userId: string;
  projectId: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number; // em segundos
  createdAt: number;
}

export async function getProjectTimeLogs(projectId: string): Promise<TimeLogData[]> {
  // Busca os IDs dos logs, ordenados do mais recente para o mais antigo
  const logIds = await kv.zrange(`logs:by-project:${projectId}`, 0, -1, { rev: true });

  if (logIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  logIds.forEach(id => pipeline.hgetall(`log:${id}`));
  const logs = await pipeline.exec();

  return logs as TimeLogData[];
}
export async function getTodaysUserLogs(): Promise<TimeLogData[]> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Não autorizado");
  }
  const userId = session.user.email;

  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

  // 1. Buscar TODOS os IDs de log do usuário, sem filtro de tempo
  const logIds = await kv.zrange(`logs:by-user:${userId}`, 0, -1, { rev: true });

  if (logIds.length === 0) {
    return [];
  }

  // 2. Buscar os detalhes de todos os logs
  const pipeline = kv.pipeline();
  logIds.forEach(id => pipeline.hgetall(`log:${id}`));
  const allLogs = await pipeline.exec<TimeLogData[]>();

  // 3. FILTRAR os logs no nosso código
  const todaysLogs = allLogs.filter(log => log && log.createdAt >= twentyFourHoursAgo);

  return todaysLogs;
}