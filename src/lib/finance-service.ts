// src/lib/finance-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { TransactionData } from "@/types";

// Tipo auxiliar para representar os dados brutos como vêm do Vercel KV
type RawTransactionFromKV = Omit<TransactionData, "amount" | "date" | "createdAt" | "installments" | "currentInstallment"> & {
  amount: string;
  date: string;
  createdAt: string;
  installments?: string;
  currentInstallment?: string;
};

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
  
  // Tipamos o resultado do KV com nosso tipo auxiliar
  const transactionsFromKV = await pipeline.exec<RawTransactionFromKV[]>();

  // Filtra nulos e converte os campos para os tipos corretos
  const transactions = transactionsFromKV
    .filter((t): t is RawTransactionFromKV => !!t)
    .map((t): TransactionData => ({
      ...t,
      amount: parseFloat(t.amount || "0"),
      date: Number(t.date),
      createdAt: Number(t.createdAt),
      installments: t.installments ? Number(t.installments) : undefined,
      currentInstallment: t.currentInstallment ? Number(t.currentInstallment) : undefined,
    }));

  return transactions;
}