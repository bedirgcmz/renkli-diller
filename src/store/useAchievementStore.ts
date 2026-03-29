import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { ACHIEVEMENTS } from "@/utils/achievements";

interface AchievementState {
  unlockedIds: string[];
  unlockedDates: Record<string, string>;
  pendingToast: string | null;

  loadAchievements: () => Promise<void>;
  unlockAchievement: (id: string) => Promise<void>;
  isUnlocked: (id: string) => boolean;
  clearToast: () => void;
  checkProgressAchievements: (stats: {
    totalSentencesLearned: number;
    currentStreak: number;
    totalQuizQuestions: number;
    totalBuildSentences?: number;
    perfectBuildSession?: boolean;
  }) => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  unlockedIds: [],
  unlockedDates: {},
  pendingToast: null,

  loadAchievements: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_settings")
        .select("achievement_unlocked_ids, achievement_unlocked_dates")
        .eq("user_id", user.id)
        .single();

      if (data) {
        set({
          unlockedIds: data.achievement_unlocked_ids ?? [],
          unlockedDates: (data.achievement_unlocked_dates as Record<string, string>) ?? {},
        });
      }
    } catch {
      if (__DEV__) console.error("loadAchievements failed");
    }
  },

  unlockAchievement: async (id: string) => {
    const { unlockedIds, unlockedDates } = get();
    if (unlockedIds.includes(id)) return;

    const now = new Date().toISOString();
    const newIds = [...unlockedIds, id];
    const newDates = { ...unlockedDates, [id]: now };

    // Optimistic update + show toast
    set({ unlockedIds: newIds, unlockedDates: newDates, pendingToast: id });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_settings")
        .update({
          achievement_unlocked_ids: newIds,
          achievement_unlocked_dates: newDates,
          updated_at: now,
        })
        .eq("user_id", user.id);
    } catch {
      if (__DEV__) console.error("unlockAchievement save failed");
    }
  },

  isUnlocked: (id: string) => get().unlockedIds.includes(id),

  clearToast: () => set({ pendingToast: null }),

  checkProgressAchievements: async (stats) => {
    const { unlockedIds, unlockAchievement } = get();

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.includes(achievement.id)) continue;

      let met = false;
      switch (achievement.conditionType) {
        case "learned_count":
          met = stats.totalSentencesLearned >= (achievement.conditionValue ?? 0);
          break;
        case "streak":
          met = stats.currentStreak >= (achievement.conditionValue ?? 0);
          break;
        case "quiz_total":
          met = stats.totalQuizQuestions >= (achievement.conditionValue ?? 0);
          break;
        case "build_total":
          met = (stats.totalBuildSentences ?? 0) >= (achievement.conditionValue ?? 0);
          break;
        case "perfect_build":
          met = stats.perfectBuildSession === true;
          break;
        default:
          break;
      }

      if (met) {
        await unlockAchievement(achievement.id);
        // Only show one toast at a time — stop after first new unlock
        return;
      }
    }
  },
}));
