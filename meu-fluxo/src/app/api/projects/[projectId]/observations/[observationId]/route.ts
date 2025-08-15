// src/app/api/projects/[projectId]/observations/[observationId]/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../auth/[...nextauth]/route";

async function verifyUserAccess(projectId: string, session: any) {
    if (!session || !session.user?.email) return false;
    const project: { userId?: string } | null = await kv.hgetall(`project:${projectId}`);
    return project && project.userId === session.user.email;
}

export async function PATCH(
    request: Request,
    { params }: { params: { projectId: string; observationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!await verifyUserAccess(params.projectId, session)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text) {
        return NextResponse.json({ error: "O texto é obrigatório" }, { status: 400 });
    }

    await kv.hset(`observation:${params.observationId}`, { text });
    return NextResponse.json({ message: "Observação atualizada" }, { status: 200 });
}

export async function DELETE(
    request: Request,
    { params }: { params: { projectId: string; observationId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!await verifyUserAccess(params.projectId, session)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pipeline = kv.pipeline();
    pipeline.del(`observation:${params.observationId}`);
    pipeline.zrem(`observations:by-project:${params.projectId}`, params.observationId);
    await pipeline.exec();

    return NextResponse.json({ message: "Observação deletada" }, { status: 200 });
}