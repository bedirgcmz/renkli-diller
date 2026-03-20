import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Sentence, SentenceStatus, Category, SupportedLanguage } from "@/types";
import { useSettingsStore } from "./useSettingsStore";
import { useProgressStore } from "./useProgressStore";

function toKeywordsArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function getLangText(row: any, lang: SupportedLanguage): string {
  return row[`text_${lang}`] || row.text_en || row.text_tr || "";
}

function getLangKeywords(row: any, lang: SupportedLanguage): string[] {
  return toKeywordsArray(row[`keywords_${lang}`] || null);
}

function getCatName(cat: any, lang: SupportedLanguage): string {
  if (!cat) return "";
  return cat[`name_${lang}`] || cat.name_en || "";
}

interface SentenceFilters {
  status?: SentenceStatus;
  category_id?: number;
  search?: string;
}

interface SentenceState {
  sentences: Sentence[];
  presetSentences: Sentence[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  loadSentences: (filters?: SentenceFilters) => Promise<void>;
  loadPresetSentences: (categoryId?: number, isPremium?: boolean) => Promise<void>;
  loadCategories: () => Promise<void>;
  addSentence: (data: {
    source_text: string;
    target_text: string;
    keywords: string[];
    category_id?: number;
    source_lang?: string;
    target_lang?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateSentence: (
    id: string,
    updates: {
      source_text?: string;
      target_text?: string;
      keywords?: string[];
      category_id?: number;
      status?: SentenceStatus;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteSentence: (id: string) => Promise<{ success: boolean; error?: string }>;
  addToLearningList: (id: string) => Promise<void>;
  removeFromLearningList: (id: string) => Promise<void>;
  markAsLearned: (id: string) => Promise<void>;
  markAsUnlearned: (id: string) => Promise<void>;
  getNextSentence: () => Sentence | null;
  getLearnedCount: () => number;
  getLearningCount: () => number;
  clear: () => void;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  sentences: [],
  presetSentences: [],
  categories: [],
  loading: false,
  error: null,

  loadCategories: async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (data) {
      set({ categories: data as Category[] });
    }
  },

  loadPresetSentences: async (categoryId?: number, isPremium: boolean = true) => {
    set({ loading: true, error: null });
    try {
      const { uiLanguage, targetLanguage } = useSettingsStore.getState();
      let query = supabase
        .from("sentences")
        .select("*, categories(name_tr, name_en, name_sv, name_de, name_es, name_fr, name_pt)")
        .order("sort_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (!isPremium) {
        // Free users: only load sentences from free categories
        const { data: freeCats } = await supabase
          .from("categories")
          .select("id")
          .eq("is_free", true);
        const freeCatIds = freeCats?.map((c: any) => c.id) ?? [];
        if (freeCatIds.length > 0) {
          query = query.in("category_id", freeCatIds);
        } else {
          set({ presetSentences: [], loading: false });
          return;
        }
      }

      const { data, error } = await query;
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      const mapped: Sentence[] = (data || []).map((row: any) => ({
        id: String(row.id),
        source_text: getLangText(row, uiLanguage),
        target_text: getLangText(row, targetLanguage),
        keywords: getLangKeywords(row, targetLanguage),
        category_id: row.category_id,
        category_name: getCatName(row.categories, uiLanguage),
        status: "new" as SentenceStatus,
        is_preset: true,
      }));

      set({ presetSentences: mapped, loading: false });
    } catch {
      set({ error: "Failed to load preset sentences", loading: false });
    }
  },

  loadSentences: async (filters: SentenceFilters = {}) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ sentences: [], loading: false });
        return;
      }

      const { uiLanguage } = useSettingsStore.getState();
      const { categories } = get();

      let query = supabase
        .from("user_sentences")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("state", filters.status);
      }
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.search) {
        query = query.or(
          `source_text.ilike.%${filters.search}%,target_text.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      const mapped: Sentence[] = (data || []).map((row: any) => {
        const cat = categories.find((c) => c.id === row.category_id);
        return {
          id: String(row.id),
          user_id: row.user_id,
          source_text: row.source_text || "",
          target_text: row.target_text || "",
          keywords: toKeywordsArray(row.keywords),
          category_id: row.category_id,
          category_name: cat
            ? (cat[`name_${uiLanguage}` as keyof Category] as string)
            : "",
          status: (row.state || "new") as SentenceStatus,
          is_preset: false,
          source_lang: row.source_lang ?? undefined,
          target_lang: row.target_lang ?? undefined,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });

      set({ sentences: mapped, loading: false });
    } catch {
      set({ error: "Failed to load sentences", loading: false });
    }
  },

  addSentence: async ({ source_text, target_text, keywords, category_id, source_lang, target_lang }) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return { success: false, error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("user_sentences")
        .insert({
          user_id: user.id,
          source_text,
          target_text,
          keywords,
          category_id,
          state: "learning",
          source_lang: source_lang ?? null,
          target_lang: target_lang ?? null,
        })
        .select()
        .single();

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      const { categories } = get();
      const { uiLanguage } = useSettingsStore.getState();
      const cat = categories.find((c) => c.id === category_id);
      const newSentence: Sentence = {
        id: String(data.id),
        user_id: user.id,
        source_text,
        target_text,
        keywords,
        category_id,
        category_name: cat
          ? (cat[`name_${uiLanguage}` as keyof Category] as string)
          : "",
        status: "learning",
        is_preset: false,
        source_lang: source_lang as Sentence["source_lang"],
        target_lang: target_lang as Sentence["target_lang"],
        created_at: data.created_at,
      };

      const { sentences } = get();
      set({ sentences: [newSentence, ...sentences], loading: false });
      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: "Failed to add sentence" };
    }
  },

  updateSentence: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.source_text !== undefined) dbUpdates.source_text = updates.source_text;
      if (updates.target_text !== undefined) dbUpdates.target_text = updates.target_text;
      if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
      if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
      if (updates.status !== undefined) dbUpdates.state = updates.status;

      const { error } = await supabase
        .from("user_sentences")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      const { sentences, categories } = get();
      const { uiLanguage } = useSettingsStore.getState();
      const updatedSentences = sentences.map((s) => {
        if (s.id !== id) return s;
        const catId = updates.category_id ?? s.category_id;
        const cat = categories.find((c) => c.id === catId);
        return {
          ...s,
          ...updates,
          category_name: cat
            ? (cat[`name_${uiLanguage}` as keyof Category] as string)
            : s.category_name,
        };
      });

      set({ sentences: updatedSentences, loading: false });
      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: "Failed to update sentence" };
    }
  },

  deleteSentence: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("user_sentences")
        .delete()
        .eq("id", id);

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      const { sentences } = get();
      set({ sentences: sentences.filter((s) => s.id !== id), loading: false });
      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: "Failed to delete sentence" };
    }
  },

  addToLearningList: async (id) => {
    const { presetSentences } = get();
    if (presetSentences.find((s) => s.id === id)) {
      await useProgressStore.getState().addToLearning(id);
    } else {
      await get().updateSentence(id, { status: "learning" });
    }
  },

  removeFromLearningList: async (id) => {
    const { presetSentences } = get();
    if (presetSentences.find((s) => s.id === id)) {
      await useProgressStore.getState().forgot(id);
    } else {
      await get().updateSentence(id, { status: "new" });
    }
  },

  markAsLearned: async (id) => {
    const { presetSentences } = get();
    if (presetSentences.find((s) => s.id === id)) {
      await useProgressStore.getState().markAsLearned(id);
    } else {
      await get().updateSentence(id, { status: "learned" });
    }
  },

  markAsUnlearned: async (id) => {
    const { presetSentences } = get();
    if (presetSentences.find((s) => s.id === id)) {
      await useProgressStore.getState().forgot(id);
    } else {
      await get().updateSentence(id, { status: "new" });
    }
  },

  getNextSentence: () => {
    const learning = get().sentences.filter((s) => s.status === "learning");
    return learning.length > 0 ? learning[0] : null;
  },

  getLearnedCount: () => get().sentences.filter((s) => s.status === "learned").length,

  getLearningCount: () => get().sentences.filter((s) => s.status === "learning").length,

  clear: () =>
    set({
      sentences: [],
      presetSentences: [],
      categories: [],
      loading: false,
      error: null,
    }),
}));
