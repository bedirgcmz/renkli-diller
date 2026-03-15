import create from "zustand";
import { supabase } from "../lib/supabase";
import { Sentence, SentenceStatus, SentenceCategory } from "@/types";

interface SentenceFilters {
  status?: SentenceStatus;
  category?: SentenceCategory;
  search?: string;
  isPreset?: boolean;
}

interface SentenceState {
  sentences: Sentence[];
  presetSentences: Sentence[];
  loading: boolean;
  error: string | null;

  // Actions
  loadSentences: (filters?: SentenceFilters) => Promise<void>;
  loadPresetSentences: (category?: SentenceCategory) => Promise<void>;
  addSentence: (sentence: Omit<Sentence, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateSentence: (id: string, updates: Partial<Sentence>) => Promise<{ success: boolean; error?: string }>;
  deleteSentence: (id: string) => Promise<{ success: boolean; error?: string }>;
  markAsLearned: (id: string) => Promise<void>;
  markAsUnlearned: (id: string) => Promise<void>;
  addToLearningList: (id: string) => Promise<void>;
  removeFromLearningList: (id: string) => Promise<void>;
  getNextSentence: () => Sentence | null;
  getLearnedCount: () => number;
  getLearningCount: () => number;
  clear: () => void;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  sentences: [],
  presetSentences: [],
  loading: false,
  error: null,

  loadSentences: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('sentences')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`source_text.ilike.%${filters.search}%,target_text.ilike.%${filters.search}%`);
      }
      if (filters.isPreset !== undefined) {
        query = query.eq('is_preset', filters.isPreset);
      }

      const { data, error } = await query;

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({
        sentences: data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: 'Failed to load sentences',
        loading: false,
      });
    }
  },

  loadPresetSentences: async (category) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('sentences')
        .select('*')
        .eq('is_preset', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({
        presetSentences: data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: 'Failed to load preset sentences',
        loading: false,
      });
    }
  },

  addSentence: async (sentenceData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('sentences')
        .insert({
          ...sentenceData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      // Add to local state
      const { sentences } = get();
      set({
        sentences: [data, ...sentences],
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Failed to add sentence' };
    }
  },

  updateSentence: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sentences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const { sentences } = get();
      const updatedSentences = sentences.map(sentence =>
        sentence.id === id ? { ...sentence, ...updates } : sentence
      );

      set({
        sentences: updatedSentences,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Failed to update sentence' };
    }
  },

  deleteSentence: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sentences')
        .delete()
        .eq('id', id);

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      // Remove from local state
      const { sentences } = get();
      const filteredSentences = sentences.filter(sentence => sentence.id !== id);

      set({
        sentences: filteredSentences,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Failed to delete sentence' };
    }
  },

  markAsLearned: async (id) => {
    await get().updateSentence(id, { status: 'learned' });
  },

  markAsUnlearned: async (id) => {
    await get().updateSentence(id, { status: 'new' });
  },

  addToLearningList: async (id) => {
    await get().updateSentence(id, { status: 'learning' });
  },

  removeFromLearningList: async (id) => {
    await get().updateSentence(id, { status: 'new' });
  },

  getNextSentence: () => {
    const { sentences } = get();
    const learningSentences = sentences.filter(s => s.status === 'learning');
    return learningSentences.length > 0 ? learningSentences[0] : null;
  },

  getLearnedCount: () => {
    const { sentences } = get();
    return sentences.filter(s => s.status === 'learned').length;
  },

  getLearningCount: () => {
    const { sentences } = get();
    return sentences.filter(s => s.status === 'learning').length;
  },

  clear: () => set({
    sentences: [],
    presetSentences: [],
    loading: false,
    error: null,
  }),
}));
