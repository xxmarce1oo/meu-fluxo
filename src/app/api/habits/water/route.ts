// src/app/api/habits/water/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userKey = `water:${session.user.email}`;
  const todayKey = getTodayKey();
  
  const amount = await kv.hget(userKey, todayKey) || 0;

  return NextResponse.json({ amount: Number(amount) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { amount } = await request.json();
  // ** MUDANÇA AQUI: Agora permitimos qualquer número, exceto zero **
  if (typeof amount !== 'number' || amount === 0) {
    return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });
  }

  const userKey = `water:${session.user.email}`;
  const todayKey = getTodayKey();

  const currentTotal = await kv.hget(userKey, todayKey) || 0;
  
  // Garante que o total não fique negativo
  if (Number(currentTotal) + amount < 0) {
      return NextResponse.json({ error: "O total não pode ser negativo." }, { status: 400 });
  }

  const newTotal = await kv.hincrby(userKey, todayKey, amount);

  return NextResponse.json({ amount: newTotal });
}