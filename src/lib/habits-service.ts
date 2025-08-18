// src/lib/habits-service.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export async function getWaterIntakeForToday(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // Se não houver sessão, não há como buscar dados.
    return 0;
  }

  const userKey = `water:${session.user.email}`;
  const todayKey = getTodayKey();
  
  const amount = await kv.hget(userKey, todayKey) || 0;

  return Number(amount);
}

// ** NOVA FUNÇÃO **
export async function getChecklistData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { allHabits: [], completedHabits: [] };
  }

  const userHabitsKey = `habits:${session.user.email}`;
  const userLogKey = `habits-log:${session.user.email}:${getTodayKey()}`;

  const [allHabits, completedHabits] = await Promise.all([
    kv.smembers(userHabitsKey),
    kv.smembers(userLogKey),
  ]);

  return { allHabits, completedHabits };
}