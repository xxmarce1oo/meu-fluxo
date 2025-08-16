// src/lib/finance-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { TransactionData } from "@/types";

export async function getUserTransactions(): Promise<TransactionData[]> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    // Retorna um array vazio se o usuário não estiver logado, 
    // em vez de lançar um erro, para proteger a rota sem quebrar a build.
    return [];
  }
  const userId = session.user.email;

  const transactionIds = await kv.zrange(`transactions:by-user:${userId}`, 0, -1, { rev: true });

  if (transactionIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  transactionIds.forEach(id => pipeline.hgetall(`transaction:${id}`));
  const transactions = await pipeline.exec<TransactionData[]>();

  // Filtra quaisquer resultados nulos que possam ter vindo do pipeline
  return transactions.filter(Boolean);
}