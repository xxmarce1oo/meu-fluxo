"use client"; // Cálculos com datas do mês corrente funcionam melhor no cliente

import { TransactionData } from "@/types";
import SummaryCard from "./SummaryCard";
import { ArrowUpCircle, ArrowDownCircle, Scale } from "lucide-react";
import { useMemo } from "react";

interface FinancialSummaryProps {
  transactions: TransactionData[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtra transações apenas para o mês e ano correntes
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Receita do Mês"
        value={formatCurrency(summary.income)}
        icon={<ArrowUpCircle className="h-5 w-5 text-muted-foreground" />}
        color="text-green-500"
      />
      <SummaryCard
        title="Despesa do Mês"
        value={formatCurrency(summary.expense)}
        icon={<ArrowDownCircle className="h-5 w-5 text-muted-foreground" />}
        color="text-red-500"
      />
      <SummaryCard
        title="Saldo do Mês"
        value={formatCurrency(summary.balance)}
        icon={<Scale className="h-5 w-5 text-muted-foreground" />}
        color={summary.balance >= 0 ? "text-blue-500" : "text-red-500"}
      />
    </div>
  );
}