// src/app/api/finance/credit-cards/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { CreditCardData } from "@/types";

// Função para CRIAR um novo cartão de crédito
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  const { name, bank, lastFourDigits, creditLimit, dueDay, closingDay } = await request.json();

  // Validação dos dados de entrada
  if (!name || !bank || !lastFourDigits || typeof creditLimit !== 'number' || creditLimit <= 0 ||
      typeof dueDay !== 'number' || dueDay < 1 || dueDay > 31 ||
      typeof closingDay !== 'number' || closingDay < 1 || closingDay > 31) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const cardId = nanoid();
  const createdAt = Date.now();
  
  const cardData: CreditCardData = {
    id: cardId,
    userId,
    name,
    bank,
    lastFourDigits,
    creditLimit,
    dueDay,
    closingDay,
    isActive: true,
    createdAt,
  };

  // Salvar no Vercel KV
  await kv.hset(`credit-card:${cardId}`, cardData as unknown as Record<string, unknown>);
  // Adicionar a um índice para busca rápida, ordenado pela data de criação
  await kv.zadd(`credit-cards:by-user:${userId}`, { score: createdAt, member: cardId });

  return NextResponse.json(cardData, { status: 201 });
}

// Função para BUSCAR os cartões do usuário
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // Busca os IDs dos cartões, ordenados do mais recente para o mais antigo
  const cardIds = await kv.zrange(`credit-cards:by-user:${userId}`, 0, -1, { rev: true });

  if (cardIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // Busca os detalhes de cada cartão
  const pipeline = kv.pipeline();
  cardIds.forEach(id => pipeline.hgetall(`credit-card:${id}`));
  const cards = await pipeline.exec<CreditCardData[]>();

  return NextResponse.json(cards.filter(Boolean), { status: 200 });
}
