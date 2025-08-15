// src/components/layout/TimerEffect.tsx
"use client";

import { useTimerStore } from "@/lib/store/timerStore";
import { useEffect } from "react";

export default function TimerEffect() {
  const { isRunning, isPaused, actions } = useTimerStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        actions.tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, actions]);

  return null; // Este componente não renderiza nada na tela
}