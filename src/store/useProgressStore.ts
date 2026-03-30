import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { UserProgress, QuizResult, StudySession, SentenceTag } from "@/types";
import { useAchievementStore } from "./useAchievementStore";

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
  totalBuildSentences: number;
  correctQuizAnswers: number;
  studyTimeToday: number;
  studyTimeThisWeek: number;
  studyTimeThisMonth: number;
  lastStudyDate: string | null;
  quizByMode: { multiple_choice: ModeStats; fill_blank: ModeStats; build_sentence: ModeStats };
  quizByCategory: Record<string, ModeStats>;
  todayLearnedUserSentences: number;
  userLearnedDates: string[];
}

interface ProgressState {
  progress: UserProgress[];
  progressMap: Record<string, "learning" | "learned">;
  tagMap: Record<string, SentenceTag | null>;
  stats: ProgressStats;
  loading: boolean;
  error: string | null;

  loadProgress: () => Promise<void>;
  loadStats: () => Promise<void>;
  // State-machine actions for preset sentences
  addToLearning: (sentenceId: string) => Promise<void>;
  markAsLearned: (sentenceId: string) => Promise<void>;
  forgot: (sentenceId: string) => Promise<void>;
  updatePresetTag: (sentenceId: string, tag: SentenceTag | null) => Promise<void>;
  // Legacy quiz tracking
  recordStudySession: (session: Omit<StudySession, "id" | "created_at">) => Promise<void>;
  recordQuizResult: (result: Omit<QuizResult, "id" | "answered_at">) => Promise<void>;
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
  totalBuildSentences: 0,
  correctQuizAnswers: 0,
  studyTimeToday: 0,
  studyTimeThisWeek: 0,
  studyTimeThisMonth: 0,
  lastStudyDate: null,
  quizByMode: { multiple_choice: { correct: 0, total: 0 }, fill_blank: { correct: 0, total: 0 }, build_sentence: { correct: 0, total: 0 } },
  quizByCategory: {},
  todayLearnedUserSentences: 0,
  userLearnedDates: [],
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  progressMap: {},
  tagMap: {},
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

      // Build progressMap and tagMap from rows
      const progressMap: Record<string, "learning" | "learned"> = {};
      const tagMap: Record<string, SentenceTag | null> = {};
      for (const row of data || []) {
        if (row.state === "learning" || row.state === "learned") {
          progressMap[String(row.sentence_id)] = row.state;
        }
        if (row.tag) {
          tagMap[String(row.sentence_id)] = row.tag as SentenceTag;
        }
      }

      set({ progress: data || [], progressMap, tagMap, loading: false });
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
      if (__DEV__) console.error("addToLearning failed");
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

      const { stats } = get();
      await useAchievementStore.getState().checkProgressAchievements({
        totalSentencesLearned: stats.totalSentencesLearned,
        currentStreak: stats.currentStreak,
        totalQuizQuestions: stats.totalQuizQuestions,
        totalBuildSentences: stats.totalBuildSentences,
      });
    } catch {
      if (__DEV__) console.error("markAsLearned failed");
    }
  },

  updatePresetTag: async (sentenceId: string, tag: SentenceTag | null) => {
    set((state) => ({
      tagMap: { ...state.tagMap, [sentenceId]: tag },
    }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("user_progress")
        .update({ tag: tag ?? null })
        .eq("user_id", user.id)
        .eq("sentence_id", sentenceId);
    } catch {
      if (__DEV__) console.error("updatePresetTag failed");
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
      if (__DEV__) console.error("forgot failed");
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
        .select("is_correct, quiz_type, sentences(categories(name_en))")
        .eq("user_id", user.id);

      const { data: studySessionRows } = await supabase
        .from("study_sessions")
        .select("created_at")
        .eq("user_id", user.id);

      const { data: userLearnedRows } = await supabase
        .from("user_sentences")
        .select("learned_at")
        .eq("user_id", user.id)
        .eq("state", "learned")
        .not("learned_at", "is", null);

      const totalSentencesStudied = allProgressRows?.length || 0;
      const totalSentencesLearned =
        allProgressRows?.filter((r) => r.state === "learned").length || 0;

      const quizOnlyResults = quizResults?.filter((q) => q.quiz_type === "multiple_choice" || q.quiz_type === "fill_blank") || [];
      const totalQuizQuestions = quizOnlyResults.length;
      const totalBuildSentences = quizResults?.filter((q) => q.quiz_type === "build_sentence").length || 0;
      const correctQuizAnswers = quizOnlyResults.filter((q) => q.is_correct).length;
      const quizAccuracy =
        totalQuizQuestions > 0 ? (correctQuizAnswers / totalQuizQuestions) * 100 : 0;

      const quizByMode: ProgressStats["quizByMode"] = {
        multiple_choice: { correct: 0, total: 0 },
        fill_blank: { correct: 0, total: 0 },
        build_sentence: { correct: 0, total: 0 },
      };
      for (const q of quizResults || []) {
        const mode = q.quiz_type as keyof typeof quizByMode;
        if (quizByMode[mode]) {
          quizByMode[mode].total++;
          if (q.is_correct) quizByMode[mode].correct++;
        }
      }

      const quizByCategory: ProgressStats["quizByCategory"] = {};
      for (const q of quizWithCategory || []) {
        const sentenceData = q.sentences as { categories?: { name_en?: string } | null } | null;
        const rawCat = sentenceData?.categories?.name_en;
        const cat = rawCat
          ? rawCat.toLowerCase().replace(/\s+/g, "_")
          : "other";
        if (!quizByCategory[cat]) quizByCategory[cat] = { correct: 0, total: 0 };
        quizByCategory[cat].total++;
        if (q.is_correct) quizByCategory[cat].correct++;
      }

      // Distinct calendar days with ANY activity: learned + quiz answered + auto mode session
      const learnedDays = [
        ...new Set([
          ...(learnedRows || []).map((r) => r.learned_at!.split("T")[0]),
          ...(userLearnedRows || []).map((r) => (r.learned_at as string).split("T")[0]),
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

      const todayLearnedUserSentences = (userLearnedRows || []).filter((r) =>
        (r.learned_at as string).startsWith(today)
      ).length;
      const userLearnedDates = (userLearnedRows || []).map((r) => r.learned_at as string);

      set({
        stats: {
          totalSentencesStudied,
          totalSentencesLearned,
          currentStreak,
          longestStreak,
          quizAccuracy,
          totalQuizQuestions,
          totalBuildSentences,
          correctQuizAnswers,
          studyTimeToday: 0,
          studyTimeThisWeek: 0,
          studyTimeThisMonth: 0,
          lastStudyDate,
          quizByMode,
          quizByCategory,
          todayLearnedUserSentences,
          userLearnedDates,
        },
      });
    } catch (error) {
      if (__DEV__) console.error("Error loading stats:", error);
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

      // first_automode achievement
      await useAchievementStore.getState().unlockAchievement("first_automode");

      const { stats } = get();
      await useAchievementStore.getState().checkProgressAchievements({
        totalSentencesLearned: stats.totalSentencesLearned,
        currentStreak: stats.currentStreak,
        totalQuizQuestions: stats.totalQuizQuestions,
        totalBuildSentences: stats.totalBuildSentences,
      });
    } catch (error) {
      if (__DEV__) console.error("Error recording study session:", error);
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
          sentence_id: result.user_sentence_id ? null : result.sentence_id,
          user_sentence_id: result.user_sentence_id ?? null,
          is_correct: result.is_correct,
          quiz_type: result.quiz_type,
          answered_at: new Date().toISOString(),
        })
        .select()
        .single();

      await get().loadStats();

      const { stats } = get();
      await useAchievementStore.getState().checkProgressAchievements({
        totalSentencesLearned: stats.totalSentencesLearned,
        currentStreak: stats.currentStreak,
        totalQuizQuestions: stats.totalQuizQuestions,
        totalBuildSentences: stats.totalBuildSentences,
      });
    } catch (error) {
      if (__DEV__) console.error("Error recording quiz result:", error);
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
      tagMap: {},
      stats: DEFAULT_STATS,
      loading: false,
      error: null,
    }),
}));
