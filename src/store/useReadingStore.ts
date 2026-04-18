/**
 * useReadingStore.ts
 *
 * Phase 2 offline-resilience additions
 * ─────────────────────────────────────
 * • fetchProgress: cache-first — hydrates from AsyncStorage immediately, then
 *   refreshes from the network if online and writes a fresh snapshot back.
 * • fetchNextText: offline guard — if offline, loads the last cached text and
 *   keywords instead of attempting any network calls. Skips the server-side
 *   "shown_at: today" assignment write entirely.
 * • markAsCompleted: optimistic-first + queue-backed — updates local state
 *   immediately, attempts the network upsert if online, and falls back to the
 *   offline queue on failure so the completion is not lost.
 *
 * Accepted Phase 2 tradeoff — date/assignment divergence
 * ────────────────────────────────────────────────────────
 * When the app opens offline the server assignment write (upsert with
 * status:"assigned", shown_at: today) is skipped. On the next online session,
 * fetchNextText reconciles server-side. In the common case the user also
 * completed the text offline: the queued markAsCompleted fires on reconnect
 * with today's date, so fetchNextText step-2 (completed today) finds it and
 * shows the same text — consistent behaviour. Edge cases (day-change while
 * offline, multiple-day gap) may produce a one-off mismatch; this is accepted
 * for Phase 2 and tracked for Phase 3.
 *
 * Cache keys (user-scoped, cleared by clearUserCache on logout)
 * ──────────────────────────────────────────────────────────────
 * reading_progress:{userId}    — UserReadingProgress[]
 * reading_current:{userId}     — { text: ReadingText, keywords: ReadingTextKeyword[] }
 *
 * Note: cache keys are NOT language-pair-scoped because reading_texts rows
 * contain content for all language pairs in a single row; the correct body_*
 * and keyword_* fields are selected at render time by ReadingScreen.
 */

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  ReadingText,
  ReadingTextKeyword,
  UserReadingProgress,
  CompletedReadingEntry,
} from "@/types";
import { readCache, writeCache } from "@/lib/offlineCache";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useOfflineQueueStore, createQueueItem } from "@/store/useOfflineQueueStore";

// ── Cache keys ─────────────────────────────────────────────────────────────────

function cacheKeyProgress(userId: string) {
  return `reading_progress:${userId}`;
}

function cacheKeyCurrentText(userId: string) {
  return `reading_current:${userId}`;
}

// ── Cache shapes ───────────────────────────────────────────────────────────────

interface ReadingCurrentCache {
  text: ReadingText;
  keywords: ReadingTextKeyword[];
}

// ── Store interface ────────────────────────────────────────────────────────────

interface ReadingState {
  currentText: ReadingText | null;
  keywords: ReadingTextKeyword[];
  progress: UserReadingProgress[];
  loading: boolean;
  error: string | null;

  fetchNextText: (userId: string, forceNew?: boolean, isPremium?: boolean) => Promise<void>;
  fetchProgress: (userId: string) => Promise<void>;
  markAsCompleted: (userId: string, textId: string) => Promise<void>;
  markAsUncompleted: (userId: string, textId: string) => Promise<void>;
  fetchCompletedTexts: (userId: string) => Promise<CompletedReadingEntry[]>;
  getTodayCount: () => number;
  getLearnedCount: () => number;
  getReadingStreak: () => number;
  clear: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useReadingStore = create<ReadingState>((set, get) => ({
  currentText: null,
  keywords: [],
  progress: [],
  loading: false,
  error: null,

  fetchProgress: async (userId) => {
    // 1. Hydrate from cache immediately — no spinner if we have cached data
    const cached = await readCache<UserReadingProgress[]>(cacheKeyProgress(userId));
    if (cached) {
      set({ progress: cached });
    }

    // 2. If offline, stop here — cached state is all we have
    const isOnline = useNetworkStore.getState().isOnline;
    if (isOnline === false) return;

    // 3. Fetch from network
    const { data } = await supabase
      .from("user_reading_progress")
      .select("*")
      .eq("user_id", userId);

    if (data) {
      set({ progress: data as UserReadingProgress[] });
      void writeCache(cacheKeyProgress(userId), data);
    }
  },

  fetchNextText: async (userId, forceNew = false, isPremium = false) => {
    set({ loading: true, error: null });

    // ── Offline path ─────────────────────────────────────────────────────────
    // Skip all network calls (including the server-side assignment write).
    // Load the last cached text so the user can still read offline.
    // See module-level comment for the accepted date/assignment divergence tradeoff.
    const isOnline = useNetworkStore.getState().isOnline;
    if (isOnline === false) {
      const cached = await readCache<ReadingCurrentCache>(cacheKeyCurrentText(userId));
      if (cached) {
        set({ currentText: cached.text, keywords: cached.keywords, loading: false });
      } else {
        set({ currentText: null, keywords: [], loading: false });
      }
      return;
    }

    // ── Online path ──────────────────────────────────────────────────────────
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Check for today's assigned (not yet completed) text
      const { data: todayAssigned } = await supabase
        .from("user_reading_progress")
        .select("reading_text_id")
        .eq("user_id", userId)
        .eq("status", "assigned")
        .eq("shown_at", today)
        .maybeSingle();

      let textId: string | null = todayAssigned?.reading_text_id ?? null;

      // 2. If no assigned text and not forcing a new one, check if today has a completed text
      //    (handles navigation back after completing — same text stays, doesn't reset)
      if (!textId && !forceNew) {
        const { data: todayCompleted } = await supabase
          .from("user_reading_progress")
          .select("reading_text_id")
          .eq("user_id", userId)
          .eq("status", "completed")
          .eq("shown_at", today)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        textId = todayCompleted?.reading_text_id ?? null;
      }

      if (!textId) {
        // 3. No text for today — pick next uncompleted text from pool
        // Exclude only COMPLETED texts — assigned-but-incomplete texts from past days return to pool
        const { data: completed } = await supabase
          .from("user_reading_progress")
          .select("reading_text_id")
          .eq("user_id", userId)
          .eq("status", "completed");

        const completedIds = completed?.map((p: any) => p.reading_text_id) ?? [];

        let query = supabase
          .from("reading_texts")
          .select("id")
          .order("order_index")
          .limit(1);

        if (!isPremium) {
          query = query.eq("is_premium", false);
        }

        if (completedIds.length > 0) {
          query = query.not("id", "in", `(${completedIds.join(",")})`);
        }

        const { data: nextText } = await query.maybeSingle();

        if (!nextText) {
          set({ currentText: null, keywords: [], loading: false });
          return;
        }

        textId = nextText.id;

        // Assign this text for today
        await supabase.from("user_reading_progress").upsert(
          {
            user_id: userId,
            reading_text_id: textId,
            status: "assigned",
            shown_at: today,
            completed_at: null,
          },
          { onConflict: "user_id,reading_text_id" }
        );

        // Update local progress
        set((state) => {
          const exists = state.progress.some((p) => p.reading_text_id === textId);
          const newEntry: UserReadingProgress = {
            id: "",
            user_id: userId,
            reading_text_id: textId!,
            status: "assigned",
            shown_at: today,
            completed_at: null,
          };
          return {
            progress: exists
              ? state.progress.map((p) =>
                  p.reading_text_id === textId ? { ...p, status: "assigned" as const, shown_at: today } : p
                )
              : [...state.progress, newEntry],
          };
        });
      }

      // 4. Fetch full text data
      const { data: textData, error } = await supabase
        .from("reading_texts")
        .select("*")
        .eq("id", textId)
        .single();

      if (error || !textData) {
        set({ currentText: null, keywords: [], loading: false });
        return;
      }

      const { data: kwData } = await supabase
        .from("reading_text_keywords")
        .select("*")
        .eq("reading_text_id", textData.id)
        .order("position_index");

      const text = textData as ReadingText;
      const keywords = (kwData ?? []) as ReadingTextKeyword[];

      set({ currentText: text, keywords, loading: false });

      // 5. Write to cache — enables cold-start offline reading next session
      void writeCache<ReadingCurrentCache>(cacheKeyCurrentText(userId), { text, keywords });
      // Also persist the updated progress array
      void writeCache(cacheKeyProgress(userId), get().progress);
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  markAsCompleted: async (userId, textId) => {
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // 1. Optimistic update — UI responds immediately regardless of network state
    set((state) => {
      const exists = state.progress.some((p) => p.reading_text_id === textId);
      const updatedProgress = exists
        ? state.progress.map((p) =>
            p.reading_text_id === textId
              ? { ...p, status: "completed" as const, completed_at: now, shown_at: today }
              : p
          )
        : [
            ...state.progress,
            {
              id: "",
              user_id: userId,
              reading_text_id: textId,
              status: "completed" as const,
              completed_at: now,
              shown_at: today,
            },
          ];
      return { progress: updatedProgress };
    });

    // 2. Write optimistic progress to cache immediately so cold-start reads
    //    the correct completion state even before a network round-trip
    void writeCache(cacheKeyProgress(userId), get().progress);

    // 3. Try network write if online
    const isOnline = useNetworkStore.getState().isOnline;
    if (isOnline !== false) {
      const { error } = await supabase.from("user_reading_progress").upsert(
        {
          user_id: userId,
          reading_text_id: textId,
          status: "completed",
          completed_at: now,
          shown_at: today,
        },
        { onConflict: "user_id,reading_text_id" }
      );
      if (!error) return; // success — nothing to queue
    }

    // 4. Offline or network failed → enqueue for replay on reconnect
    void useOfflineQueueStore.getState().addItem(
      createQueueItem(
        "reading_mark_completed",
        { textId, completedAt: now, shownAt: today },
        { dedupeKey: `reading_completed:${textId}` }
      )
    );
  },

  markAsUncompleted: async (userId, textId) => {
    await supabase
      .from("user_reading_progress")
      .delete()
      .eq("user_id", userId)
      .eq("reading_text_id", textId);
    set((state) => ({
      progress: state.progress.filter((p) => p.reading_text_id !== textId),
    }));
  },

  fetchCompletedTexts: async (userId) => {
    const { data } = await supabase
      .from("user_reading_progress")
      .select("*, reading_texts(*)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (!data) return [];
    return data
      .filter((row: any) => row.reading_texts)
      .map((row: any) => ({
        progress: {
          id: row.id,
          user_id: row.user_id,
          reading_text_id: row.reading_text_id,
          status: row.status,
          completed_at: row.completed_at,
          shown_at: row.shown_at,
        } as UserReadingProgress,
        text: row.reading_texts as ReadingText,
      }));
  },

  getTodayCount: () => {
    const today = new Date().toISOString().split("T")[0];
    return get().progress.filter(
      (p) => p.status === "completed" && p.completed_at && p.completed_at.split("T")[0] === today
    ).length;
  },

  getLearnedCount: () => {
    return get().progress.filter((p) => p.status === "completed").length;
  },

  getReadingStreak: () => {
    const prog = get().progress.filter((p) => p.status === "completed");
    if (prog.length === 0) return 0;

    const days = [
      ...new Set(prog.map((p) => p.completed_at?.split("T")[0]).filter(Boolean)),
    ].sort().reverse() as string[];

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (days[0] !== today && days[0] !== yesterday) return 0;

    let streak = 0;
    let expected = days[0];
    for (const day of days) {
      if (day === expected) {
        streak++;
        const d = new Date(expected);
        d.setUTCDate(d.getUTCDate() - 1);
        expected = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }
    return streak;
  },

  clear: () =>
    set({
      currentText: null,
      keywords: [],
      progress: [],
      loading: false,
      error: null,
    }),
}));
