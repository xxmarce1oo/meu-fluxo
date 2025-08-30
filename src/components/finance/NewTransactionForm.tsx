// src/components/finance/NewTransactionForm.tsx
"use client";

import { useState, useEffect } from "react";
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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CreditCardData } from "@/types";

// Interface para definir as propriedades que o componente aceita
interface NewTransactionFormProps {
  onTransactionCreated: () => void;
}

export default function NewTransactionForm({ onTransactionCreated }: NewTransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // router não é mais necessário para refresh, mas pode ser útil para outras coisas
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState("Gastos");
  const [paidBy, setPaidBy] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "pix" | "cash">("debit");
  const [installments, setInstallments] = useState(1);
  const [creditCard, setCreditCard] = useState("");
  const [availableCards, setAvailableCards] = useState<CreditCardData[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    if (isOpen && paymentMethod === 'credit') {
      fetchCreditCards();
    }
  }, [isOpen, paymentMethod]);

  useEffect(() => {
    if (type === 'income') {
      setPaymentMethod('pix');
      setCategory('Receita');
      setInstallments(1);
      setCreditCard("");
    } else {
      setPaymentMethod('debit');
      setCategory('Gastos');
    }
  }, [type]);

  const fetchCreditCards = async () => {
    setLoadingCards(true);
    try {
      const response = await fetch('/api/finance/credit-cards');
      if (response.ok) {
        const cards = await response.json();
        setAvailableCards(cards.filter((card: CreditCardData) => card.isActive));
      }
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast.error("Por favor, insira um valor válido.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: numericAmount,
          type,
          date: date.getTime(),
          category,
          paidBy: type === 'expense' ? paidBy : undefined,
          paymentMethod: type === 'expense' ? paymentMethod : 'pix', // Garante um valor padrão para receita
          installments: type === 'expense' && paymentMethod === 'credit' ? installments : undefined,
          creditCard: type === 'expense' && paymentMethod === 'credit' ? creditCard : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao salvar transação");
      }

      toast.success("Transação salva com sucesso!");
      
      onTransactionCreated(); // Chama a função para atualizar os dados na página pai

      // Limpa o formulário
      setIsOpen(false);
      setDescription("");
      setAmount("");
      setType("expense");
      setCategory("Gastos");
      setPaidBy("");
      setDate(new Date());
      setPaymentMethod("debit");
      setInstallments(1);
      setCreditCard("");

    } catch (error) {
      console.error(error);
      toast.error(`Falha ao salvar a transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>+ Nova Transação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Transação</DialogTitle>
            <DialogDescription>Registre uma nova despesa ou receita.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Valor (R$)</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="Ex: 59,90" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select onValueChange={(value: "expense" | "income") => setType(value)} defaultValue={type}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="col-span-3 justify-start font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{format(date, "dd/MM/yyyy")}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus /></PopoverContent>
              </Popover>
            </div>

            {type === 'expense' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Categoria</Label>
                  <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gastos">Gastos</SelectItem>
                      <SelectItem value="Revisão">Revisão</SelectItem>
                      <SelectItem value="Lazer">Lazer</SelectItem>
                      <SelectItem value="Moradia">Moradia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paidBy" className="text-right">Pago por</Label>
                  <Input id="paidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="col-span-3" placeholder="Ex: Lorena 2/3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentMethod" className="text-right">Pagamento</Label>
                  <Select onValueChange={(value: "credit" | "debit" | "pix" | "cash") => setPaymentMethod(value)} value={paymentMethod}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Método de pagamento" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'credit' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="creditCard" className="text-right">Cartão</Label>
                      <Select onValueChange={setCreditCard} value={creditCard} required>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder={loadingCards ? "Carregando..." : "Selecione um cartão"} /></SelectTrigger>
                        <SelectContent>
                          {availableCards.map(card => (<SelectItem key={card.id} value={card.name}>{card.name} ({card.bank}) - *{card.lastFourDigits}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="installments" className="text-right">Parcelas</Label>
                      <Select onValueChange={(value) => setInstallments(parseInt(value))} value={installments.toString()}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Número de parcelas" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">À vista (1x)</SelectItem>
                          {[...Array(11)].map((_, i) => (<SelectItem key={i + 2} value={(i + 2).toString()}>{i + 2}x</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}