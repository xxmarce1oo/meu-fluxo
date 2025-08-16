// src/app/api/projects/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";

// Tipagem para os dados de um Projeto
interface ProjectData {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  estimatedHours: number;
  details?: string; // Adicionado
  notes?: string;   // Adicionado
}
export async function POST(request: Request) {
  // 1. Proteger a rota
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // 2. Pegar os dados do corpo da requisição (ATUALIZADO)
  const { name, estimatedHours, details } = await request.json(); // Adicionado 'details'
  if (!name || estimatedHours === undefined) {
    return NextResponse.json({ error: "Nome e tempo estimado são obrigatórios" }, { status: 400 });
  }

  const hours = Number(estimatedHours);
  if (isNaN(hours) || hours < 0) {
      return NextResponse.json({ error: "Tempo estimado deve ser um número positivo" }, { status: 400 });
  }

  // 3. Criar e salvar o novo projeto (ATUALIZADO)
  const projectId = nanoid();
  const projectData: ProjectData = {
    id: projectId,
    name,
    userId,
    createdAt: Date.now(),
    estimatedHours: hours,
    details: details || "", // Salva os detalhes ou uma string vazia
    notes: "", // Inicia as observações como uma string vazia
  };

  await kv.hset(`project:${projectId}`, projectData as unknown as Record<string, unknown>);
  await kv.sadd(`projects:by-user:${userId}`, projectId);

  // 4. Retornar o projeto criado
  return NextResponse.json(projectData, { status: 201 });
}

export async function GET() {
  // 1. Proteger a rota
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // 2. Buscar os IDs de todos os projetos do usuário
  const projectIds = await kv.smembers(`projects:by-user:${userId}`);

  if (projectIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // 3. Buscar os detalhes de cada projeto
  const pipeline = kv.pipeline();
  projectIds.forEach(id => pipeline.hgetall(`project:${id}`));
  const projects = await pipeline.exec<ProjectData[]>();

  // 4. Retornar a lista de projetos
  return NextResponse.json(projects, { status: 200 });
}