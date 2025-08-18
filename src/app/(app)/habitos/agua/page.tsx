// src/app/(app)/habitos/agua/page.tsx
import { GlassWater } from 'lucide-react';
import { getWaterIntakeForToday } from '@/lib/habits-service';
import WaterTracker from '@/components/habits/WaterTracker';
import WaterNotificationManager from '@/components/habits/WaterNotificationManager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function AguaPage() {
  const initialWaterAmount = await getWaterIntakeForToday();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/habitos">
            <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
            </Button>
        </Link>
        <GlassWater className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Aguometro</h1>
      </div>

      {/* Componente do Aguometro */}
      <WaterTracker initialAmount={initialWaterAmount} />
      
      {/* Componente de Notificações */}
      <WaterNotificationManager />
    </div>
  );
}