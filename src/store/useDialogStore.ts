import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useNetworkStore } from "./useNetworkStore";
import {
  DialogCategory,
  DialogScenario,
  DialogTurn,
  DialogTurnOption,
  UserDialogSession,
  DIALOG_LIMIT_FREE_DAILY,
  DIALOG_LIMIT_FREE_TOTAL,
  DIALOG_LIMIT_PREMIUM_DAILY,
} from "@/types";

export type DialogDifficultyFilter = 1 | 2 | 3;

interface DialogLimitStatus {
  dailyCompleted: number;
  totalCompleted: number;
  canPlay: boolean;
  // Why blocked: "daily_limit" | "total_limit" | null
  blockedReason: "daily_limit" | "total_limit" | null;
}

interface DialogPoolStatus {
  totalScenarios: number;
  freshCount: number;
  unlearnedCount: number;
  learnedCount: number;
  remainingCount: number;
  completedSelection: boolean;
}

interface ScenarioPoolData {
  scenarios: DialogScenario[];
  fresh: DialogScenario[];
  unlearned: DialogScenario[];
  learned: DialogScenario[];
}

interface DialogState {
  // Setup
  categories: DialogCategory[];
  selectedCategory: DialogCategory | null;
  selectedDifficulty: DialogDifficultyFilter | null;

  // Active play
  activeScenario: DialogScenario | null;
  turns: DialogTurn[];
  currentTurnIndex: number;
  activeSession: UserDialogSession | null;

  // Per-turn attempt tracking
  currentTurnAttempts: number; // wrong attempts on current turn
  selectedOptionId: string | null;
  isCorrect: boolean | null;

  // Session summary (populated on complete)
  sessionCorrectFirstTry: number;
  sessionWrongAttempts: number;

  // Limit
  limitStatus: DialogLimitStatus | null;
  poolStatus: DialogPoolStatus | null;

  // UI
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (category: DialogCategory | null) => void;
  setSelectedDifficulty: (difficulty: DialogDifficultyFilter | null) => void;
  fetchLimitStatus: (userId: string, isPremium: boolean) => Promise<void>;
  fetchPoolStatus: (userId: string) => Promise<void>;
  startSession: (
    userId: string,
    isPremium: boolean,
    scenarioId?: string,
    allowLearnedFallback?: boolean
  ) => Promise<boolean>;
  selectOption: (
    userId: string,
    optionId: string,
    option: DialogTurnOption
  ) => Promise<boolean>;
  advanceToNextTurn: () => void;
  completeSession: (userId: string) => Promise<void>;
  abandonSession: (userId: string) => Promise<void>;
  markAsLearned: (userId: string, scenarioId: string) => Promise<void>;
  reset: () => void;
}

async function getScenarioPool(
  userId: string,
  categoryId: string,
  difficulty: DialogDifficultyFilter
): Promise<ScenarioPoolData> {
  const { data: scenarios, error: scenarioError } = await supabase
    .from("dialog_scenarios")
    .select("*")
    .eq("category_id", categoryId)
    .eq("difficulty", difficulty)
    .eq("is_active", true)
    .eq("qa_status", "approved")
    .order("order_index");

  if (scenarioError) throw scenarioError;

  const scenarioList = ((scenarios ?? []) as DialogScenario[]).filter(Boolean);
  if (scenarioList.length === 0) {
    return { scenarios: [], fresh: [], unlearned: [], learned: [] };
  }

  const scenarioIds = scenarioList.map((s) => s.id);
  const { data: progressRows, error: progressError } = await supabase
    .from("user_dialog_progress")
    .select("scenario_id, is_learned")
    .eq("user_id", userId)
    .in("scenario_id", scenarioIds);

  if (progressError) throw progressError;

  const playedIds = new Set((progressRows ?? []).map((p: any) => p.scenario_id));
  const learnedIds = new Set(
    (progressRows ?? []).filter((p: any) => p.is_learned).map((p: any) => p.scenario_id)
  );

  const fresh = scenarioList.filter((s) => !playedIds.has(s.id));
  const unlearned = scenarioList.filter((s) => playedIds.has(s.id) && !learnedIds.has(s.id));
  const learned = scenarioList.filter((s) => learnedIds.has(s.id));

  return {
    scenarios: scenarioList,
    fresh,
    unlearned,
    learned,
  };
}

export const useDialogStore = create<DialogState>((set, get) => ({
  categories: [],
  selectedCategory: null,
  selectedDifficulty: null,

  activeScenario: null,
  turns: [],
  currentTurnIndex: 0,
  activeSession: null,

  currentTurnAttempts: 0,
  selectedOptionId: null,
  isCorrect: null,

  sessionCorrectFirstTry: 0,
  sessionWrongAttempts: 0,

  limitStatus: null,
  poolStatus: null,

  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("dialog_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      set({ categories: (data ?? []) as DialogCategory[], loading: false });
    } catch (e: any) {
      useNetworkStore.getState().reportRequestError(e);
      set({ error: e.message, loading: false });
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  fetchLimitStatus: async (userId, isPremium) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { count: dailyCount } = await supabase
        .from("user_dialog_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("started_at", `${today}T00:00:00.000Z`)
        .lte("started_at", `${today}T23:59:59.999Z`);

      const { count: totalCount } = await supabase
        .from("user_dialog_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed");

      const daily = dailyCount ?? 0;
      const total = totalCount ?? 0;

      const dailyLimit = isPremium
        ? DIALOG_LIMIT_PREMIUM_DAILY
        : DIALOG_LIMIT_FREE_DAILY;

      let blockedReason: DialogLimitStatus["blockedReason"] = null;

      if (!isPremium && total >= DIALOG_LIMIT_FREE_TOTAL) {
        blockedReason = "total_limit";
      } else if (daily >= dailyLimit) {
        blockedReason = "daily_limit";
      }

      set({
        limitStatus: {
          dailyCompleted: daily,
          totalCompleted: total,
          canPlay: blockedReason === null,
          blockedReason,
        },
      });
    } catch (e: any) {
      useNetworkStore.getState().reportRequestError(e);
      set({ error: e.message });
    }
  },

  fetchPoolStatus: async (userId) => {
    const { selectedCategory, selectedDifficulty } = get();
    if (!selectedCategory || !selectedDifficulty) {
      set({ poolStatus: null });
      return;
    }

    try {
      const pool = await getScenarioPool(userId, selectedCategory.id, selectedDifficulty);
      set({
        poolStatus: {
          totalScenarios: pool.scenarios.length,
          freshCount: pool.fresh.length,
          unlearnedCount: pool.unlearned.length,
          learnedCount: pool.learned.length,
          remainingCount: pool.fresh.length + pool.unlearned.length,
          completedSelection: pool.scenarios.length > 0 && pool.fresh.length + pool.unlearned.length === 0,
        },
      });
    } catch (e: any) {
      useNetworkStore.getState().reportRequestError(e);
      set({ error: e.message, poolStatus: null });
    }
  },

  startSession: async (userId, isPremium, scenarioId, allowLearnedFallback = true) => {
    const { selectedCategory, selectedDifficulty } = get();
    if (!scenarioId && (!selectedCategory || !selectedDifficulty)) return false;

    set({ loading: true, error: null });
    try {
      let scenario: DialogScenario | null = null;

      if (scenarioId) {
        const { data: scenarioData, error: scenarioError } = await supabase
          .from("dialog_scenarios")
          .select("*")
          .eq("id", scenarioId)
          .eq("is_active", true)
          .eq("qa_status", "approved")
          .single();

        if (scenarioError) throw scenarioError;
        if (!scenarioData) {
          set({ error: "no_scenarios", loading: false });
          return false;
        }
        scenario = scenarioData as DialogScenario;
      } else {
        const pool = await getScenarioPool(userId, selectedCategory!.id, selectedDifficulty!);

        if (pool.scenarios.length === 0) {
          set({ error: "no_scenarios", loading: false });
          return false;
        }

        const availablePool =
          pool.fresh.length > 0
            ? pool.fresh
            : pool.unlearned.length > 0
              ? pool.unlearned
              : allowLearnedFallback
                ? pool.learned
                : [];

        if (availablePool.length === 0) {
          set({
            error: "completed_selection",
            loading: false,
            poolStatus: {
              totalScenarios: pool.scenarios.length,
              freshCount: pool.fresh.length,
              unlearnedCount: pool.unlearned.length,
              learnedCount: pool.learned.length,
              remainingCount: pool.fresh.length + pool.unlearned.length,
              completedSelection: true,
            },
          });
          return false;
        }

        scenario = availablePool[Math.floor(Math.random() * availablePool.length)] as DialogScenario;
      }

      // Fetch turns + options
      const { data: turnsData, error: turnsError } = await supabase
        .from("dialog_turns")
        .select("*, dialog_turn_options(*)")
        .eq("scenario_id", scenario.id)
        .order("turn_index");

      if (turnsError) throw turnsError;

      const turns = (turnsData ?? []).map((t: any) => ({
        ...t,
        options: (t.dialog_turn_options ?? []).sort(
          (a: DialogTurnOption, b: DialogTurnOption) =>
            a.option_index - b.option_index
        ),
      })) as DialogTurn[];

      if (turns.length === 0 || turns.some((turn) => (turn.options ?? []).length === 0)) {
        set({ error: "invalid_scenario", loading: false });
        return false;
      }

      // Create session row
      const { data: sessionData, error: sessionError } = await supabase
        .from("user_dialog_sessions")
        .insert({
          user_id: userId,
          scenario_id: scenario.id,
          status: "in_progress",
          total_turns: scenario.turn_count ?? turns.length,
          content_version: scenario.content_version,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      set({
        activeScenario: scenario,
        turns,
        currentTurnIndex: 0,
        activeSession: sessionData as UserDialogSession,
        currentTurnAttempts: 0,
        selectedOptionId: null,
        isCorrect: null,
        sessionCorrectFirstTry: 0,
        sessionWrongAttempts: 0,
        loading: false,
      });

      return true;
    } catch (e: any) {
      useNetworkStore.getState().reportRequestError(e);
      set({ error: e.message, loading: false });
      return false;
    }
  },

  selectOption: async (userId, optionId, option) => {
    const { activeSession, turns, currentTurnIndex, currentTurnAttempts } =
      get();
    if (!activeSession) return false;

    const currentTurn = turns[currentTurnIndex];
    if (!currentTurn) return false;

    const attemptOrder = currentTurnAttempts + 1;

    // Record attempt in DB
    const { error } = await supabase.from("user_dialog_turn_attempts").insert({
      session_id: activeSession.id,
      user_id: userId,
      scenario_id: activeSession.scenario_id,
      turn_id: currentTurn.id,
      selected_option_id: optionId,
      is_correct: option.is_correct,
      attempt_order: attemptOrder,
    });

    if (error) {
      set({ error: error.message });
      return false;
    }

    if (option.is_correct) {
      const isFirstTry = attemptOrder === 1;
      set((state) => ({
        error: null,
        selectedOptionId: optionId,
        isCorrect: true,
        currentTurnAttempts: attemptOrder,
        sessionCorrectFirstTry: isFirstTry
          ? state.sessionCorrectFirstTry + 1
          : state.sessionCorrectFirstTry,
      }));
    } else {
      set((state) => ({
        error: null,
        selectedOptionId: optionId,
        isCorrect: false,
        currentTurnAttempts: attemptOrder,
        sessionWrongAttempts: state.sessionWrongAttempts + 1,
      }));
    }

    return true;
  },

  advanceToNextTurn: () => {
    const { currentTurnIndex, turns } = get();
    if (currentTurnIndex < turns.length - 1) {
      set({
        currentTurnIndex: currentTurnIndex + 1,
        currentTurnAttempts: 0,
        selectedOptionId: null,
        isCorrect: null,
      });
    }
  },

  completeSession: async (userId) => {
    const { activeSession, sessionCorrectFirstTry, sessionWrongAttempts, turns } =
      get();
    if (!activeSession) return;

    const totalTurns = turns.length;
    const firstTryAccuracy =
      totalTurns > 0
        ? Math.round((sessionCorrectFirstTry / totalTurns) * 100 * 100) / 100
        : 0;

    const now = new Date().toISOString();
    const startedAt = new Date(activeSession.started_at).getTime();
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

    // Update session
    await supabase
      .from("user_dialog_sessions")
      .update({
        status: "completed",
        completed_at: now,
        answered_turns: totalTurns,
        correct_on_first_try_count: sessionCorrectFirstTry,
        wrong_attempt_count: sessionWrongAttempts,
        final_score: sessionCorrectFirstTry,
        duration_seconds: durationSeconds,
      })
      .eq("id", activeSession.id);

    // Upsert progress
    const { data: existing } = await supabase
      .from("user_dialog_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("scenario_id", activeSession.scenario_id)
      .maybeSingle();

    if (existing) {
      const newBestScore = Math.max(
        existing.best_score ?? 0,
        sessionCorrectFirstTry
      );
      const newBestAccuracy = Math.max(
        existing.best_first_try_accuracy ?? 0,
        firstTryAccuracy
      );
      await supabase
        .from("user_dialog_progress")
        .update({
          status: "completed",
          completed_at: now,
          total_sessions: existing.total_sessions + 1,
          total_completed_sessions: existing.total_completed_sessions + 1,
          best_score: newBestScore,
          last_score: sessionCorrectFirstTry,
          total_correct_answers:
            existing.total_correct_answers + sessionCorrectFirstTry,
          total_wrong_answers:
            existing.total_wrong_answers + sessionWrongAttempts,
          best_first_try_accuracy: newBestAccuracy,
          last_played_at: now,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_dialog_progress").insert({
        user_id: userId,
        scenario_id: activeSession.scenario_id,
        status: "completed",
        completed_at: now,
        total_sessions: 1,
        total_completed_sessions: 1,
        best_score: sessionCorrectFirstTry,
        last_score: sessionCorrectFirstTry,
        total_correct_answers: sessionCorrectFirstTry,
        total_wrong_answers: sessionWrongAttempts,
        best_first_try_accuracy: firstTryAccuracy,
        last_played_at: now,
      });
    }

    set((state) => ({
      activeSession: state.activeSession
        ? { ...state.activeSession, status: "completed" }
        : null,
    }));
  },

  abandonSession: async (userId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    await supabase
      .from("user_dialog_sessions")
      .update({ status: "abandoned" })
      .eq("id", activeSession.id)
      .eq("user_id", userId);

    set({
      activeSession: null,
      activeScenario: null,
      turns: [],
      currentTurnIndex: 0,
      currentTurnAttempts: 0,
      selectedOptionId: null,
      isCorrect: null,
    });
  },

  markAsLearned: async (userId, scenarioId) => {
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from("user_dialog_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("scenario_id", scenarioId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_dialog_progress")
        .update({ is_learned: true, learned_at: now })
        .eq("id", existing.id);
    } else {
      // Edge case: user marks learned without completing (shouldn't happen, but safe)
      await supabase.from("user_dialog_progress").insert({
        user_id: userId,
        scenario_id: scenarioId,
        is_learned: true,
        learned_at: now,
        status: "completed",
        total_sessions: 0,
        total_completed_sessions: 0,
        total_correct_answers: 0,
        total_wrong_answers: 0,
      });
    }
  },

  reset: () => {
    set({
      activeScenario: null,
      turns: [],
      currentTurnIndex: 0,
      activeSession: null,
      currentTurnAttempts: 0,
      selectedOptionId: null,
      isCorrect: null,
      sessionCorrectFirstTry: 0,
      sessionWrongAttempts: 0,
        selectedCategory: null,
        selectedDifficulty: null,
        limitStatus: null,
        poolStatus: null,
        error: null,
      });
  },
}));
