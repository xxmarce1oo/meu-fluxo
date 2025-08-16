// src/app/api/projects/[projectId]/observations/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Segurança: Verificar se o projeto principal pertence ao usuário
  const project: { userId?: string } | null = await kv.hgetall(`project:${projectId}`);
  if (!project || project.userId !== session.user.email) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }

  const { text } = await request.json();
  if (!text) {
    return NextResponse.json({ error: "O texto da observação é obrigatório" }, { status: 400 });
  }

  // Criar a nova observação
  const observationId = nanoid();
  const createdAt = Date.now();
  const observationData = {
    id: observationId,
    text,
    createdAt,
    projectId: projectId,
  };

  // Salvar os dados
  await kv.hset(`observation:${observationId}`, observationData);
  await kv.zadd(`observations:by-project:${projectId}`, {
    score: createdAt,
    member: observationId,
  });

  return NextResponse.json(observationData, { status: 201 });
}