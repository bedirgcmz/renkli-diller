import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { UserProgress, QuizResult, StudySession } from "@/types";

// TODO: daily_stats tablosuna yazma — şu an streak user_progress.learned_at'tan hesaplanıyor.
// daily_stats tablosu şu an kullanılmıyor; gerekirse her öğrenme/quiz sonrası güncellenebilir.
interface ModeStats { correct: number; total: number }

interface ProgressStats {
  totalSentencesStudied: number;
  totalSentencesLearned: number;
  currentStreak: number;
  longestStreak: number;
  quizAccuracy: number;
  totalQuizQuestions: number;
  correctQuizAnswers: number;
  studyTimeToday: number;
  studyTimeThisWeek: number;
  studyTimeThisMonth: number;
  lastStudyDate: string | null;
  quizByMode: { multiple_choice: ModeStats; fill_blank: ModeStats };
  quizByCategory: Record<string, ModeStats>;
}

interface ProgressState {
  progress: UserProgress[];
  progressMap: Record<string, "learning" | "learned">;
  stats: ProgressStats;
  loading: boolean;
  error: string | null;

  loadProgress: () => Promise<void>;
  loadStats: () => Promise<void>;
  // State-machine actions for preset sentences
  addToLearning: (sentenceId: string) => Promise<void>;
  markAsLearned: (sentenceId: string) => Promise<void>;
  forgot: (sentenceId: string) => Promise<void>;
  // Legacy quiz tracking
  recordStudySession: (session: Omit<StudySession, "id" | "created_at">) => Promise<void>;
  recordQuizResult: (result: Omit<QuizResult, "id" | "answered_at">) => Promise<void>;
  updateSentenceProgress: (sentenceId: string, correct: boolean) => Promise<void>;
  getTodayProgress: () => UserProgress[];
  getWeekProgress: () => UserProgress[];
  getMonthProgress: () => UserProgress[];
  calculateStreak: () => Promise<void>;
  clear: () => void;
}

const DEFAULT_STATS: ProgressStats = {
  totalSentencesStudied: 0,
  totalSentencesLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  quizAccuracy: 0,
  totalQuizQuestions: 0,
  correctQuizAnswers: 0,
  studyTimeToday: 0,
  studyTimeThisWeek: 0,
  studyTimeThisMonth: 0,
  lastStudyDate: null,
  quizByMode: { multiple_choice: { correct: 0, total: 0 }, fill_blank: { correct: 0, total: 0 } },
  quizByCategory: {},
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  progressMap: {},
  stats: DEFAULT_STATS,
  loading: false,
  error: null,

  loadProgress: async () => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      // Build progressMap from rows that have a state field
      const progressMap: Record<string, "learning" | "learned"> = {};
      for (const row of data || []) {
        if (row.state === "learning" || row.state === "learned") {
          progressMap[String(row.sentence_id)] = row.state;
        }
      }

      set({ progress: data || [], progressMap, loading: false });
      await get().loadStats();
    } catch {
      set({ error: "Failed to load progress", loading: false });
    }
  },

  // Öğrenme listesine ekle: new → learning
  addToLearning: async (sentenceId: string) => {
    // Optimistic update
    set((state) => ({
      progressMap: { ...state.progressMap, [sentenceId]: "learning" },
    }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          sentence_id: sentenceId,
          state: "learning",
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,sentence_id" }
      );
    } catch {
      console.error("addToLearning failed");
    }
  },

  // Öğrenildi: learning → learned
  markAsLearned: async (sentenceId: string) => {
    // Optimistic update so UI responds immediately
    set((state) => ({
      progressMap: { ...state.progressMap, [sentenceId]: "learned" },
    }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          sentence_id: sentenceId,
          state: "learned",
          learned_at: new Date().toISOString(),
        },
        { onConflict: "user_id,sentence_id" }
      );

      // Refresh progress array + stats (streak, today's goal) after persistence
      await get().loadProgress();
    } catch {
      console.error("markAsLearned failed");
    }
  },

  // Unuttum: learned/learning → new (sil)
  forgot: async (sentenceId: string) => {
    set((state) => {
      const { [sentenceId]: _removed, ...rest } = state.progressMap;
      return { progressMap: rest };
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("sentence_id", sentenceId);
    } catch {
      console.error("forgot failed");
    }
  },

  loadStats: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Streak & learned counts come from user_progress (the table actually written to).
      // study_sessions is a legacy table that is never written to in the current flow.
      const { data: learnedRows } = await supabase
        .from("user_progress")
        .select("learned_at")
        .eq("user_id", user.id)
        .eq("state", "learned")
        .not("learned_at", "is", null);

      const { data: allProgressRows } = await supabase
        .from("user_progress")
        .select("state")
        .eq("user_id", user.id);

      const { data: quizResults } = await supabase
        .from("quiz_results")
        .select("is_correct, answered_at, quiz_type")
        .eq("user_id", user.id);

      const { data: quizWithCategory } = await supabase
        .from("quiz_results")
        .select("is_correct, quiz_type, sentences(category)")
        .eq("user_id", user.id);

      const { data: studySessionRows } = await supabase
        .from("study_sessions")
        .select("created_at")
        .eq("user_id", user.id);

      const totalSentencesStudied = allProgressRows?.length || 0;
      const totalSentencesLearned =
        allProgressRows?.filter((r) => r.state === "learned").length || 0;

      const totalQuizQuestions = quizResults?.length || 0;
      const correctQuizAnswers = quizResults?.filter((q) => q.is_correct).length || 0;
      const quizAccuracy =
        totalQuizQuestions > 0 ? (correctQuizAnswers / totalQuizQuestions) * 100 : 0;

      const quizByMode: ProgressStats["quizByMode"] = {
        multiple_choice: { correct: 0, total: 0 },
        fill_blank: { correct: 0, total: 0 },
      };
      for (const q of quizResults || []) {
        const mode = q.quiz_type as "multiple_choice" | "fill_blank";
        if (quizByMode[mode]) {
          quizByMode[mode].total++;
          if (q.is_correct) quizByMode[mode].correct++;
        }
      }

      const quizByCategory: ProgressStats["quizByCategory"] = {};
      for (const q of quizWithCategory || []) {
        const cat = (q.sentences as { category?: string } | null)?.category ?? "other";
        if (!quizByCategory[cat]) quizByCategory[cat] = { correct: 0, total: 0 };
        quizByCategory[cat].total++;
        if (q.is_correct) quizByCategory[cat].correct++;
      }

      // Distinct calendar days with ANY activity: learned + quiz answered + auto mode session
      const learnedDays = [
        ...new Set([
          ...(learnedRows || []).map((r) => r.learned_at!.split("T")[0]),
          ...(quizResults || []).filter((r) => r.answered_at != null).map((r) => r.answered_at.split("T")[0]),
          ...(studySessionRows || []).map((r) => r.created_at.split("T")[0]),
        ]),
      ].sort().reverse();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const MS_PER_DAY = 24 * 60 * 60 * 1000;

      // Calculate longestStreak across all history (consecutive day groups)
      for (let i = 0; i < learnedDays.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const diff =
            (new Date(learnedDays[i - 1]).getTime() - new Date(learnedDays[i]).getTime()) /
            MS_PER_DAY;
          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // currentStreak is only active if user learned today or yesterday
      if (learnedDays.length > 0) {
        const dayDiff =
          (new Date(today).getTime() - new Date(learnedDays[0]).getTime()) / MS_PER_DAY;
        if (dayDiff <= 1) {
          let streak = 1;
          for (let i = 1; i < learnedDays.length; i++) {
            const diff =
              (new Date(learnedDays[i - 1]).getTime() - new Date(learnedDays[i]).getTime()) /
              MS_PER_DAY;
            if (diff === 1) streak++;
            else break;
          }
          currentStreak = streak;
        }
      }

      const lastStudyDate = learnedDays.length > 0 ? learnedDays[0] : null;

      set({
        stats: {
          totalSentencesStudied,
          totalSentencesLearned,
          currentStreak,
          longestStreak,
          quizAccuracy,
          totalQuizQuestions,
          correctQuizAnswers,
          studyTimeToday: 0,
          studyTimeThisWeek: 0,
          studyTimeThisMonth: 0,
          lastStudyDate,
          quizByMode,
          quizByCategory,
        },
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  },

  recordStudySession: async (session) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("study_sessions")
        .insert({ ...session, user_id: user.id, created_at: new Date().toISOString() })
        .select()
        .single();

      await get().loadStats();
    } catch (error) {
      console.error("Error recording study session:", error);
    }
  },

  recordQuizResult: async (result) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("quiz_results")
        .insert({
          user_id: user.id,
          sentence_id: result.sentence_id,
          is_correct: result.is_correct,
          quiz_type: result.quiz_type,
          answered_at: new Date().toISOString(),
        })
        .select()
        .single();

      await get().loadStats();
    } catch (error) {
      console.error("Error recording quiz result:", error);
    }
  },

  updateSentenceProgress: async (sentenceId, correct) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_progress").insert({
        user_id: user.id,
        sentence_id: sentenceId,
        correct,
        created_at: new Date().toISOString(),
      });

      await get().loadProgress();
    } catch (error) {
      console.error("Error updating sentence progress:", error);
    }
  },

  getTodayProgress: () => {
    const { progress } = get();
    const today = new Date().toISOString().split("T")[0];
    return progress.filter((p) => p.created_at.startsWith(today));
  },

  getWeekProgress: () => {
    const { progress } = get();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return progress.filter((p) => p.created_at >= weekAgo);
  },

  getMonthProgress: () => {
    const { progress } = get();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return progress.filter((p) => p.created_at >= monthAgo);
  },

  calculateStreak: async () => {
    await get().loadStats();
  },

  clear: () =>
    set({
      progress: [],
      progressMap: {},
      stats: DEFAULT_STATS,
      loading: false,
      error: null,
    }),
}));
