// src/app/api/goals/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export interface UserGoals {
  daily: number;
  weekly: number;
  monthly: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  // FIX 1: Add the double cast to the return value of hgetall
  const goals = await kv.hgetall(`goals:${userId}`) as unknown as UserGoals | null;

  if (!goals) {
    return NextResponse.json({ daily: 0, weekly: 0, monthly: 0 }, { status: 200 });
  }

  return NextResponse.json(goals, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.email;

  const body: Partial<UserGoals> = await request.json();

  const newGoals: UserGoals = {
    daily: Number(body.daily) || 0,
    weekly: Number(body.weekly) || 0,
    monthly: Number(body.monthly) || 0,
  };

  // FIX 2: Add the double cast to the value being sent to hset
  await kv.hset(`goals:${userId}`, newGoals as unknown as Record<string, unknown>);

  return NextResponse.json(newGoals, { status: 200 });
}