"use client";

import { CreditCardData } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CreditCard, 
  MoreHorizontal, 
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getNextDueDate } from "@/lib/credit-card-service";

interface CreditCardListProps {
  cards: CreditCardData[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

export default function CreditCardList({ cards }: CreditCardListProps) {
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleActive = async (cardId: string, currentActiveState: boolean) => {
    setLoadingCardId(cardId);
    try {
      const response = await fetch(`/api/finance/credit-cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActiveState }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar cartão");
      }

      toast.success(currentActiveState ? "Cartão desativado" : "Cartão ativado");
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Falha ao atualizar o cartão.");
    } finally {
      setLoadingCardId(null);
    }
  };

  const handleDelete = async (cardId: string, cardName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o cartão "${cardName}"?`)) {
      return;
    }

    setLoadingCardId(cardId);
    try {
      const response = await fetch(`/api/finance/credit-cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar cartão");
      }

      toast.success("Cartão deletado com sucesso");
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Falha ao deletar o cartão.");
    } finally {
      setLoadingCardId(null);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
        <CreditCard className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">Nenhum cartão cadastrado</h3>
        <p className="text-sm mt-1">Cadastre seus cartões para controlar gastos e faturas.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const nextDueDate = getNextDueDate(card.dueDay);
        const isLoading = loadingCardId === card.id;
        
        return (
          <Card key={card.id} className={`${!card.isActive ? 'opacity-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">
                  {card.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    disabled={isLoading}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleToggleActive(card.id, card.isActive)}
                    disabled={isLoading}
                  >
                    {card.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Ativar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(card.id, card.name)}
                    disabled={isLoading}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <CardDescription>{card.bank}</CardDescription>
                  <p className="text-xs text-muted-foreground">
                    **** **** **** {card.lastFourDigits}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-3 w-3" />
                  <span>Limite: {formatCurrency(card.creditLimit)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>Vence dia {formatDate(nextDueDate)}</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Fecha dia {card.closingDay}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
