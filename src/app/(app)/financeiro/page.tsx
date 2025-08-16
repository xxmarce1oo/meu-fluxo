// src/app/(app)/financeiro/page.tsx
import NewTransactionForm from "@/components/finance/NewTransactionForm";
import TransactionList from "@/components/finance/TransactionList"; // Importe a lista
import { getUserTransactions } from "@/lib/finance-service"; // Importe a função de busca
import { Landmark } from "lucide-react";

export default async function FinanceiroPage() {
  // Busca os dados no servidor
  const transactions = await getUserTransactions();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Controle Financeiro</h1>
        <NewTransactionForm />
      </div>

      {/* Seção de Resumo (Bônus) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Aqui você pode adicionar cards com resumos como "Receita do Mês", "Despesa do Mês", "Saldo" */}
      </div>

      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-16 border-2 border-dashed rounded-lg p-12">
            <Landmark className="h-12 w-12 mb-4" />
            <h2 className="text-2xl font-semibold">Nenhuma transação registrada</h2>
            <p className="mt-2">Clique em "+ Nova Transação" para adicionar sua primeira despesa ou receita.</p>
          </div>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
}