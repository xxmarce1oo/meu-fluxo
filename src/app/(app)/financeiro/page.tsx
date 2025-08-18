// src/app/(app)/financeiro/page.tsx
import NewTransactionForm from "@/components/finance/NewTransactionForm";
import NewCreditCardForm from "@/components/finance/NewCreditCardForm";
import CreditCardList from "@/components/finance/CreditCardList";
import BankTabs from "@/components/finance/BankTabs";
import { getUserTransactions } from "@/lib/finance-service";
import { getUserCreditCards } from "@/lib/credit-card-service";
import { Landmark } from "lucide-react";
import FinancialSummary from "@/components/finance/FinancialSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// 1. Importe o novo componente de análise
import FinancialAnalytics from "@/components/finance/FinancialAnalytics"; 

export default async function FinanceiroPage() {
  const transactions = await getUserTransactions();
  const creditCards = await getUserCreditCards();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Controle Financeiro</h1>
        <div className="flex gap-2">
          <NewCreditCardForm />
          <NewTransactionForm />
        </div>
      </div>

      <FinancialSummary transactions={transactions} />

      <Tabs defaultValue="analise" className="w-full">
        {/* 2. Adicione a nova aba "Análise" */}
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="gastos">Gastos por Banco</TabsTrigger>
          <TabsTrigger value="cartoes">Meus Cartões</TabsTrigger>
          <TabsTrigger value="transacoes">Todas Transações</TabsTrigger>
        </TabsList>
        
        {/* 3. Adicione o conteúdo para a nova aba */}
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
              <p className="text-muted-foreground">
                {creditCards.length} cartão(ões) cadastrado(s)
              </p>
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
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{transaction.paymentMethod}</span>
                            {transaction.creditCard && (
                              <>
                                <span>•</span>
                                <span>{transaction.creditCard}</span>
                              </>
                            )}
                            {transaction.installments && transaction.installments > 1 && (
                              <>
                                <span>•</span>
                                <span>{transaction.currentInstallment}/{transaction.installments}x</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                          {transaction.type === 'expense' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
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
  );
}