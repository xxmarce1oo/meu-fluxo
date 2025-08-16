// src/components/ProjectObservations.tsx
"use client";

import { ObservationData } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import ObservationItem from "./ObservationItem"; // <-- IMPORTAR
import { toast } from "sonner"; // Adicionar import do toast
import { MessageSquare } from "lucide-react"; // Adicionar ícone para estado vazio

interface ProjectObservationsProps {
  projectId: string;
  initialObservations: ObservationData[];
}

export default function ProjectObservations({ projectId, initialObservations }: ProjectObservationsProps) {
  const router = useRouter();
  const [newObservationText, setNewObservationText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddObservation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newObservationText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newObservationText }),
      });

      if (response.ok) {
        setNewObservationText("");
        toast.success("Observação adicionada com sucesso!");
        router.refresh();
      } else {
        throw new Error("Falha ao adicionar observação");
      }
    } catch (error) {
      console.error("Falha ao adicionar observação", error);
      toast.error("Falha ao adicionar observação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-md shadow-sm border">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Observações</h2>

      <div className="space-y-4 mb-6">
        {initialObservations.length > 0 ? (
          // Usar o novo componente ObservationItem para renderizar a lista
          initialObservations.map(obs => (
            <ObservationItem key={obs.id} observation={obs} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
            <MessageSquare className="h-8 w-8 mb-2 text-gray-400" />
            <p className="text-sm font-medium">Nenhuma observação adicionada</p>
            <p className="text-xs mt-1">Adicione suas primeiras observações sobre este projeto.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleAddObservation} className="space-y-2">
        <Textarea
          placeholder="Adicionar uma nova observação..."
          value={newObservationText}
          onChange={(e) => setNewObservationText(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </div>
  );
}