import create from "zustand";
import { UserProgress } from "@/types";

interface ProgressState {
  progress: UserProgress[];
  addProgress: (item: UserProgress) => void;
  clear: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: [],
  addProgress: (item) => set((state) => ({ progress: [...state.progress, item] })),
  clear: () => set({ progress: [] }),
}));
