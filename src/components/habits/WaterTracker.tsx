// src/components/habits/WaterTracker.tsx
"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react'; // Importe o ícone MinusCircle
import WaterBottle from './WaterBottle';

interface WaterTrackerProps {
  initialAmount: number;
}

export default function WaterTracker({ initialAmount }: WaterTrackerProps) {
  const [currentWater, setCurrentWater] = useState(initialAmount);
  // Estado para lembrar a última quantidade adicionada
  const [lastAdded, setLastAdded] = useState<number | null>(null); 
  
  const waterGoal = 3000;

  const updateWater = async (amount: number) => {
    try {
      const response = await fetch('/api/habits/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setCurrentWater(data.amount);
        // Se estamos adicionando água, salvamos o valor
        if (amount > 0) {
            setLastAdded(amount);
            toast.success(`+${amount}ml de água adicionados!`);
        } else {
            // Se estamos removendo, limpamos o valor
            setLastAdded(null);
            toast.info(`${amount}ml de água removidos.`);
        }
      } else {
        throw new Error(data.error || "Falha ao atualizar a quantidade de água.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar a alteração.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-lg border bg-card p-6">
      <div className="flex justify-center">
        <WaterBottle currentAmount={currentWater} goalAmount={waterGoal} />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Aguometro</h2>
        <p className="text-muted-foreground">
          Registre sua ingestão de água para se manter hidratado. Sua meta diária é de {waterGoal / 1000} litros.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <Button onClick={() => updateWater(250)} variant="outline" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Copo (250ml)
          </Button>
          <Button onClick={() => updateWater(500)} variant="outline" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Garrafa (500ml)
          </Button>
          <Button onClick={() => updateWater(750)} variant="outline" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Garrafa G (750ml)
          </Button>
          
          {/* ** BOTÃO DE REMOVER ADICIONADO AQUI ** */}
          {/* Ele só aparece se algo já foi adicionado */}
          {lastAdded && (
            <Button 
              onClick={() => updateWater(-lastAdded)} 
              variant="destructive" 
              size="lg"
            >
              <MinusCircle className="mr-2 h-5 w-5" /> Desfazer (+{lastAdded}ml)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}