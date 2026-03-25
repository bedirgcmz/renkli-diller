export interface Achievement {
  id: string;
  icon: string;
  title_key: string;
  description_key: string;
  conditionType: "learned_count" | "streak" | "quiz_total" | "perfect_quiz" | "automode";
  conditionValue?: number;
  requiresPremium?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_learned",
    icon: "🌱",
    title_key: "achievements.first_learned.title",
    description_key: "achievements.first_learned.description",
    conditionType: "learned_count",
    conditionValue: 1,
  },
  {
    id: "learned_10",
    icon: "📚",
    title_key: "achievements.learned_10.title",
    description_key: "achievements.learned_10.description",
    conditionType: "learned_count",
    conditionValue: 10,
  },
  {
    id: "learned_50",
    icon: "🎓",
    title_key: "achievements.learned_50.title",
    description_key: "achievements.learned_50.description",
    conditionType: "learned_count",
    conditionValue: 50,
  },
  {
    id: "learned_100",
    icon: "🏆",
    title_key: "achievements.learned_100.title",
    description_key: "achievements.learned_100.description",
    conditionType: "learned_count",
    conditionValue: 100,
  },
  {
    id: "streak_7",
    icon: "🔥",
    title_key: "achievements.streak_7.title",
    description_key: "achievements.streak_7.description",
    conditionType: "streak",
    conditionValue: 7,
  },
  {
    id: "streak_30",
    icon: "⚡",
    title_key: "achievements.streak_30.title",
    description_key: "achievements.streak_30.description",
    conditionType: "streak",
    conditionValue: 30,
  },
  {
    id: "first_quiz",
    icon: "🎯",
    title_key: "achievements.first_quiz.title",
    description_key: "achievements.first_quiz.description",
    conditionType: "quiz_total",
    conditionValue: 1,
  },
  {
    id: "quiz_100",
    icon: "💪",
    title_key: "achievements.quiz_100.title",
    description_key: "achievements.quiz_100.description",
    conditionType: "quiz_total",
    conditionValue: 100,
  },
  {
    id: "quiz_500",
    icon: "🧠",
    title_key: "achievements.quiz_500.title",
    description_key: "achievements.quiz_500.description",
    conditionType: "quiz_total",
    conditionValue: 500,
  },
  {
    id: "perfect_quiz",
    icon: "⭐",
    title_key: "achievements.perfect_quiz.title",
    description_key: "achievements.perfect_quiz.description",
    conditionType: "perfect_quiz",
  },
  {
    id: "first_automode",
    icon: "🎧",
    title_key: "achievements.first_automode.title",
    description_key: "achievements.first_automode.description",
    conditionType: "automode",
  },
];
