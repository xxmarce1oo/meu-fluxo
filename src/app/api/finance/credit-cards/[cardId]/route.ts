// src/app/api/finance/credit-cards/[cardId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { CreditCardData } from "@/types";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

// Função para ATUALIZAR um cartão
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;
  const { cardId } = await params;

  // Verificar se o cartão existe e pertence ao usuário
  const existingCard = await kv.hgetall(`credit-card:${cardId}`) as unknown as CreditCardData;
  if (!existingCard || existingCard.userId !== userId) {
    return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
  }

  const updateData = await request.json();
  
  // Validar apenas os campos que estão sendo atualizados
  if (updateData.creditLimit !== undefined && (typeof updateData.creditLimit !== 'number' || updateData.creditLimit <= 0)) {
    return NextResponse.json({ error: "Limite de crédito inválido" }, { status: 400 });
  }
  
  if (updateData.dueDay !== undefined && (typeof updateData.dueDay !== 'number' || updateData.dueDay < 1 || updateData.dueDay > 31)) {
    return NextResponse.json({ error: "Dia de vencimento inválido" }, { status: 400 });
  }
  
  if (updateData.closingDay !== undefined && (typeof updateData.closingDay !== 'number' || updateData.closingDay < 1 || updateData.closingDay > 31)) {
    return NextResponse.json({ error: "Dia de fechamento inválido" }, { status: 400 });
  }

  const updatedCard = { ...existingCard, ...updateData };
  
  // Salvar no Vercel KV
  await kv.hset(`credit-card:${cardId}`, updatedCard as unknown as Record<string, unknown>);

  return NextResponse.json(updatedCard, { status: 200 });
}

// Função para DELETAR um cartão
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;
  const { cardId } = await params;

  // Verificar se o cartão existe e pertence ao usuário
  const existingCard = await kv.hgetall(`credit-card:${cardId}`) as unknown as CreditCardData;
  if (!existingCard || existingCard.userId !== userId) {
    return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
  }

  // Remover do KV
  await kv.del(`credit-card:${cardId}`);
  // Remover do índice do usuário
  await kv.zrem(`credit-cards:by-user:${userId}`, cardId);

  return NextResponse.json({ message: "Cartão deletado com sucesso" }, { status: 200 });
}
