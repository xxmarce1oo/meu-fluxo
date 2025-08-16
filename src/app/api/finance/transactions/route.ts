// src/app/api/finance/transactions/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { TransactionData } from "@/types";

// Função para CRIAR uma nova transação
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  const { description, amount, type } = await request.json();

  // Validação dos dados de entrada
  if (!description || typeof amount !== 'number' || amount <= 0 || !['income', 'expense'].includes(type)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const transactionId = nanoid();
  const createdAt = Date.now();
  
  const transactionData: TransactionData = {
    id: transactionId,
    userId,
    description,
    amount,
    type,
    date: createdAt, // Por padrão, usamos a data de criação, mas poderia ser um campo do formulário
    createdAt,
  };

  // Salvar no Vercel KV
  await kv.hset(`transaction:${transactionId}`, transactionData as any);
  // Adicionar a um índice para busca rápida, ordenado pela data
  await kv.zadd(`transactions:by-user:${userId}`, { score: createdAt, member: transactionId });

  return NextResponse.json(transactionData, { status: 201 });
}

// Função para BUSCAR as transações do usuário
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // Busca os IDs das transações, ordenados da mais recente para a mais antiga
  const transactionIds = await kv.zrange(`transactions:by-user:${userId}`, 0, -1, { rev: true });

  if (transactionIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // Busca os detalhes de cada transação
  const pipeline = kv.pipeline();
  transactionIds.forEach(id => pipeline.hgetall(`transaction:${id}`));
  const transactions = await pipeline.exec<TransactionData[]>();

  return NextResponse.json(transactions, { status: 200 });
}