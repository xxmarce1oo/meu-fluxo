// src/app/api/projects/[projectId]/observations/[observationId]/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

async function verifyUserAccess(projectId: string, session: Session | null) {
    if (!session || !session.user?.email) return false;
    const project: { userId?: string } | null = await kv.hgetall(`project:${projectId}`);
    return project && project.userId === session.user.email;
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ projectId: string; observationId: string }> }
) {
    const { projectId, observationId } = await params;
    const session = await getServerSession(authOptions);
    if (!await verifyUserAccess(projectId, session)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text) {
        return NextResponse.json({ error: "O texto é obrigatório" }, { status: 400 });
    }

    await kv.hset(`observation:${observationId}`, { text });
    return NextResponse.json({ message: "Observação atualizada" }, { status: 200 });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ projectId: string; observationId: string }> }
) {
    const { projectId, observationId } = await params;
    const session = await getServerSession(authOptions);
    if (!await verifyUserAccess(projectId, session)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pipeline = kv.pipeline();
    pipeline.del(`observation:${observationId}`);
    pipeline.zrem(`observations:by-project:${projectId}`, observationId);
    await pipeline.exec();

    return NextResponse.json({ message: "Observação deletada" }, { status: 200 });
}