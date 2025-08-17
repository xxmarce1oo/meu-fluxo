// src/lib/credit-card-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { CreditCardData } from "@/types";

export async function getUserCreditCards(): Promise<CreditCardData[]> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return [];
  }
  const userId = session.user.email;

  const cardIds = await kv.zrange(`credit-cards:by-user:${userId}`, 0, -1, { rev: true });

  if (cardIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  cardIds.forEach(id => pipeline.hgetall(`credit-card:${id}`));
  const cards = await pipeline.exec<CreditCardData[]>();

  return cards.filter(Boolean);
}

export async function getActiveCreditCards(): Promise<CreditCardData[]> {
  const allCards = await getUserCreditCards();
  return allCards.filter(card => card.isActive);
}

// Função para calcular a próxima data de vencimento
export function getNextDueDate(dueDay: number): Date {
  const now = new Date();
  const currentDay = now.getDate();
  
  let dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
  
  // Se o dia de vencimento já passou neste mês, vai para o próximo mês
  if (currentDay > dueDay) {
    dueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }
  
  return dueDate;
}

// Função para calcular a data de fechamento da fatura
export function getNextClosingDate(closingDay: number): Date {
  const now = new Date();
  const currentDay = now.getDate();
  
  let closingDate = new Date(now.getFullYear(), now.getMonth(), closingDay);
  
  // Se o dia de fechamento já passou neste mês, vai para o próximo mês
  if (currentDay > closingDay) {
    closingDate = new Date(now.getFullYear(), now.getMonth() + 1, closingDay);
  }
  
  return closingDate;
}
