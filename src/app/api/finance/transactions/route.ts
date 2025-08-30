// src/app/api/finance/transactions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { TransactionData } from "@/types";
import { getUserCreditCards } from "@/lib/credit-card-service";

/**
 * Calcula a data de vencimento da fatura para uma transação de cartão de crédito.
 * Versão refatorada para ser imutável e mais clara, resolvendo erros de lint.
 * @param transactionDate - A data em que a compra foi feita.
 * @param closingDay - O dia de fechamento da fatura do cartão.
 * @param dueDay - O dia de vencimento da fatura do cartão.
 * @returns O timestamp da data de vencimento da fatura correta.
 */
function getInvoiceDate(transactionDate: Date, closingDay: number, dueDay: number): number {
    const purchaseYear = transactionDate.getFullYear();
    const purchaseMonth = transactionDate.getMonth();
    const purchaseDay = transactionDate.getDate();

    // Determina o mês de fechamento da fatura com base no dia da compra
    const closingMonth = purchaseDay > closingDay ? purchaseMonth + 1 : purchaseMonth;
    const closingDate = new Date(purchaseYear, closingMonth, closingDay);

    // Determina o mês de vencimento com base na data de fechamento
    const dueMonth = dueDay < closingDay ? closingDate.getMonth() + 1 : closingDate.getMonth();
    const dueDate = new Date(closingDate.getFullYear(), dueMonth, dueDay);

    return dueDate.getTime();
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.email;

    const body = await request.json();

    if (!body.description || typeof body.amount !== 'number' || body.amount <= 0 || !['income', 'expense'].includes(body.type) || !body.date) {
      return NextResponse.json({ error: "Dados de entrada inválidos." }, { status: 400 });
    }

    const transactionDate = new Date(body.date);
    const createdAt = Date.now();
    let finalInvoiceDate = transactionDate.getTime();

    const transactionData: Partial<TransactionData> = {
      id: nanoid(),
      userId,
      description: body.description,
      amount: body.amount,
      type: body.type,
      date: transactionDate.getTime(),
      invoiceDate: finalInvoiceDate,
      createdAt,
      category: body.category || (body.type === 'income' ? 'Receita' : 'Geral'),
    };

    if (body.type === 'expense') {
      transactionData.paidBy = body.paidBy || "";
      transactionData.paymentMethod = body.paymentMethod || 'debit';

      if (body.paymentMethod === 'credit') {
        if (!body.creditCard || !body.installments || body.installments < 1) {
          return NextResponse.json({ error: "Dados do cartão de crédito são obrigatórios." }, { status: 400 });
        }
        
        const userCards = await getUserCreditCards();
        const selectedCard = userCards.find(c => c.name === body.creditCard);
        if (!selectedCard) {
          return NextResponse.json({ error: "Cartão de crédito não encontrado." }, { status: 404 });
        }

        finalInvoiceDate = getInvoiceDate(transactionDate, selectedCard.closingDay, selectedCard.dueDay);
        transactionData.invoiceDate = finalInvoiceDate;

        if (body.installments > 1) {
          const pipeline = kv.pipeline();
          const installmentAmount = Math.round((body.amount / body.installments) * 100) / 100;
          
          for (let i = 0; i < body.installments; i++) {
            const installmentInvoiceDate = new Date(finalInvoiceDate);
            installmentInvoiceDate.setMonth(installmentInvoiceDate.getMonth() + i);

            const installmentData: TransactionData = {
              ...transactionData,
              id: nanoid(),
              description: `${body.description} (${i + 1}/${body.installments})`,
              amount: installmentAmount,
              invoiceDate: installmentInvoiceDate.getTime(),
              installments: body.installments,
              currentInstallment: i + 1,
              creditCard: body.creditCard,
            } as TransactionData;
            
            pipeline.hset(`transaction:${installmentData.id}`, installmentData as unknown as Record<string, unknown>);
            pipeline.zadd(`transactions:by-user:${userId}`, { score: transactionDate.getTime(), member: installmentData.id });
          }
          await pipeline.exec();
          return NextResponse.json({ message: "Transações parceladas criadas." }, { status: 201 });
        }
        
        transactionData.installments = 1;
        transactionData.creditCard = body.creditCard;
      }
    }
    
    await kv.hset(`transaction:${transactionData.id}`, transactionData as unknown as Record<string, unknown>);
    await kv.zadd(`transactions:by-user:${userId}`, { score: transactionDate.getTime(), member: transactionData.id! });

    return NextResponse.json(transactionData, { status: 201 });

  } catch (error) {
    console.error("[TRANSACTIONS_POST_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Tipo auxiliar para os dados brutos como vêm do Vercel KV
type RawTransactionFromKV = Omit<TransactionData, "amount" | "date" | "invoiceDate" | "createdAt" | "installments" | "currentInstallment"> & {
  amount: string;
  date: string;
  invoiceDate: string;
  createdAt: string;
  installments?: string;
  currentInstallment?: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.email;

    const transactionIds = await kv.zrange(`transactions:by-user:${userId}`, 0, -1, { rev: true });

    if (transactionIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const pipeline = kv.pipeline();
    transactionIds.forEach(id => pipeline.hgetall(`transaction:${id}`));
    // CORREÇÃO: Usamos o tipo auxiliar para evitar o 'any'
    const transactionsFromKV = await pipeline.exec<RawTransactionFromKV[]>();

    const transactions = transactionsFromKV
        .filter((t): t is RawTransactionFromKV => !!t)
        .map((t): TransactionData => ({
        ...t,
        amount: parseFloat(t.amount || '0'),
        date: Number(t.date),
        invoiceDate: Number(t.invoiceDate),
        createdAt: Number(t.createdAt),
        installments: t.installments ? Number(t.installments) : undefined,
        currentInstallment: t.currentInstallment ? Number(t.currentInstallment) : undefined,
        }));

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("[TRANSACTIONS_GET_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}