// src/components/ObservationItem.tsx
"use client";

import { ObservationData } from "@/lib/project-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

// Precisamos instalar o 'lucide-react' e o 'dropdown-menu'
// npm install lucide-react
// npx shadcn@latest add dropdown-menu

interface ObservationItemProps {
  observation: ObservationData;
}

export default function ObservationItem({ observation }: ObservationItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(observation.text);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que quer deletar esta observação?")) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/projects/${observation.projectId}/observations/${observation.id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await fetch(`/api/projects/${observation.projectId}/observations/${observation.id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: editText }),
      });
      router.refresh();
      setIsEditing(false); // Fecha o modal
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-3 bg-background rounded-md border text-sm flex justify-between items-start">
      <div>
        <p className="whitespace-pre-wrap">{observation.text}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(observation.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'})}
        </p>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Observação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={5} className="my-4"/>
            <DialogFooter>
              <Button type="submit" disabled={isDeleting}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}