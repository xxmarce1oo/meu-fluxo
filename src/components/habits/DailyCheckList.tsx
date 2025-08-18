"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DailyChecklistProps {
  initialHabits: string[];
  initialCompleted: string[];
}

export default function DailyChecklist({ initialHabits, initialCompleted }: DailyChecklistProps) {
  const [habits, setHabits] = useState<string[]>(initialHabits);
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [newHabit, setNewHabit] = useState("");

  const handleToggle = async (habit: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(habit)) {
      newCompleted.delete(habit);
    } else {
      newCompleted.add(habit);
    }
    setCompleted(newCompleted);

    await fetch('/api/habits/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', habit }),
    });
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || habits.includes(newHabit.trim())) {
        toast.warning("Hábito inválido ou já existente.");
        return;
    }
    const trimmedHabit = newHabit.trim();
    setHabits([...habits, trimmedHabit]);
    setNewHabit("");

    await fetch('/api/habits/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', habit: trimmedHabit }),
    });
    toast.success("Hábito adicionado!");
  };

  const confirmDelete = async (habitToDelete: string) => {
    setHabits(habits.filter(h => h !== habitToDelete));

    await fetch('/api/habits/checklist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit: habitToDelete }),
    });
    toast.info("Hábito removido.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListTodo /> Checklist Diário</CardTitle>
        <CardDescription>Marque seus hábitos diários para criar consistência.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddHabit} className="flex gap-2 mb-6">
          <Input 
            placeholder="Ex: Ler 10 páginas" 
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <Button type="submit" size="icon"><Plus /></Button>
        </form>

        <div className="space-y-4">
            {habits.length > 0 ? habits.map(habit => (
              <div key={habit} className="flex items-center justify-between p-3 rounded-md bg-background hover:bg-muted/50 transition-colors">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-grow"
                  onClick={() => handleToggle(habit)}
                >
                  <Checkbox checked={completed.has(habit)} />
                  <span className={`text-sm font-medium ${completed.has(habit) ? 'text-muted-foreground line-through' : ''}`}>
                    {habit}
                  </span>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {/* ** CORREÇÃO APLICADA AQUI ** */}
                        Esta ação não pode ser desfeita. O hábito &quot;{habit}&quot; será removido permanentemente da sua lista.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => confirmDelete(habit)}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum hábito cadastrado. Adicione seu primeiro hábito acima!
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}