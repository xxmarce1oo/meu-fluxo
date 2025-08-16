// src/components/finance/TransactionList.tsx
import { TransactionData } from "@/types";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: TransactionData[];
}

// Função para formatar a moeda para o padrão brasileiro
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">Transações Recentes</h2>
      <ul className="space-y-3">
        {transactions.map(transaction => (
          <li key={transaction.id} className="p-3 bg-card border rounded-md flex justify-between items-center">
            <div className="flex items-center gap-4">
              {transaction.type === 'income' ? (
                <ArrowUpCircle className="h-6 w-6 text-green-500" />
              ) : (
                <ArrowDownCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "font-mono text-lg font-semibold",
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}