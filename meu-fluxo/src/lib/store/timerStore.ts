// src/lib/store/timerStore.ts
import { create } from 'zustand';
import { ProjectData } from '../project-service';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedTime: number; // em segundos
  description: string;
  selectedProject: ProjectData | null;
  actions: {
    startTimer: (project: ProjectData, description?: string) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => Promise<void>;
    tick: () => void;
    reset: () => void;
  };
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  startTime: null,
  elapsedTime: 0,
  description: '',
  selectedProject: null,
  actions: {
    startTimer: (project, description = '') =>
      set({
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        elapsedTime: 0,
        selectedProject: project,
        description: description,
      }),
    pauseTimer: () => set({ isPaused: true }),
    resumeTimer: () => set({ isPaused: false }),
    stopTimer: async () => {
      const { startTime, elapsedTime, selectedProject, description, actions } = get();
      if (!startTime || !selectedProject) return;

      const endTime = Date.now();
      const effectiveStartTime = endTime - elapsedTime * 1000;

      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          description,
          startTime: effectiveStartTime,
          endTime,
        }),
      });

      actions.reset();
    },
    tick: () => set(state => ({ elapsedTime: state.elapsedTime + 1 })),
    reset: () => set({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      description: '',
      selectedProject: null,
    }),
  },
}));