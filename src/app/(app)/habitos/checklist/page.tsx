// src/app/(app)/habitos/checklist/page.tsx
import { ListTodo, ArrowLeft } from 'lucide-react';
import { getChecklistData } from '@/lib/habits-service';
import DailyChecklist from '@/components/habits/DailyCheckList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ChecklistPage() {
  const checklistData = await getChecklistData();

  return (
    <div className="container mx-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
            <Link href="/habitos">
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <ListTodo className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Checklist Diário</h1>
        </div>
      
      <DailyChecklist 
        initialHabits={checklistData.allHabits}
        initialCompleted={checklistData.completedHabits}
      />
    </div>
  );
}