/**
 * useNetworkStore.ts
 *
 * Tracks online/offline state and emits a reconnect counter when
 * connectivity is restored.  Components/providers that need to trigger
 * background refreshes subscribe to `reconnectCount`.
 *
 * Detection strategy (no extra dependency needed):
 *  1. AppState "active" transition → immediate connectivity probe.
 *  2. When offline, a 30-second polling interval probes connectivity.
 *  3. The probe makes a lightweight Supabase query; any non-network
 *     response (even an RLS error) means we are online.
 *
 * Keeps the rest of the codebase dependency-free w.r.t. network libraries.
 */

import { create } from "zustand";
import { AppState, AppStateStatus } from "react-native";
import { supabase } from "@/lib/supabase";

/** Returns true when the error looks like a pure network failure. */
function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = (error as { message?: string }).message ?? "";
  return (
    msg.includes("Network request failed") ||
    msg.includes("Failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("network error") ||
    msg.includes("ERR_NAME_NOT_RESOLVED") ||
    msg.includes("ERR_INTERNET_DISCONNECTED")
  );
}

interface NetworkState {
  /** null = initial / unknown; true = online; false = offline */
  isOnline: boolean | null;
  /**
   * Incremented every time the device transitions from offline → online.
   * Subscribers can watch this to trigger background refreshes.
   */
  reconnectCount: number;

  /** Run a lightweight connectivity check against Supabase. */
  probe: () => Promise<boolean>;
  /** Start AppState listener + initial probe. Returns a cleanup fn. */
  initialize: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => {
  // Polling interval reference lives outside Zustand state (not serializable).
  let pollIntervalId: ReturnType<typeof setInterval> | null = null;

  function startPolling() {
    if (pollIntervalId !== null) return;
    pollIntervalId = setInterval(() => {
      void get().probe();
    }, 30_000);
  }

  function stopPolling() {
    if (pollIntervalId !== null) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  }

  const probe = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("categories")
        .select("id")
        .limit(1);

      // Any response that isn't a pure network error means we reached the server.
      const nowOnline = !error || !isNetworkError(error);

      set((state) => {
        const wasOffline = state.isOnline === false;
        const reconnectCount =
          nowOnline && wasOffline ? state.reconnectCount + 1 : state.reconnectCount;
        return { isOnline: nowOnline, reconnectCount };
      });

      if (nowOnline) {
        stopPolling();
      } else {
        startPolling();
      }

      return nowOnline;
    } catch {
      set({ isOnline: false });
      startPolling();
      return false;
    }
  };

  const initialize = (): (() => void) => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void probe();
      } else {
        // App went background — stop polling to save battery.
        stopPolling();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Fire an initial probe so the store has a real value immediately.
    void probe();

    return () => {
      subscription.remove();
      stopPolling();
    };
  };

  return {
    isOnline: null,
    reconnectCount: 0,
    probe,
    initialize,
  };
});
