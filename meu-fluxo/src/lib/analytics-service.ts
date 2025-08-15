// src/lib/analytics-service.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserGoals } from "@/app/api/goals/route";
import { TimeLogData } from "./project-service";

export interface ProgressReport {
  daily: { goal: number; completed: number };
  weekly: { goal: number; completed: number };
  monthly: { goal: number; completed: number };
}

// Função auxiliar para somar a duração dos logs em horas
function calculateTotalHours(logs: TimeLogData[]): number {
  if (!logs || logs.length === 0) return 0;
  const totalSeconds = logs.reduce((acc, log) => acc + log.duration, 0);
  return totalSeconds / 3600; // Converte segundos para horas
}

export async function getUserProgressReport(): Promise<ProgressReport> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Não autorizado");
  }
  const userId = session.user.email;

  // 1. Definir os períodos de tempo
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Início da semana (Domingo)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0);

  // Início do mês
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // 2. Buscar todos os logs do usuário do mês atual (para otimizar)
  const allMonthLogIds = await kv.zrange(`logs:by-user:${userId}`, startOfMonth, Date.now(), { byScore: true });

  let allMonthLogs: TimeLogData[] = [];
  if (allMonthLogIds.length > 0) {
    const pipeline = kv.pipeline();
    allMonthLogIds.forEach(id => pipeline.hgetall(`log:${id}`));
    allMonthLogs = (await pipeline.exec<TimeLogData[]>()).filter(Boolean); // Filtra nulos
  }

  // 3. Filtrar logs para cada período
  const dailyLogs = allMonthLogs.filter(log => log.createdAt >= startOfToday);
  const weeklyLogs = allMonthLogs.filter(log => log.createdAt >= startOfWeek);
  // Os logs mensais são todos os que buscamos

  // 4. Buscar as metas do usuário
const goals: UserGoals = ((await kv.hgetall(`goals:${userId}`)) as unknown as UserGoals) || { daily: 0, weekly: 0, monthly: 0 };
  // 5. Montar o relatório
  return {
    daily: { goal: goals.daily, completed: calculateTotalHours(dailyLogs) },
    weekly: { goal: goals.weekly, completed: calculateTotalHours(weeklyLogs) },
    monthly: { goal: goals.monthly, completed: calculateTotalHours(allMonthLogs) },
  };
}