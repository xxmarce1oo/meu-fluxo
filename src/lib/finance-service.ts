// src/lib/finance-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { TransactionData } from "@/types";

export async function getUserTransactions(): Promise<TransactionData[]> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return [];
  }
  const userId = session.user.email;

  const transactionIds = await kv.zrange(`transactions:by-user:${userId}`, 0, -1, { rev: true });

  if (transactionIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  transactionIds.forEach(id => pipeline.hgetall(`transaction:${id}`));
  
  // Usamos <any[]> para permitir a manipulação dos tipos antes de retornar
  const transactionsFromKV = await pipeline.exec<any[]>();

  // Filtra nulos e converte os campos para os tipos corretos
  const transactions = transactionsFromKV
    .filter(Boolean)
    .map((t): TransactionData => ({
      ...t,
      amount: parseFloat(t.amount || 0),
      date: Number(t.date),
      createdAt: Number(t.createdAt),
      installments: t.installments ? Number(t.installments) : undefined,
      currentInstallment: t.currentInstallment ? Number(t.currentInstallment) : undefined,
    }));

  return transactions;
}