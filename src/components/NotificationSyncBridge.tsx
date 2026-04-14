import { useEffect } from "react";
import { syncNotificationPlan } from "@/services/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { countTodayLearned } from "@/utils/progressHelpers";

export function NotificationSyncBridge() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const initialized = useSettingsStore((s) => s.initialized);
  const notifications = useSettingsStore((s) => s.notifications);
  const reminderTime = useSettingsStore((s) => s.reminderTime);
  const uiLanguage = useSettingsStore((s) => s.uiLanguage);
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);

  const progress = useProgressStore((s) => s.progress);
  const stats = useProgressStore((s) => s.stats);
  const loadStats = useProgressStore((s) => s.loadStats);

  const userStats = useGameStore((s) => s.userStats);
  const loadUserStats = useGameStore((s) => s.loadUserStats);

  const todayLearned = countTodayLearned(progress) + stats.todayLearnedUserSentences;

  useEffect(() => {
    if (!initialized || !notifications || !userId) return;

    loadStats().catch((e) => console.error("[NotificationSyncBridge] loadStats failed:", e));
    loadUserStats().catch((e) =>
      console.error("[NotificationSyncBridge] loadUserStats failed:", e),
    );
  }, [initialized, notifications, userId, loadStats, loadUserStats]);

  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      syncNotificationPlan({
        enabled: notifications,
        reminderTime,
        uiLanguage,
        dailyGoal,
        todayLearned,
        currentStreak: stats.currentStreak,
        lastStudyDate: stats.lastStudyDate,
        totalSentencesLearned: stats.totalSentencesLearned,
        gamesPlayed: userStats?.gamesPlayed ?? 0,
        lastPlayedAt: userStats?.lastPlayedAt ?? null,
        league: userStats?.league ?? null,
        cumulativeScore: userStats?.cumulativeScore ?? null,
      }).catch((e) => console.error("[NotificationSyncBridge] sync failed:", e));
    }, 500);

    return () => clearTimeout(timer);
  }, [
    initialized,
    notifications,
    reminderTime,
    uiLanguage,
    dailyGoal,
    todayLearned,
    stats.currentStreak,
    stats.lastStudyDate,
    stats.totalSentencesLearned,
    userStats?.gamesPlayed,
    userStats?.lastPlayedAt,
    userStats?.league,
    userStats?.cumulativeScore,
  ]);

  return null;
}
