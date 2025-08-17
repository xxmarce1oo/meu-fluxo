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

  const { 
    description, 
    amount, 
    type, 
    date, 
    category, 
    paidBy, 
    paymentMethod, 
    installments, 
    creditCard 
  } = await request.json();

  if (!description || typeof amount !== 'number' || amount <= 0 || !['income', 'expense'].includes(type) || !date || !paymentMethod) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Validação específica para crédito
  if (paymentMethod === 'credit' && (!creditCard || !installments || installments < 1)) {
    return NextResponse.json({ error: "Para pagamento no crédito, é necessário informar o cartão e número de parcelas" }, { status: 400 });
  }

  const transactionId = nanoid();
  const createdAt = Date.now();

  // Se for crédito parcelado, criar múltiplas transações
  if (paymentMethod === 'credit' && installments > 1) {
    const transactions = [];
    const installmentAmount = Math.round((amount / installments) * 100) / 100; // Arredondar para 2 casas decimais
    
    for (let i = 1; i <= installments; i++) {
      const installmentDate = new Date(date);
      installmentDate.setMonth(installmentDate.getMonth() + (i - 1)); // Adicionar meses para cada parcela
      
      const installmentTransactionId = nanoid();
      const transactionData: TransactionData = {
        id: installmentTransactionId,
        userId,
        description: `${description} (${i}/${installments})`,
        amount: installmentAmount,
        type,
        date: installmentDate.getTime(),
        createdAt,
        category: category || "Geral",
        paidBy: paidBy || "",
        paymentMethod,
        installments,
        currentInstallment: i,
        creditCard,
      };
      
      transactions.push(transactionData);
      
      // Salvar cada parcela no Vercel KV
      await kv.hset(`transaction:${installmentTransactionId}`, transactionData as unknown as Record<string, unknown>);
      await kv.zadd(`transactions:by-user:${userId}`, { score: installmentDate.getTime(), member: installmentTransactionId });
    }
    
    return NextResponse.json(transactions, { status: 201 });
  } else {
    // Transação única (à vista ou outros métodos de pagamento)
    const transactionData: TransactionData = {
      id: transactionId,
      userId,
      description,
      amount,
      type,
      date: date || createdAt,
      createdAt,
      category: category || "Geral",
      paidBy: paidBy || "",
      paymentMethod,
      installments: paymentMethod === 'credit' ? 1 : undefined,
      creditCard: paymentMethod === 'credit' ? creditCard : undefined,
    };

    // Salvar no Vercel KV
    await kv.hset(`transaction:${transactionId}`, transactionData as unknown as Record<string, unknown>);
    await kv.zadd(`transactions:by-user:${userId}`, { score: date || createdAt, member: transactionId });

    return NextResponse.json(transactionData, { status: 201 });
  }
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