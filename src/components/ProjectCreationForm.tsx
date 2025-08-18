// src/components/ProjectCreationForm.tsx
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
import { Textarea } from "./ui/textarea"; // <-- IMPORTAR O TEXTAREA

interface ProjectCreationFormProps {
  onProjectCreated?: () => void;
}

export default function ProjectCreationForm({ onProjectCreated }: ProjectCreationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [details, setDetails] = useState(""); // <-- NOVO ESTADO
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, estimatedHours, details }), // <-- ENVIAR DETALHES
      });

      if (!response.ok) {
        throw new Error("Falha ao criar o projeto");
      }

      setIsOpen(false);
      setProjectName("");
      setEstimatedHours("");
      setDetails(""); // <-- LIMPAR O ESTADO
      toast.success("Projeto criado com sucesso!");
      onProjectCreated?.(); // Chama o callback se fornecido
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Falha ao criar o projeto. Tente novamente.");
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
              Preencha as informações principais da sua nova atividade.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="col-span-3" required />
            </div>
            {/* Horas */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">Tempo (horas)</Label>
              <Input id="hours" type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="col-span-3" placeholder="Ex: 8" required />
            </div>
            {/* Detalhes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">Detalhes</Label>
              <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} className="col-span-3" placeholder="Descreva o objetivo desta atividade..." />
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