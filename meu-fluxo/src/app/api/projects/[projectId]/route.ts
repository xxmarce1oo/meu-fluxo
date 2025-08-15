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

  // 1. Proteger a rota e pegar o usuário
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // 2. Pegar os novos dados do corpo da requisição
  const { name, estimatedHours, details, notes } = await request.json();

  // 3. Segurança: Verificar se o projeto pertence ao usuário
  const project: { userId?: string } | null = await kv.hgetall(
    `project:${projectId}`
  );
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Projeto não encontrado ou não pertence a você" }, { status: 404 });
  }

  // 4. Montar o objeto de atualização apenas com os campos fornecidos
  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (estimatedHours !== undefined) {
      const hours = Number(estimatedHours);
      if (!isNaN(hours) && hours >= 0) {
        updateData.estimatedHours = hours;
      }
  }
  if (details !== undefined) updateData.details = details;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
  }

  // 5. Atualizar o projeto no banco de dados
  await kv.hset(`project:${projectId}`, updateData);

  return NextResponse.json({ message: "Projeto atualizado com sucesso" }, { status: 200 });
}