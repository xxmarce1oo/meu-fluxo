// src/app/api/projects/[projectId]/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  // 1. Proteger a rota e pegar o usuário
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // 2. Segurança: Verificar se o projeto pertence ao usuário
  const project: { userId?: string } | null = await kv.hgetall(
    `project:${projectId}`
  );
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Projeto não encontrado ou não pertence a você" }, { status: 404 });
  }

  // 3. Deletar o projeto (usando pipeline para garantir que ambos comandos executem)
  const pipeline = kv.pipeline();
  pipeline.del(`project:${projectId}`); // Deleta os detalhes do projeto
  pipeline.srem(`projects:by-user:${userId}`, projectId); // Remove o ID do set do usuário
  await pipeline.exec();

  return NextResponse.json({ message: "Projeto deletado" }, { status: 200 });
}


export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  // 1. Protect the route and get the user
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // 2. Get the new data from the request body
  const { name, estimatedHours } = await request.json();
  if (!name || estimatedHours === undefined) {
    return NextResponse.json({ error: "Nome e tempo estimado são obrigatórios" }, { status: 400 });
  }

  // 3. Security: Verify the project belongs to the user
  const project: { userId?: string } | null = await kv.hgetall(
    `project:${projectId}`
  );
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Projeto não encontrado ou não pertence a você" }, { status: 404 });
  }

  // 4. Update the project data in the database
  const hours = Number(estimatedHours);
  if (isNaN(hours) || hours < 0) {
      return NextResponse.json({ error: "Tempo estimado deve ser um número positivo" }, { status: 400 });
  }

  await kv.hset(`project:${projectId}`, { name, estimatedHours: hours });

  return NextResponse.json({ message: "Projeto atualizado com sucesso" }, { status: 200 });
}