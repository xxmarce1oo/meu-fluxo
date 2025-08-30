// src/types/index.ts

// Originalmente em src/lib/project-service.ts
export interface ProjectData {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  estimatedHours: number;
  details?: string;
  notes?: string;
}

// Originalmente em src/lib/project-service.ts
export interface ObservationData {
  id: string;
  text: string;
  createdAt: number;
  projectId: string;
}

// Originalmente em src/lib/project-service.ts
export interface TimeLogData {
  id: string;
  userId: string;
  projectId: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number; // em segundos
  createdAt: number;
}

// Originalmente em src/app/api/goals/route.ts
export interface UserGoals {
  daily: number;
  weekly: number;
  monthly: number;
}

// Originalmente em src/lib/analytics-service.ts
export interface ProgressReport {
  daily: { goal: number; completed: number };
  weekly: { goal: number; completed: number };
  monthly: { goal: number; completed: number };
}

export interface TransactionData {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: number; // Data da compra
  invoiceDate: number; // << ADICIONE ESTA LINHA (Data em que a compra entra na fatura)
  createdAt: number;
  category?: string;
  paidBy?: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
  installments?: number;
  currentInstallment?: number;
  creditCard?: string;
}

// Interface para cartões de crédito
export interface CreditCardData {
  id: string;
  userId: string;
  name: string; // Nome do cartão (ex: "Nubank", "Inter", "Itaú")
  bank: string; // Banco emissor
  lastFourDigits: string; // Últimos 4 dígitos
  creditLimit: number; // Limite do cartão
  dueDay: number; // Dia do vencimento da fatura (1-31)
  closingDay: number; // Dia do fechamento da fatura (1-31)
  isActive: boolean; // Se o cartão está ativo
  createdAt: number;
}

// Interface para resumo por banco
export interface BankSummary {
  bankName: string;
  cards: CreditCardData[];
  totalSpent: number;
  totalLimit: number;
  nextDueDate: Date;
  transactions: TransactionData[];
}