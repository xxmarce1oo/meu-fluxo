// src/app/(app)/financeiro/page.tsx
"use client"; 

import { useEffect, useState } from "react";
import NewTransactionForm from "@/components/finance/NewTransactionForm";
import NewCreditCardForm from "@/components/finance/NewCreditCardForm";
import CreditCardList from "@/components/finance/CreditCardList";
import BankTabs from "@/components/finance/BankTabs";
import { Landmark, Trash2 } from "lucide-react";
import FinancialSummary from "@/components/finance/FinancialSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialAnalytics from "@/components/finance/FinancialAnalytics";
import { TransactionData, CreditCardData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para buscar os dados via API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Usamos a API fetch para chamar nossos endpoints
      const [transactionsRes, creditCardsRes] = await Promise.all([
        fetch('/api/finance/transactions'),
        fetch('/api/finance/credit-cards'),
      ]);

      if (!transactionsRes.ok || !creditCardsRes.ok) {
        throw new Error("Falha ao buscar dados financeiros.");
      }

      const transactionsData = await transactionsRes.json();
      const creditCardsData = await creditCardsRes.json();

      setTransactions(transactionsData);
      setCreditCards(creditCardsData);
    } catch (error) {
      toast.error("Erro ao carregar os dados financeiros.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/finance/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar a transação.");
      }
      
      toast.success("Transação deletada com sucesso!");
      // Atualiza a UI localmente e busca os dados novamente para garantir consistência
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setIsDeleting(false);
      setTransactionToDelete(null);
    }
  };
  
  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Carregando dados financeiros...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Controle Financeiro</h1>
          <div className="flex gap-2">
            <NewCreditCardForm />
            <NewTransactionForm onTransactionCreated={fetchData} />
          </div>
        </div>

        <FinancialSummary transactions={transactions} />

        <Tabs defaultValue="analise" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analise">Análise</TabsTrigger>
            <TabsTrigger value="gastos">Gastos por Banco</TabsTrigger>
            <TabsTrigger value="cartoes">Meus Cartões</TabsTrigger>
            <TabsTrigger value="transacoes">Todas Transações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analise">
            <FinancialAnalytics transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="gastos" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Gastos Organizados por Banco</h2>
              <BankTabs transactions={transactions} creditCards={creditCards} />
            </div>
          </TabsContent>
          
          <TabsContent value="cartoes" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Cartões de Crédito</h2>
                <p className="text-muted-foreground">{creditCards.length} cartão(ões) cadastrado(s)</p>
              </div>
              <CreditCardList cards={creditCards} />
            </div>
          </TabsContent>
          
          <TabsContent value="transacoes" className="space-y-4">
            <div>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-16 border-2 border-dashed rounded-lg p-12">
                  <Landmark className="h-12 w-12 mb-4" />
                  <h2 className="text-2xl font-semibold">Nenhuma transação registrada</h2>
                  <p className="mt-2">Clique em &quot;+ Nova Transação&quot; para adicionar sua primeira despesa ou receita.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Todas as Transações</h2>
                  <div className="space-y-3">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 bg-card border rounded-md">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span className="capitalize">{transaction.paymentMethod}</span>
                              {transaction.creditCard && (<><span>•</span><span>{transaction.creditCard}</span></>)}
                              {transaction.installments && transaction.installments > 1 && (<><span>•</span><span>{transaction.currentInstallment}/{transaction.installments}x</span></>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                              <p className={`text-lg font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                              {transaction.type === 'expense' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTransactionToDelete(transaction)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir a transação &quot;<strong>{transactionToDelete?.description}</strong>&quot; no valor de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactionToDelete?.amount || 0)}</strong>?
              <br/>Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}