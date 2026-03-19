import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ReadingText, ReadingTextKeyword, UserReadingProgress } from "@/types";

interface ReadingState {
  currentText: ReadingText | null;
  keywords: ReadingTextKeyword[];
  progress: UserReadingProgress[];
  loading: boolean;
  error: string | null;

  fetchNextText: (userId: string) => Promise<void>;
  fetchProgress: (userId: string) => Promise<void>;
  markAsRead: (userId: string, textId: string) => Promise<void>;
  markAsLearned: (userId: string, textId: string) => Promise<void>;
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

  fetchNextText: async (userId) => {
    set({ loading: true, error: null });
    try {
      // Get learned text IDs for this user
      const { data: prog } = await supabase
        .from("user_reading_progress")
        .select("reading_text_id")
        .eq("user_id", userId)
        .eq("status", "learned");

      const learnedIds = prog?.map((p: any) => p.reading_text_id) ?? [];

      // Fetch next unlearned text ordered by order_index
      let query = supabase
        .from("reading_texts")
        .select("*")
        .order("order_index")
        .limit(1);

      if (learnedIds.length > 0) {
        query = query.not("id", "in", `(${learnedIds.join(",")})`);
      }

      const { data: textData, error } = await query.single();
      if (error || !textData) {
        set({ currentText: null, keywords: [], loading: false });
        return;
      }

      // Fetch keywords for this text ordered by position
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

  markAsRead: async (userId, textId) => {
    await supabase.from("user_reading_progress").upsert(
      { user_id: userId, reading_text_id: textId, status: "read" },
      { onConflict: "user_id,reading_text_id" }
    );
    await get().fetchProgress(userId);
  },

  markAsLearned: async (userId, textId) => {
    await supabase.from("user_reading_progress").upsert(
      { user_id: userId, reading_text_id: textId, status: "learned" },
      { onConflict: "user_id,reading_text_id" }
    );
    set((state) => ({
      progress: state.progress.some((p) => p.reading_text_id === textId)
        ? state.progress.map((p) =>
            p.reading_text_id === textId ? { ...p, status: "learned" } : p
          )
        : [
            ...state.progress,
            {
              id: "",
              user_id: userId,
              reading_text_id: textId,
              status: "learned",
              completed_at: new Date().toISOString(),
            },
          ],
    }));
  },

  getLearnedCount: () => {
    return get().progress.filter((p) => p.status === "learned").length;
  },

  getReadingStreak: () => {
    const prog = get().progress;
    if (prog.length === 0) return 0;
    // Unique dates with at least one completed reading, descending
    const days = [
      ...new Set(prog.map((p) => p.completed_at.split("T")[0])),
    ].sort().reverse();

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Streak must start from today or yesterday
    if (days[0] !== today && days[0] !== yesterday) return 0;

    let streak = 0;
    let expected = days[0];
    for (const day of days) {
      if (day === expected) {
        streak++;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }
    return streak;
  },
}));
