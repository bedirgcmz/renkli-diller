/**
 * offlineCache.ts
 *
 * Lightweight AsyncStorage helpers for offline-first read caching.
 *
 * Key conventions
 * ───────────────
 * • All keys are prefixed with `offline_cache:` to avoid collisions.
 * • User-scoped keys use the pattern  `<name>:<userId>`.
 * • Public (non-user-scoped) keys use plain `<name>`.
 * • Language-pair-scoped keys use `<name>:<uiLang>_<targetLang>`.
 *
 * Every operation is non-throwing — failures are silently swallowed so the
 * app can always continue with in-memory state.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "offline_cache:";

/** Read a cached value. Returns null on miss or parse error. */
export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a value to cache. Silently ignores storage errors. */
export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Non-fatal: app continues with fresh in-memory state
  }
}

/**
 * Remove all cache entries that contain `:<userId>` in their key.
 * Call this on logout to prevent stale user data leaking into the next session.
 */
export async function clearUserCache(userId: string): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(
      (k) => k.startsWith(PREFIX) && k.includes(`:${userId}`)
    );
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
    }
  } catch {
    // Non-fatal
  }
}

/** Remove a single cache entry by key. */
export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // Non-fatal
  }
}
