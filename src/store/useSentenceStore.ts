import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Sentence, SentenceDifficulty, SentenceStatus, SentenceTag, Category, SupportedLanguage } from "@/types";
import { getCategoryName } from "@/utils/categoryHelpers";
import { useSettingsStore } from "./useSettingsStore";
import { useProgressStore } from "./useProgressStore";
import { useAchievementStore } from "./useAchievementStore";
import { readCache, writeCache } from "@/lib/offlineCache";
import { useOfflineQueueStore, createQueueItem } from "./useOfflineQueueStore";
import { useNetworkStore } from "./useNetworkStore";

type DbRow = Record<string, unknown>;

function toKeywordsArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function getLangText(row: DbRow, lang: SupportedLanguage): string {
  return (row[`text_${lang}`] as string) || (row.text_en as string) || (row.text_tr as string) || "";
}

function getLangKeywords(row: DbRow, lang: SupportedLanguage): string[] {
  return toKeywordsArray(row[`keywords_${lang}`] ?? null);
}

function getCatName(cat: DbRow | null, lang: SupportedLanguage): string {
  if (!cat) return "";
  return (cat[`name_${lang}`] as string) || (cat.name_en as string) || "";
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
  favoriteIds: string[];
  loading: boolean;
  error: string | null;

  loadSentences: (filters?: SentenceFilters) => Promise<void>;
  loadPresetSentences: (categoryId?: number, isPremium?: boolean) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (id: string, isPreset: boolean) => Promise<void>;
  addSentence: (data: {
    source_text: string;
    target_text: string;
    keywords: string[];
    category_id?: number;
    source_lang?: string;
    target_lang?: string;
    is_ai_generated?: boolean;
    tag?: SentenceTag | null;
  }) => Promise<{ success: boolean; error?: string }>;
  updateSentence: (
    id: string,
    updates: {
      source_text?: string;
      target_text?: string;
      keywords?: string[];
      category_id?: number;
      status?: SentenceStatus;
      tag?: SentenceTag | null;
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

// ─── Cache keys ────────────────────────────────────────────────────────────────
const CACHE_CATEGORIES = "categories";
/**
 * Preset sentence cache key is scoped by language pair AND entitlement level.
 * This prevents free users from reading premium-only cached data and vice versa.
 * The `:premium` / `:free` suffix ensures separate storage for each tier.
 */
function cacheKeyPresets(uiLang: string, targetLang: string, isPremium: boolean) {
  return `preset_sentences:${uiLang}_${targetLang}:${isPremium ? "premium" : "free"}`;
}
function cacheKeyUserSentences(userId: string) {
  return `user_sentences:${userId}`;
}
function cacheKeyFavorites(userId: string) {
  return `favorites:${userId}`;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  sentences: [],
  presetSentences: [],
  categories: [],
  favoriteIds: [],
  loading: false,
  error: null,

  // ─── Favorites ───────────────────────────────────────────────────────────────

  loadFavorites: async () => {
    // getSession() reads from AsyncStorage — safe offline, no network call.
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) {
      set({ favoriteIds: [] });
      return;
    }

    // 1. Hydrate from cache immediately (no loading spinner for cache hits)
    const cached = await readCache<string[]>(cacheKeyFavorites(user.id));
    if (cached) {
      set({ favoriteIds: cached });
    }

    // 2. Fetch from network; update cache on success
    const { data } = await supabase
      .from("sentence_favorites")
      .select("sentence_id")
      .eq("user_id", user.id);
    if (data) {
      const ids = data.map((r: Record<string, unknown>) => r.sentence_id as string);
      set({ favoriteIds: ids });
      void writeCache(cacheKeyFavorites(user.id), ids);
    }
  },

  toggleFavorite: async (id: string, isPreset: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return;

    const { favoriteIds } = get();
    const isFav = favoriteIds.includes(id);

    // 1. Optimistic update
    const updated = isFav
      ? favoriteIds.filter((fid) => fid !== id)
      : [...favoriteIds, id];
    set({ favoriteIds: updated });

    // 2. Write cache immediately (before network) so offline reads are correct
    void writeCache(cacheKeyFavorites(user.id), updated);

    // 3. Try remote write; on failure queue for later
    const isOnline = useNetworkStore.getState().isOnline;
    if (isOnline) {
      const { error } = isFav
        ? await supabase
            .from("sentence_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("sentence_id", id)
        : await supabase.from("sentence_favorites").insert({
            user_id: user.id,
            sentence_id: id,
            is_preset: isPreset,
          });
      if (!error) return; // success — nothing to queue
    }

    // Offline or remote failed → enqueue (dedupeKey ensures last toggle wins)
    void useOfflineQueueStore.getState().addItem(
      createQueueItem(
        isFav ? "favorite_remove" : "favorite_add",
        isFav ? { sentenceId: id } : { sentenceId: id, isPreset },
        { dedupeKey: `favorite:${id}` }
      )
    );
  },

  // ─── Categories ──────────────────────────────────────────────────────────────

  loadCategories: async () => {
    // 1. Cache-first: show cached categories immediately without spinner
    const cached = await readCache<Category[]>(CACHE_CATEGORIES);
    if (cached) {
      set({ categories: cached });
    }

    // 2. Background network fetch; update state + cache on success
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (data) {
      set({ categories: data as Category[] });
      void writeCache(CACHE_CATEGORIES, data);
    }
  },

  // ─── Preset sentences ─────────────────────────────────────────────────────

  loadPresetSentences: async (categoryId?: number, isPremium: boolean = false) => {
    const { uiLanguage, targetLanguage } = useSettingsStore.getState();
    // Cache key includes entitlement scope — free and premium datasets never share storage.
    const cacheKey = cacheKeyPresets(uiLanguage, targetLanguage, isPremium);

    // 1. Hydrate from cache immediately; skip spinner if we have cached data
    if (!categoryId) {
      // Only use global cache for the full (unfiltered) list
      const cached = await readCache<Sentence[]>(cacheKey);
      if (cached) {
        set({ presetSentences: cached });
        // Don't return early — still revalidate in background
      } else {
        set({ loading: true, error: null });
      }
    } else {
      set({ loading: true, error: null });
    }

    try {
      // Only fetch columns needed for the active language pair + fallback columns
      const sentenceCols = [...new Set([
        "id", "category_id", "sort_order", "difficulty",
        `text_${uiLanguage}`,
        `text_${targetLanguage}`,
        "text_en",   // getLangText fallback
        "text_tr",   // getLangText fallback
        `keywords_${targetLanguage}`,
      ])].join(", ");
      const catCols = [...new Set([`name_${uiLanguage}`, "name_en"])].join(", ");

      let query = supabase
        .from("sentences")
        .select(`${sentenceCols}, categories(${catCols})`)
        .order("sort_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      } else if (!isPremium) {
        // Free users: only load sentences from free categories
        const { data: freeCats, error: freeCatsError } = await supabase
          .from("categories")
          .select("id")
          .eq("is_free", true);

        // Network failed — keep whatever cached data is already set and bail
        if (freeCatsError) {
          set({ loading: false });
          return;
        }

        const freeCatIds = (freeCats ?? []).map((c: DbRow) => c.id);
        if (freeCatIds.length > 0) {
          query = query.in("category_id", freeCatIds);
        } else {
          set({ presetSentences: [], loading: false });
          return;
        }
      }

      const { data, error } = await query;
      if (error) {
        // Network error — keep showing cached data (already set above)
        set({ error: error.message, loading: false });
        return;
      }

      const rows = (data || []) as unknown as DbRow[];

      // Fetch all generated visuals
      const visualMap: Record<string, string> = {};
      const { data: visuals, error: visualsError } = await supabase
        .from("sentence_visuals")
        .select("sentence_id, image_path")
        .eq("image_generation_status", "generated")
        .not("image_path", "is", null);

      if (__DEV__) {
        console.log("[sentence_visuals] fetched:", visuals?.length, "error:", visualsError?.message);
      }

      if (visuals) {
        for (const v of visuals as { sentence_id: number; image_path: string }[]) {
          const { data: urlData } = supabase.storage
            .from("sentence-images")
            .getPublicUrl(v.image_path);
          if (urlData?.publicUrl) {
            visualMap[String(v.sentence_id)] = urlData.publicUrl;
          }
        }
      }

      const mapped: Sentence[] = rows.map((row) => ({
        id: String(row.id),
        source_text: getLangText(row, uiLanguage),
        target_text: getLangText(row, targetLanguage),
        keywords: getLangKeywords(row, targetLanguage),
        category_id: row.category_id as number | undefined,
        category_name: getCatName(row.categories as DbRow | null, uiLanguage),
        status: "new" as SentenceStatus,
        is_preset: true,
        difficulty: (row.difficulty as SentenceDifficulty) ?? undefined,
        visual_image_url: visualMap[String(row.id)],
      }));

      set({ presetSentences: mapped, loading: false });

      // Persist to cache only for full (unfiltered) list.
      // Also write a per-user hint so offline startup hydration can locate the
      // correct language-pair cache next cold start without re-reading settings
      // from Supabase.
      if (!categoryId) {
        void writeCache(cacheKey, mapped);

        // Production-safety rule:
        // Even when a premium user fetched the full preset dataset online, we
        // also persist a free-safe subset keyed as `:free`. Offline startup
        // hydration only ever reads that conservative cache, which prevents a
        // downgraded user from seeing stale premium-only content while offline.
        if (isPremium) {
          const categorySource =
            get().categories.length > 0
              ? get().categories
              : ((await readCache<Category[]>(CACHE_CATEGORIES)) ?? []);
          const freeCategoryIds = new Set(
            categorySource
              .filter((category) => category.is_free)
              .map((category) => category.id),
          );

          if (freeCategoryIds.size > 0) {
            const freeSubset = mapped.filter((sentence) =>
              sentence.category_id ? freeCategoryIds.has(sentence.category_id) : false,
            );
            void writeCache(cacheKeyPresets(uiLanguage, targetLanguage, false), freeSubset);
          }
        }

        void (async () => {
          const { data: { session: hintSession } } = await supabase.auth.getSession();
          if (hintSession?.user?.id) {
            void writeCache(`user_preset_hint:${hintSession.user.id}`, {
              uiLanguage,
              targetLanguage,
              isPremium,
            });
          }
        })();
      }
    } catch {
      set({ error: "Failed to load preset sentences", loading: false });
    }
  },

  // ─── User sentences ───────────────────────────────────────────────────────

  loadSentences: async (filters: SentenceFilters = {}) => {
    try {
      // getSession() reads locally — safe for offline cache-first phase.
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        set({ sentences: [], loading: false });
        return;
      }

      const { uiLanguage, targetLanguage } = useSettingsStore.getState();
      const { categories } = get();

      // 1. Cache-first (only for unfiltered fetch)
      const hasFilters = filters.status || filters.category_id || filters.search;
      if (!hasFilters) {
        const cached = await readCache<Sentence[]>(cacheKeyUserSentences(user.id));
        if (cached) {
          set({ sentences: cached });
          // Continue to background refresh
        } else {
          set({ loading: true, error: null });
        }
      } else {
        set({ loading: true, error: null });
      }

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

      const mapped: Sentence[] = (data || []).map((row: DbRow) => {
        const cat = categories.find((c) => c.id === row.category_id);
        return {
          id: String(row.id),
          user_id: row.user_id as string | undefined,
          source_text: (row.source_text as string) || "",
          target_text: (row.target_text as string) || "",
          keywords: toKeywordsArray(row.keywords),
          category_id: row.category_id as number | undefined,
          category_name: cat ? getCategoryName(cat, uiLanguage) : "",
          status: ((row.state as string) || "new") as SentenceStatus,
          is_preset: false,
          is_ai_generated: (row.is_ai_generated as boolean) ?? false,
          tag: (row.tag as SentenceTag | null) ?? null,
          source_lang: (row.source_lang as SupportedLanguage | undefined) ?? uiLanguage,
          target_lang: (row.target_lang as SupportedLanguage | undefined) ?? targetLanguage,
          created_at: row.created_at as string | undefined,
          updated_at: row.updated_at as string | undefined,
        };
      });

      set({ sentences: mapped, loading: false });

      // Persist full unfiltered list to cache
      if (!hasFilters) {
        void writeCache(cacheKeyUserSentences(user.id), mapped);
      }
    } catch {
      set({ error: "Failed to load sentences", loading: false });
    }
  },

  addSentence: async ({ source_text, target_text, keywords, category_id, source_lang, target_lang, is_ai_generated, tag }) => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
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
          is_ai_generated: is_ai_generated ?? false,
          tag: tag ?? null,
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
        category_name: cat ? getCategoryName(cat, uiLanguage) : "",
        status: "learning",
        is_preset: false,
        tag: tag ?? null,
        source_lang: source_lang as Sentence["source_lang"],
        target_lang: target_lang as Sentence["target_lang"],
        created_at: data.created_at,
      };

      const updated = [newSentence, ...get().sentences];
      set({ sentences: updated, loading: false });
      void writeCache(cacheKeyUserSentences(user.id), updated);
      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: "Failed to add sentence" };
    }
  },

  updateSentence: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.source_text !== undefined) dbUpdates.source_text = updates.source_text;
      if (updates.target_text !== undefined) dbUpdates.target_text = updates.target_text;
      if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
      if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
      if (updates.status !== undefined) dbUpdates.state = updates.status;
      if ("tag" in updates) dbUpdates.tag = updates.tag ?? null;

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
          category_name: cat ? getCategoryName(cat, uiLanguage) : s.category_name,
        };
      });

      set({ sentences: updatedSentences, loading: false });

      // Update cache with latest data
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (user) {
        void writeCache(cacheKeyUserSentences(user.id), updatedSentences);
      }

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

      const updated = get().sentences.filter((s) => s.id !== id);
      set({ sentences: updated, loading: false });

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (user) {
        void writeCache(cacheKeyUserSentences(user.id), updated);
      }

      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: "Failed to delete sentence" };
    }
  },

  addToLearningList: async (id) => {
    const isPreset = get().presetSentences.some((s) => s.id === id);
    if (isPreset) {
      await useProgressStore.getState().addToLearning(id);
    } else {
      await get().updateSentence(id, { status: "learning" });
    }
  },

  removeFromLearningList: async (id) => {
    const isPreset = get().presetSentences.some((s) => s.id === id);
    if (isPreset) {
      await useProgressStore.getState().forgot(id);
    } else {
      await get().updateSentence(id, { status: "new" });
    }
  },

  markAsLearned: async (id) => {
    const isPreset = get().presetSentences.some((s) => s.id === id);
    if (isPreset) {
      // Achievement check is triggered inside useProgressStore.markAsLearned
      await useProgressStore.getState().markAsLearned(id);
    } else {
      await get().updateSentence(id, { status: "learned" });

      // Write learned_at so this event counts toward streak (same as preset sentences)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (user) {
        await supabase
          .from("user_sentences")
          .update({ learned_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);
      }

      // Calculate total learned across user sentences + preset sentences
      const userLearnedCount = get().sentences.filter((s) => s.status === "learned").length;
      const presetLearnedCount = Object.values(useProgressStore.getState().progressMap).filter(
        (s) => s === "learned"
      ).length;
      const { currentStreak, totalQuizQuestions, totalBuildSentences } = useProgressStore.getState().stats;

      await useAchievementStore.getState().checkProgressAchievements({
        totalSentencesLearned: userLearnedCount + presetLearnedCount,
        currentStreak,
        totalQuizQuestions,
        totalBuildSentences,
      });
    }
  },

  markAsUnlearned: async (id) => {
    const isPreset = get().presetSentences.some((s) => s.id === id);
    if (isPreset) {
      await useProgressStore.getState().addToLearning(id);
    } else {
      await get().updateSentence(id, { status: "learning" });
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
      favoriteIds: [],
      loading: false,
      error: null,
    }),
}));
