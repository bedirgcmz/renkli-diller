import create from "zustand";
import { supabase } from "../lib/supabase";
import { UserProgress, QuizResult, StudySession } from "@/types";

interface ProgressStats {
  totalSentencesStudied: number;
  totalSentencesLearned: number;
  currentStreak: number;
  longestStreak: number;
  quizAccuracy: number;
  totalQuizQuestions: number;
  correctQuizAnswers: number;
  studyTimeToday: number; // minutes
  studyTimeThisWeek: number; // minutes
  studyTimeThisMonth: number; // minutes
  lastStudyDate: string | null;
}

interface ProgressState {
  progress: UserProgress[];
  stats: ProgressStats;
  loading: boolean;
  error: string | null;

  // Actions
  loadProgress: () => Promise<void>;
  loadStats: () => Promise<void>;
  recordStudySession: (session: Omit<StudySession, 'id' | 'created_at'>) => Promise<void>;
  recordQuizResult: (result: Omit<QuizResult, 'id' | 'created_at'>) => Promise<void>;
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
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  stats: DEFAULT_STATS,
  loading: false,
  error: null,

  loadProgress: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({
        progress: data || [],
        loading: false,
      });

      // Load stats after progress
      await get().loadStats();
    } catch (error) {
      set({
        error: 'Failed to load progress',
        loading: false,
      });
    }
  },

  loadStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Get quiz results
      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      // Calculate stats
      const totalSentencesStudied = sessions?.length || 0;
      const totalSentencesLearned = sessions?.filter(s => s.completed).length || 0;

      const studyTimeToday = sessions
        ?.filter(s => s.created_at.startsWith(today))
        .reduce((total, s) => total + (s.duration_minutes || 0), 0) || 0;

      const studyTimeThisWeek = sessions
        ?.filter(s => s.created_at >= weekAgo)
        .reduce((total, s) => total + (s.duration_minutes || 0), 0) || 0;

      const studyTimeThisMonth = sessions
        ?.filter(s => s.created_at >= monthAgo)
        .reduce((total, s) => total + (s.duration_minutes || 0), 0) || 0;

      const totalQuizQuestions = quizResults?.length || 0;
      const correctQuizAnswers = quizResults?.filter(q => q.correct).length || 0;
      const quizAccuracy = totalQuizQuestions > 0 ? (correctQuizAnswers / totalQuizQuestions) * 100 : 0;

      // Calculate streak
      const studyDates = [...new Set(sessions?.map(s => s.created_at.split('T')[0]) || [])]
        .sort()
        .reverse();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < studyDates.length; i++) {
        const date = new Date(studyDates[i]);
        const prevDate = i > 0 ? new Date(studyDates[i - 1]) : null;

        if (!prevDate || (date.getTime() - prevDate.getTime()) === 24 * 60 * 60 * 1000) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const lastStudyDate = studyDates.length > 0 ? studyDates[0] : null;

      set({
        stats: {
          totalSentencesStudied,
          totalSentencesLearned,
          currentStreak,
          longestStreak,
          quizAccuracy,
          totalQuizQuestions,
          correctQuizAnswers,
          studyTimeToday,
          studyTimeThisWeek,
          studyTimeThisMonth,
          lastStudyDate,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  },

  recordStudySession: async (session) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          ...session,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording study session:', error);
        return;
      }

      // Reload stats
      await get().loadStats();
    } catch (error) {
      console.error('Error recording study session:', error);
    }
  },

  recordQuizResult: async (result) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          ...result,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording quiz result:', error);
        return;
      }

      // Reload stats
      await get().loadStats();
    } catch (error) {
      console.error('Error recording quiz result:', error);
    }
  },

  updateSentenceProgress: async (sentenceId, correct) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          sentence_id: sentenceId,
          correct,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating sentence progress:', error);
        return;
      }

      // Reload progress
      await get().loadProgress();
    } catch (error) {
      console.error('Error updating sentence progress:', error);
    }
  },

  getTodayProgress: () => {
    const { progress } = get();
    const today = new Date().toISOString().split('T')[0];
    return progress.filter(p => p.created_at.startsWith(today));
  },

  getWeekProgress: () => {
    const { progress } = get();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return progress.filter(p => p.created_at >= weekAgo);
  },

  getMonthProgress: () => {
    const { progress } = get();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return progress.filter(p => p.created_at >= monthAgo);
  },

  calculateStreak: async () => {
    await get().loadStats();
  },

  clear: () => set({
    progress: [],
    stats: DEFAULT_STATS,
    loading: false,
    error: null,
  }),
}));
