// src/app/api/habits/checklist/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const getTodayKey = () => new Date().toISOString().split('T')[0];

// GET: Busca a lista de hábitos e o status de conclusão de hoje
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userHabitsKey = `habits:${session.user.email}`;
  const userLogKey = `habits-log:${session.user.email}:${getTodayKey()}`;

  // Busca a lista mestre de hábitos e os hábitos concluídos hoje
  const [allHabits, completedHabits] = await Promise.all([
    kv.smembers(userHabitsKey),
    kv.smembers(userLogKey),
  ]);

  return NextResponse.json({ allHabits, completedHabits });
}

// POST: Adiciona um novo hábito OU marca um como concluído/não concluído
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { action, habit } = await request.json();

  if (!habit) {
    return NextResponse.json({ error: "Hábito inválido" }, { status: 400 });
  }

  const userHabitsKey = `habits:${session.user.email}`;

  // Ação para adicionar um novo hábito à lista mestre
  if (action === 'add') {
    await kv.sadd(userHabitsKey, habit);
    return NextResponse.json({ message: "Hábito adicionado" });
  }

  // Ação para marcar um hábito como concluído/não concluído no dia
  if (action === 'toggle') {
    const userLogKey = `habits-log:${session.user.email}:${getTodayKey()}`;
    // Verifica se o hábito já está marcado como concluído
    const isCompleted = await kv.sismember(userLogKey, habit);

    if (isCompleted) {
      await kv.srem(userLogKey, habit); // Remove dos concluídos
    } else {
      await kv.sadd(userLogKey, habit); // Adiciona aos concluídos
    }
    return NextResponse.json({ message: "Status do hábito atualizado" });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}

// DELETE: Remove um hábito da lista mestre
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { habit } = await request.json();
    if (!habit) {
        return NextResponse.json({ error: "Hábito inválido" }, { status: 400 });
    }

    const userHabitsKey = `habits:${session.user.email}`;
    await kv.srem(userHabitsKey, habit);

    return NextResponse.json({ message: "Hábito removido" });
}