"use client";

import { TransactionData, CreditCardData, BankSummary } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNextDueDate } from "@/lib/credit-card-service";
import { Calendar, CreditCard, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface BankTabsProps {
  transactions: TransactionData[];
  creditCards: CreditCardData[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

function getBankSummaries(transactions: TransactionData[], creditCards: CreditCardData[]): BankSummary[] {
  // Agrupar cartões por banco
  const bankGroups: { [bank: string]: CreditCardData[] } = {};
  
  creditCards.forEach(card => {
    if (!bankGroups[card.bank]) {
      bankGroups[card.bank] = [];
    }
    bankGroups[card.bank].push(card);
  });

  // Criar resumos por banco
  const summaries: BankSummary[] = [];

  Object.entries(bankGroups).forEach(([bankName, cards]) => {
    // Filtrar transações deste banco
    const cardNames = cards.map(card => card.name);
    const bankTransactions = transactions.filter(transaction => 
      transaction.paymentMethod === 'credit' && 
      transaction.creditCard &&
      cardNames.includes(transaction.creditCard)
    );

    // Calcular totais
    const totalSpent = bankTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);

    // Encontrar próxima data de vencimento
    const nextDueDates = cards.map(card => getNextDueDate(card.dueDay));
    const nextDueDate = new Date(Math.min(...nextDueDates.map(d => d.getTime())));

    summaries.push({
      bankName,
      cards,
      totalSpent,
      totalLimit,
      nextDueDate,
      transactions: bankTransactions
    });
  });

  // Adicionar aba "Outros" para transações sem cartão
  const otherTransactions = transactions.filter(transaction => 
    transaction.paymentMethod !== 'credit' || !transaction.creditCard
  );

  if (otherTransactions.length > 0) {
    const totalSpent = otherTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    summaries.push({
      bankName: "Outros",
      cards: [],
      totalSpent,
      totalLimit: 0,
      nextDueDate: new Date(),
      transactions: otherTransactions
    });
  }

  return summaries.sort((a, b) => b.totalSpent - a.totalSpent);
}

function TransactionListByBank({ transactions }: { transactions: TransactionData[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <div key={transaction.id} className="flex justify-between items-center p-3 bg-card border rounded-md">
          <div>
            <p className="font-medium">{transaction.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </span>
              {transaction.paymentMethod === 'credit' && transaction.creditCard && (
                <>
                  <span>•</span>
                  <span>{transaction.creditCard}</span>
                  {transaction.installments && transaction.installments > 1 && (
                    <>
                      <span>•</span>
                      <span>{transaction.currentInstallment}/{transaction.installments}x</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
              {transaction.type === 'expense' ? '-' : '+'} {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BankTabs({ transactions, creditCards }: BankTabsProps) {
  const bankSummaries = getBankSummaries(transactions, creditCards);

  if (bankSummaries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <CreditCard className="h-12 w-12 mx-auto mb-4" />
        <p className="text-lg font-semibold">Nenhum banco encontrado</p>
        <p className="text-sm">Cadastre seus cartões para ver os gastos organizados por banco.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={bankSummaries[0]?.bankName} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {bankSummaries.map(summary => (
          <TabsTrigger key={summary.bankName} value={summary.bankName} className="text-xs">
            {summary.bankName}
          </TabsTrigger>
        ))}
      </TabsList>

      {bankSummaries.map(summary => {
        const utilizationPercentage = summary.totalLimit > 0 
          ? (summary.totalSpent / summary.totalLimit) * 100 
          : 0;

        return (
          <TabsContent key={summary.bankName} value={summary.bankName} className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(summary.totalSpent)}
                  </div>
                </CardContent>
              </Card>

              {summary.totalLimit > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(summary.totalLimit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilização: {utilizationPercentage.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cartões</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.cards.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.cards.filter(c => c.isActive).length} ativos
                  </p>
                </CardContent>
              </Card>

              {summary.cards.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDate(summary.nextDueDate)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {summary.nextDueDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
                        <span className="text-orange-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Vence em breve
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Lista de Cartões */}
            {summary.cards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cartões do {summary.bankName}</CardTitle>
                  <CardDescription>
                    Cartões cadastrados e informações de vencimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {summary.cards.map(card => (
                      <div key={card.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{card.name}</p>
                          <p className="text-sm text-muted-foreground">
                            **** {card.lastFourDigits}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatCurrency(card.creditLimit)}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence dia {card.dueDay}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Transações - {summary.bankName}</CardTitle>
                <CardDescription>
                  {summary.transactions.length} transação(ões) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionListByBank transactions={summary.transactions} />
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
