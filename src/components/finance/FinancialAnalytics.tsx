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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function FinancialAnalytics({ transactions }: FinancialAnalyticsProps) {
  const { expenseByCategory, monthlySummary } = useMemo(() => {
    const expenseByCategoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Outros';
        if (!expenseByCategoryMap[category]) {
          expenseByCategoryMap[category] = 0;
        }
        expenseByCategoryMap[category] += t.amount;
      });
    
    const expenseData = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value }));

    const monthlyData: { [key: string]: { income: number, expense: number, date: Date } } = {};
    transactions.forEach(t => {
      // Usa a invoiceDate para agrupar, ou a data da compra como fallback
      const effectiveDate = new Date(t.invoiceDate || t.date);
      const monthKey = format(effectiveDate, 'yyyy-MM');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, date: effectiveDate };
      }
      monthlyData[monthKey][t.type] += t.amount;
    });

    const monthlySummary = Object.values(monthlyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(data => ({
        name: format(data.date, 'MMM/yy', { locale: ptBR }),
        income: data.income,
        expense: data.expense,
      }));

    return { expenseByCategory: expenseData, monthlySummary };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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