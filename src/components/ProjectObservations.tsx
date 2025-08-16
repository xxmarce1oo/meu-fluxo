// src/components/ProjectObservations.tsx
"use client";

import { ObservationData } from "@/lib/project-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import ObservationItem from "./ObservationItem"; // <-- IMPORTAR

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
      await fetch(`/api/projects/${projectId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newObservationText }),
      });

      setNewObservationText("");
      router.refresh();
    } catch (error) {
      console.error("Falha ao adicionar observação", error);
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
          <p className="text-sm text-muted-foreground">Nenhuma observação adicionada.</p>
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </div>
  );
}