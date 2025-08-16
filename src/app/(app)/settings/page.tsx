// src/app/(app)/settings/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserGoals } from "@/app/api/goals/route"; // Importar a tipagem
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [goals, setGoals] = useState<UserGoals>({ daily: 0, weekly: 0, monthly: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Efeito para buscar as metas salvas quando a página carregar
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/goals');
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("Falha ao buscar metas", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoals(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goals),
      });
      // Adicionar um feedback de sucesso (Toast) aqui seria ótimo no futuro
      alert('Metas salvas com sucesso!');
    } catch (error) {
      console.error("Falha ao salvar metas", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Carregando configurações...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 border-b pb-4">Configurações</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Minhas Metas de Horas</h2>
          <p className="text-muted-foreground">Defina quantas horas você pretende trabalhar.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily">Meta Diária (horas)</Label>
            <Input id="daily" name="daily" type="number" value={goals.daily} onChange={handleInputChange} placeholder="Ex: 8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly">Meta Semanal (horas)</Label>
            <Input id="weekly" name="weekly" type="number" value={goals.weekly} onChange={handleInputChange} placeholder="Ex: 40" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Meta Mensal (horas)</Label>
            <Input id="monthly" name="monthly" type="number" value={goals.monthly} onChange={handleInputChange} placeholder="Ex: 160" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Metas"}
          </Button>
        </div>
      </form>
    </div>
  );
}