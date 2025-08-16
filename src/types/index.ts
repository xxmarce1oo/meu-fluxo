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
  amount: number; // Armazenaremos como um número
  type: 'income' | 'expense'; // Receita ou Despesa
  date: number; // Usaremos um timestamp para a data
  createdAt: number;
}