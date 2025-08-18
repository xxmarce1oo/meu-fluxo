// src/components/ProjectEditForm.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectEditFormProps {
  project: {
    id: string;
    name: string;
    estimatedHours?: number;
  };
}

export default function ProjectEditForm({ project }: ProjectEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  // Add state for estimated hours, defaulting to the project's current value or empty
  const [newEstimatedHours, setNewEstimatedHours] = useState(project.estimatedHours?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Send both name and estimatedHours in the request body
        body: JSON.stringify({ 
          name: newName, 
          estimatedHours: newEstimatedHours 
        }),
      });
      
      if (response.ok) {
        setIsOpen(false);
        toast.success("Projeto editado com sucesso!");
        router.refresh();
      } else {
        throw new Error("Falha ao editar projeto");
      }
    } catch (error) {
      console.error("Falha ao editar o projeto", error);
      toast.error("Falha ao editar o projeto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Editar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar projeto</DialogTitle>
            <DialogDescription>
              Altere os detalhes do seu projeto. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {/* Estimated Hours Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Tempo (horas)
              </Label>
              <Input
                id="hours"
                type="number"
                value={newEstimatedHours}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEstimatedHours(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 8"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}