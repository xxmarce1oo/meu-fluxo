// src/components/ProjectDetailsForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner"; // Adicionar import do toast

interface ProjectDetailsFormProps {
  project: {
    id: string;
    details?: string;
    notes?: string;
  };
}

export default function ProjectDetailsForm({ project }: ProjectDetailsFormProps) {
  const router = useRouter();
  const [details, setDetails] = useState(project.details || "");
  const [notes, setNotes] = useState(project.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details, notes }),
      });
      
      if (response.ok) {
        toast.success("Detalhes salvos com sucesso!");
        router.refresh();
      } else {
        throw new Error("Falha ao salvar detalhes");
      }
    } catch (error) {
      console.error("Falha ao salvar os detalhes", error);
      toast.error("Falha ao salvar os detalhes. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="details" className="text-2xl font-semibold mb-2">Detalhes</Label>
        <Textarea
          id="details"
          placeholder="Descreva o que precisa ser feito nesta atividade..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="notes" className="text-2xl font-semibold mb-2">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Anote dificuldades, pontos de atenção ou próximos passos..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[150px]"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}