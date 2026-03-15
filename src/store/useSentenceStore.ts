import create from 'zustand';
import { Sentence } from '@/types';

interface SentenceState {
  sentences: Sentence[];
  addSentences: (items: Sentence[]) => void;
  clear: () => void;
}

export const useSentenceStore = create<SentenceState>((set) => ({
  sentences: [],
  addSentences: (items) => set({ sentences: items }),
  clear: () => set({ sentences: [] })
}));
