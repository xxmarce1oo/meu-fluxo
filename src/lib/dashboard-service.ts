// src/lib/dashboard-service.ts
import { getUserTransactions } from "./finance-service";
import { getTodaysUserLogs } from "./project-service";
import { TimeLogData, TransactionData } from "@/types";

// Tipo unificado para os itens do feed
// Agora, cada item terá um sub-objeto 'data' com as informações originais.
export type ActivityFeedItem = {
  id: string;
  // O tipo principal do item no feed
  itemType: 'log' | 'transaction'; 
  // A data usada para ordenação
  date: number; 
  // Os dados originais
  data: TimeLogData | TransactionData;
};

export async function getRecentActivityFeed(): Promise<ActivityFeedItem[]> {
  const [logs, transactions] = await Promise.all([
    getTodaysUserLogs(),
    getUserTransactions().then(ts => ts.slice(0, 10))
  ]);

  // Mapeia os logs para o novo formato do feed
  const mappedLogs: ActivityFeedItem[] = logs.map(log => ({
    id: log.id,
    itemType: 'log',
    date: log.createdAt || log.startTime,
    data: log
  }));

  // Mapeia as transações para o novo formato do feed
  const mappedTransactions: ActivityFeedItem[] = transactions.map(t => ({
    id: t.id,
    itemType: 'transaction',
    date: t.date,
    data: t
  }));

  const combinedFeed = [...mappedLogs, ...mappedTransactions];
  combinedFeed.sort((a, b) => b.date - a.date);

  return combinedFeed.slice(0, 10);
}