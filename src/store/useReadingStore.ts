import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  ReadingText,
  ReadingTextKeyword,
  UserReadingProgress,
  CompletedReadingEntry,
} from "@/types";

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
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  currentText: null,
  keywords: [],
  progress: [],
  loading: false,
  error: null,

  fetchProgress: async (userId) => {
    const { data } = await supabase
      .from("user_reading_progress")
      .select("*")
      .eq("user_id", userId);
    if (data) set({ progress: data as UserReadingProgress[] });
  },

  fetchNextText: async (userId, forceNew = false, isPremium = false) => {
    set({ loading: true, error: null });
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

        // 3. Assign this text for today
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

      set({
        currentText: textData as ReadingText,
        keywords: (kwData ?? []) as ReadingTextKeyword[],
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  markAsCompleted: async (userId, textId) => {
    const now = new Date().toISOString();
    const today = now.split("T")[0];
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
    if (error) throw error;
    set((state) => {
      const exists = state.progress.some((p) => p.reading_text_id === textId);
      return {
        progress: exists
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
            ],
      };
    });
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
}));
