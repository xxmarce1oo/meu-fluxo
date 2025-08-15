// src/components/GoalCircle.tsx
"use client";

interface GoalCircleProps {
  goal: number;
  completed: number;
  label: string;
  className?: string;
}

export default function GoalCircle({ goal, completed, label, className }: GoalCircleProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? (completed / goal) : 0;
  const offset = circumference - Math.min(progress, 1) * circumference;

  const completedFormatted = completed.toFixed(1);
  const goalFormatted = goal.toFixed(1);

  return (
    <div className={`flex flex-col items-center gap-2 p-4 bg-card border rounded-lg shadow-sm ${className}`}>
      <div className="relative h-32 w-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Círculo de fundo */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            className="stroke-muted"
            fill="transparent"
          />
          {/* Círculo de progresso */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            className="stroke-primary"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{completedFormatted}</span>
          <span className="text-sm text-muted-foreground">/ {goalFormatted}h</span>
        </div>
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  );
}