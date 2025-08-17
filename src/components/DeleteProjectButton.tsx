"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteProjectButtonProps {
  projectName: string;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteProjectButton({ 
  projectName, 
  onDelete, 
  isDeleting 
}: DeleteProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isDeleting}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deletando...' : 'Deletar'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Projeto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar o projeto &quot;<strong>{projectName}</strong>&quot;?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados ao projeto, 
            incluindo observações e registros de tempo, serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deletando...' : 'Sim, deletar projeto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
