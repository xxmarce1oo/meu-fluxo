// src/app/api/finance/transactions/[transactionId]/route.ts
import { kv } from "@vercel/kv";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { TransactionData } from "@/types";

// A interface agora espera uma Promise
interface RouteParams {
  params: Promise<{
    transactionId: string;
  }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.email;
    
    // Adicionamos 'await' para resolver a Promise
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json({ error: "ID da transação não fornecido." }, { status: 400 });
    }

    // Segurança: Verificar se a transação pertence ao usuário antes de deletar
    const transaction = await kv.hgetall(`transaction:${transactionId}`) as TransactionData | null;
    if (!transaction || transaction.userId !== userId) {
        return NextResponse.json({ error: "Transação não encontrada ou não pertence a você." }, { status: 404 });
    }
    
    // Usar um pipeline para garantir que ambas as operações sejam executadas
    const pipeline = kv.pipeline();
    // 1. Deletar os detalhes da transação
    pipeline.del(`transaction:${transactionId}`);
    // 2. Remover o ID da transação do índice do usuário
    pipeline.zrem(`transactions:by-user:${userId}`, transactionId);
    
    await pipeline.exec();

    return NextResponse.json({ message: "Transação deletada com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("[TRANSACTION_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}