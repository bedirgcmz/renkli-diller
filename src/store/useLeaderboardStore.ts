import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_learned: number;
  weekly_studied: number;
  learned_rank: number;
  studied_rank: number;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadLeaderboard: () => Promise<void>;
  clear: () => void;
}

// Cache duration: 5 minutes
const CACHE_MS = 5 * 60 * 1000;

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  myEntry: null,
  loading: false,
  error: null,
  lastFetchedAt: null,

  loadLeaderboard: async () => {
    const { lastFetchedAt, loading } = get();
    if (loading) return;

    // Return cached data if fresh
    if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_MS) return;

    set({ loading: true, error: null });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      const { data, error } = await supabase.rpc("get_weekly_leaderboard");

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      const entries = (data || []) as LeaderboardEntry[];
      const myEntry = user
        ? (entries.find((e) => e.user_id === user.id) ?? null)
        : null;

      set({ entries, myEntry, loading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ error: "Failed to load leaderboard", loading: false });
    }
  },

  clear: () =>
    set({ entries: [], myEntry: null, loading: false, error: null, lastFetchedAt: null }),
}));
