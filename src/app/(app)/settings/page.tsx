// src/app/(app)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Adicionado import do toast
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goals>({ daily: 0, weekly: 0, monthly: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const loadGoals = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/goals");
        if (response.ok) {
          const data = await response.json();
          setGoals(data);
        }
      } catch (error) {
        console.error("Falha ao carregar metas:", error);
        toast.error("Falha ao carregar as metas. Tente novamente.");
      }
    };

    if (session?.user?.email) {
      loadGoals();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goals),
      });

      if (response.ok) {
        toast.success("Metas salvas com sucesso!");
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Falha ao salvar metas", error);
      toast.error("Falha ao salvar as metas. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Configure suas metas de tempo de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily">Meta Diária (horas)</Label>
              <Input
                id="daily"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={goals.daily}
                onChange={(e) => setGoals({ ...goals, daily: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly">Meta Semanal (horas)</Label>
              <Input
                id="weekly"
                type="number"
                min="0"
                max="168"
                step="0.5"
                value={goals.weekly}
                onChange={(e) => setGoals({ ...goals, weekly: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Meta Mensal (horas)</Label>
              <Input
                id="monthly"
                type="number"
                min="0"
                max="744"
                step="0.5"
                value={goals.monthly}
                onChange={(e) => setGoals({ ...goals, monthly: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 160"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Salvando..." : "Salvar Metas"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}