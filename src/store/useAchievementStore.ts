import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACHIEVEMENTS } from "@/utils/achievements";

const STORAGE_KEY = "achievement_data";

interface AchievementData {
  unlockedIds: string[];
  unlockedDates: Record<string, string>;
}

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
  }) => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  unlockedIds: [],
  unlockedDates: {},
  pendingToast: null,

  loadAchievements: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: AchievementData = JSON.parse(stored);
        set({ unlockedIds: data.unlockedIds ?? [], unlockedDates: data.unlockedDates ?? {} });
      }
    } catch {
      // ignore
    }
  },

  unlockAchievement: async (id: string) => {
    const { unlockedIds, unlockedDates } = get();
    if (unlockedIds.includes(id)) return;

    const now = new Date().toISOString();
    const newIds = [...unlockedIds, id];
    const newDates = { ...unlockedDates, [id]: now };

    set({ unlockedIds: newIds, unlockedDates: newDates, pendingToast: id });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedIds: newIds, unlockedDates: newDates }));
    } catch {
      // ignore
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
