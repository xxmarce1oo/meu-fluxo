// src/components/ProjectNotesForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Adicionar import do toast
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ProjectNotesFormProps {
  project: {
    id: string;
    notes?: string;
  };
}

export default function ProjectNotesForm({ project }: ProjectNotesFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(project.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setIsOpen(false);
        toast.success("Notas salvas com sucesso!");
        router.refresh();
      } else {
        throw new Error("Falha ao salvar notas");
      }
    } catch (error) {
      console.error("Falha ao salvar as observações", error);
      toast.error("Falha ao salvar as notas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar Observações</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Observações da Atividade</DialogTitle>
            <DialogDescription>
              Anote o progresso, dificuldades ou qualquer informação relevante.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px]"
              placeholder="Digite suas anotações aqui..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}