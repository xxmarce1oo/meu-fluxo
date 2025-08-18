// src/app/(app)/habitos/page.tsx
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GlassWater, ListTodo, MoveRight } from 'lucide-react';

const habits = [
  {
    href: '/habitos/agua',
    icon: GlassWater,
    title: 'Aguometro',
    description: 'Rastreie sua ingestão diária de água para se manter hidratado.'
  },
  {
    href: '/habitos/checklist',
    icon: ListTodo,
    title: 'Checklist Diário',
    description: 'Crie consistência marcando suas tarefas diárias recorrentes.'
  }
];

export default function HabitosHubPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Módulo de Hábitos</h1>
        <p className="text-muted-foreground">Selecione um hábito para visualizar e gerenciar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => (
          <Link href={habit.href} key={habit.href} className="block group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-muted rounded-lg">
                  <habit.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>{habit.title}</CardTitle>
                  <CardDescription>{habit.description}</CardDescription>
                </div>
                <MoveRight className="h-5 w-5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}