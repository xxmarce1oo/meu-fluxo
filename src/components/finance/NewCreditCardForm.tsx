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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

const BANKS = [
  "Nubank",
  "Inter",
  "Itaú",
  "Bradesco",
  "Banco do Brasil",
  "Santander",
  "Caixa",
  "Original",
  "BTG Pactual",
  "C6 Bank",
  "Neon",
  "99Pay",
  "Picpay",
  "Outros"
];

export default function NewCreditCardForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Validações
    const numericCreditLimit = parseFloat(creditLimit);
    if (isNaN(numericCreditLimit) || numericCreditLimit <= 0) {
      toast.error("Por favor, insira um limite de crédito válido.");
      setIsLoading(false);
      return;
    }

    const numericDueDay = parseInt(dueDay);
    if (isNaN(numericDueDay) || numericDueDay < 1 || numericDueDay > 31) {
      toast.error("Dia de vencimento deve ser entre 1 e 31.");
      setIsLoading(false);
      return;
    }

    const numericClosingDay = parseInt(closingDay);
    if (isNaN(numericClosingDay) || numericClosingDay < 1 || numericClosingDay > 31) {
      toast.error("Dia de fechamento deve ser entre 1 e 31.");
      setIsLoading(false);
      return;
    }

    if (lastFourDigits.length !== 4 || !/^\d{4}$/.test(lastFourDigits)) {
      toast.error("Os últimos 4 dígitos devem conter exatamente 4 números.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/finance/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bank,
          lastFourDigits,
          creditLimit: numericCreditLimit,
          dueDay: numericDueDay,
          closingDay: numericClosingDay,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar cartão");
      }

      toast.success("Cartão cadastrado com sucesso!");

      // Limpar formulário
      setIsOpen(false);
      setName("");
      setBank("");
      setLastFourDigits("");
      setCreditLimit("");
      setDueDay("");
      setClosingDay("");
      
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error("Falha ao cadastrar o cartão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Novo Cartão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Cartão de Crédito</DialogTitle>
            <DialogDescription>
              Adicione um novo cartão para controlar os gastos e faturas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3" 
                placeholder="Ex: Cartão Principal"
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank" className="text-right">Banco</Label>
              <Select onValueChange={setBank} value={bank}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map(bankName => (
                    <SelectItem key={bankName} value={bankName}>
                      {bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastFourDigits" className="text-right">Final</Label>
              <Input 
                id="lastFourDigits" 
                value={lastFourDigits} 
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                className="col-span-3" 
                placeholder="0000"
                maxLength={4}
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="creditLimit" className="text-right">Limite (R$)</Label>
              <Input 
                id="creditLimit" 
                type="number" 
                step="0.01" 
                value={creditLimit} 
                onChange={(e) => setCreditLimit(e.target.value)} 
                className="col-span-3" 
                placeholder="5000.00"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="dueDay">Vencimento</Label>
                <Input 
                  id="dueDay" 
                  type="number" 
                  min="1" 
                  max="31" 
                  value={dueDay} 
                  onChange={(e) => setDueDay(e.target.value)} 
                  placeholder="10"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="closingDay">Fechamento</Label>
                <Input 
                  id="closingDay" 
                  type="number" 
                  min="1" 
                  max="31" 
                  value={closingDay} 
                  onChange={(e) => setClosingDay(e.target.value)} 
                  placeholder="5"
                  required 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Cartão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
