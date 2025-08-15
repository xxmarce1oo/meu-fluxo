// src/app/api/logs/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { nanoid } from "nanoid";
import { getProjectById } from "@/lib/project-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  const { projectId, description, startTime, endTime } = await request.json();

  if (!projectId || !startTime || !endTime) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  
  // Validação de segurança: verifica se o projeto pertence ao usuário
  const project = await getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }

  const logId = nanoid();
  const createdAt = Date.now();
  const duration = Math.round((endTime - startTime) / 1000); // Duração em segundos

  const logData = {
    id: logId,
    userId,
    projectId,
    description: description || "",
    startTime,
    endTime,
    duration,
    createdAt,
  };

  // Salvar dados no KV
  await kv.hset(`log:${logId}`, logData);
  // Adicionar aos índices
  await kv.zadd(`logs:by-user:${userId}`, { score: createdAt, member: logId });
  await kv.zadd(`logs:by-project:${projectId}`, { score: createdAt, member: logId });

  return NextResponse.json(logData, { status: 201 });
}