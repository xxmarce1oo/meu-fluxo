// src/components/habits/WaterBottle.tsx
"use client";

interface WaterBottleProps {
  currentAmount: number; // em ml
  goalAmount: number;    // em ml
}

export default function WaterBottle({ currentAmount, goalAmount }: WaterBottleProps) {
  // Garante que o preenchimento não passe de 100%
  const fillPercentage = Math.min((currentAmount / goalAmount) * 100, 100);

  return (
    <div className="flex flex-col items-center">
      {/* Garrafa */}
      <div className="relative h-64 w-32 rounded-b-xl rounded-t-lg border-4 border-foreground bg-card">
        {/* Tampa da Garrafa */}
        <div className="absolute -top-4 left-1/2 h-4 w-12 -translate-x-1/2 rounded-t-md border-x-4 border-t-4 border-foreground bg-card"></div>
        
        {/* Água (a parte que enche) */}
        <div 
          className="absolute bottom-0 w-full rounded-b-lg bg-blue-500 transition-all duration-500"
          style={{ height: `${fillPercentage}%` }}
        ></div>
        
        {/* Texto informativo sobre a água */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {currentAmount} ml
          </span>
          <span className="text-sm text-blue-100 drop-shadow-md">
            / {goalAmount} ml
          </span>
        </div>
      </div>
    </div>
  );
}