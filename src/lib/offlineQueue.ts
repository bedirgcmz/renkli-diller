/**
 * offlineQueue.ts
 *
 * Persistent offline action queue for mutations that must survive network loss.
 *
 * Key design decisions
 * ────────────────────
 * • Stored under `offline_queue:{userId}` — intentionally NOT under the
 *   `offline_cache:` prefix so that `clearUserCache()` never wipes the queue.
 *   The queue is only cleared on confirmed sign-out or account deletion.
 *
 * • dedupeKey: required for toggle/state operations (progress, favorites).
 *   When a new item shares a dedupeKey with an existing item, the old one is
 *   replaced (last-write-wins). Append-only events (quiz_result, study_session)
 *   never carry a dedupeKey.
 *
 * • clientEventId: carried by append-only events for idempotent server inserts.
 *   On queue replay, a duplicate insert returns PostgreSQL error 23505 (unique
 *   violation on the partial index) — treated as success, not an error.
 *
 * • Phase 1: last local intended state wins.
 *   Multi-device conflict resolution is out of scope for phase 1.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Key ──────────────────────────────────────────────────────────────────────

const queueStorageKey = (userId: string) => `offline_queue:${userId}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type OfflineQueueItemType =
  | "progress_add_learning"
  | "progress_mark_learned"
  | "progress_forgot"
  | "favorite_add"
  | "favorite_remove"
  | "quiz_result"
  | "study_session"
  | "reading_mark_completed";

export interface OfflineQueueItem {
  id: string;
  type: OfflineQueueItemType;
  payload: unknown;
  /**
   * Required for state-toggle operations (progress, favorites).
   * Last write wins: enqueueing an item replaces any existing item with the
   * same dedupeKey.
   * Patterns: "progress:{sentenceId}", "favorite:{sentenceId}"
   */
  dedupeKey?: string;
  /**
   * Unique event identifier for append-only operations (quiz_result, study_session).
   * Written to the server column `client_event_id` to prevent duplicate inserts
   * on queue replay.
   */
  clientEventId?: string;
  createdAt: number;
}

// ── ID generator ─────────────────────────────────────────────────────────────

/** Lightweight collision-resistant ID — no external dependency required. */
export function generateQueueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createQueueItem(
  type: OfflineQueueItemType,
  payload: unknown,
  opts?: { dedupeKey?: string; clientEventId?: string }
): OfflineQueueItem {
  return {
    id: generateQueueId(),
    type,
    payload,
    dedupeKey: opts?.dedupeKey,
    clientEventId: opts?.clientEventId,
    createdAt: Date.now(),
  };
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/** Read the full queue from AsyncStorage. Returns [] on miss or parse error. */
export async function readQueue(userId: string): Promise<OfflineQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(queueStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as OfflineQueueItem[];
  } catch {
    return [];
  }
}

/** Overwrite the full queue in AsyncStorage. Silently ignores storage errors. */
export async function writeQueue(
  userId: string,
  items: OfflineQueueItem[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(queueStorageKey(userId), JSON.stringify(items));
  } catch {
    // Non-fatal: queue operates on in-memory state if disk write fails
  }
}

/**
 * Append an item to the queue, respecting dedupeKey.
 *
 * If the item has a dedupeKey, any existing item with the same key is removed
 * before appending — last write wins. This prevents redundant round-trips when
 * the user toggles a state multiple times while offline.
 */
export async function enqueue(
  userId: string,
  item: OfflineQueueItem
): Promise<OfflineQueueItem[]> {
  try {
    const existing = await readQueue(userId);
    const filtered = item.dedupeKey
      ? existing.filter((i) => i.dedupeKey !== item.dedupeKey)
      : existing;
    const updated = [...filtered, item];
    await writeQueue(userId, updated);
    return updated;
  } catch {
    return [];
  }
}

/** Remove all queue entries for the given user. Call only on confirmed sign-out. */
export async function clearQueue(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(queueStorageKey(userId));
  } catch {
    // Non-fatal
  }
}
