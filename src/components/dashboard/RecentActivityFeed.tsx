// src/components/dashboard/RecentActivityFeed.tsx
"use client";

import { ActivityFeedItem } from "@/lib/dashboard-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { formatDuration } from "@/lib/utils";
import { Clock, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionData, TimeLogData } from "@/types";

interface RecentActivityFeedProps {
  items: ActivityFeedItem[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

export default function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Seus últimos registros de tempo e transações financeiras.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              if (item.itemType === 'log') {
                const logData = item.data as TimeLogData; // Afirmamos o tipo para o TS
                return (
                  <div key={`log-${item.id}`} className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{logData.description || 'Tempo registrado'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="font-semibold text-lg">
                      {formatDuration(logData.duration)}
                    </div>
                  </div>
                );
              }

              if (item.itemType === 'transaction') {
                const txData = item.data as TransactionData; // Afirmamos o tipo para o TS
                const isIncome = txData.type === 'income';
                return (
                  <div key={`transaction-${item.id}`} className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      {isIncome ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{txData.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className={`font-semibold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(txData.amount)}
                    </div>
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}