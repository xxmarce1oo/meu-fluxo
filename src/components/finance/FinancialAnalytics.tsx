// src/components/finance/analytics/FinancialAnalytics.tsx
"use client";

import { useMemo } from 'react';
import { TransactionData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialAnalyticsProps {
  transactions: TransactionData[];
}

// Cores para o gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function FinancialAnalytics({ transactions }: FinancialAnalyticsProps) {
  // Memoiza os cálculos para que não sejam refeitos a cada renderização
  const { expenseByCategory, monthlySummary } = useMemo(() => {
    // 1. Processamento para o Gráfico de Pizza (Despesas por Categoria)
    const expenseByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Outros';
        if (!expenseByCategory[category]) {
          expenseByCategory[category] = 0;
        }
        expenseByCategory[category] += t.amount;
      });
    
    const expenseData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

    // 2. Processamento para o Gráfico de Barras (Receita vs. Despesa Mensal)
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    transactions.forEach(t => {
      const month = format(new Date(t.date), 'MMM/yy', { locale: ptBR });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += t.amount;
    });

    const monthlySummary = Object.entries(monthlyData)
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Ordena por data

    return { expenseByCategory: expenseData, monthlySummary };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Card do Gráfico de Pizza */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição dos seus gastos no período.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Card do Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          <CardDescription>Comparativo de receitas e despesas por mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$${value}`} />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Receita" />
              <Bar dataKey="expense" fill="#ef4444" name="Despesa" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}