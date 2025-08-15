// src/components/ProjectCreationForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

export default function ProjectCreationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(""); // Add state for hours
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send both name and estimatedHours
        body: JSON.stringify({ name: projectName, estimatedHours: estimatedHours }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar o projeto");
      }

      setIsOpen(false);
      setProjectName("");
      setEstimatedHours(""); // Reset the hours field
      router.refresh();

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>+ Novo Projeto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar novo projeto</DialogTitle>
            <DialogDescription>
              Dê um nome e estime o tempo para começar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Project Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
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
                value={estimatedHours}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstimatedHours(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 8"
                required
              />
            </div>
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