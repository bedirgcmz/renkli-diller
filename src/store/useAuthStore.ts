import { create } from "zustand";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  logInUser,
  logOutUser,
  setupCustomerInfoListener,
} from "@/services/revenueCat";
import * as AppleAuthentication from "expo-apple-authentication";
import { clearAITrialCache } from "@/services/gemini";
import { establishSessionFromCallbackUrl } from "@/lib/authCallback";
import { useAchievementStore } from "./useAchievementStore";
import { useGameStore } from "./useGameStore";
import { useLeaderboardStore } from "./useLeaderboardStore";
import { useProgressStore } from "./useProgressStore";
import { useReadingStore } from "./useReadingStore";
import { useSentenceStore } from "./useSentenceStore";
import { useSettingsStore } from "./useSettingsStore";

interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  premium_override: boolean;
  leaderboard_visible: boolean;
  created_at: string;
}

/** Returns true if the manual override is active (set and not expired). */
function isOverrideActive(profile: { premium_override?: boolean; premium_override_expires_at?: string | null } | null | undefined): boolean {
  if (!profile?.premium_override) return false;
  const exp = profile.premium_override_expires_at;
  if (!exp) return true; // permanent
  return new Date(exp) > new Date();
}

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
  isPremiumVerified: boolean;
  passwordRecoveryActive: boolean;

  // Actions
  setPremiumStatus: (active: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (
    uri: string,
    base64?: string,
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  removeAvatar: () => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verifyAndUpdatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; wrongPassword?: boolean; error?: string }>;
  activatePasswordRecovery: () => void;
  clearPasswordRecovery: () => void;
  initialize: () => Promise<void>;
  clear: () => void;
}

// Module-level subscription handle — prevents duplicate listeners across
// multiple `initialize` calls (e.g. hot-reload or fast-refresh cycles).
let authSubscription: { unsubscribe: () => void } | null = null;

// Module-level RC listener cleanup — ensures only one listener is active at a time.
let rcListenerRemover: (() => void) | null = null;

const AVATAR_BUCKET = "user_profile_img";
const AVATAR_FILE_PREFIX = "avatar.";
const AVATAR_FALLBACK_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

function clearClientStores() {
  useSentenceStore.getState().clear();
  useProgressStore.getState().clear();
  useLeaderboardStore.getState().clear();
  useAchievementStore.getState().clear();
  useReadingStore.getState().clear();
  useGameStore.getState().clear();
  useSettingsStore.getState().clear();
}

function extractAvatarStoragePath(avatarUrl: string | undefined, userId: string): string | null {
  if (!avatarUrl) return null;

  try {
    const url = new URL(avatarUrl);
    const marker = `/object/public/${AVATAR_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    const storagePath = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    return storagePath.startsWith(`${userId}/`) ? storagePath : null;
  } catch {
    return null;
  }
}

async function resolveAvatarPaths(userId: string, avatarUrl?: string): Promise<string[]> {
  const avatarPaths = new Set<string>();

  const currentAvatarPath = extractAvatarStoragePath(avatarUrl, userId);
  if (currentAvatarPath) {
    avatarPaths.add(currentAvatarPath);
  }

  const { data: files, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId, {
    limit: 20,
  });

  if (!error) {
    files
      ?.filter((file) => file.name.startsWith(AVATAR_FILE_PREFIX))
      .forEach((file) => avatarPaths.add(`${userId}/${file.name}`));
  }

  if (avatarPaths.size > 0) {
    return Array.from(avatarPaths);
  }

  return AVATAR_FALLBACK_EXTENSIONS.map((ext) => `${userId}/avatar.${ext}`);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  isPremiumVerified: false,
  passwordRecoveryActive: false,

  setPremiumStatus: (active: boolean) => {
    const { user } = get();
    if (!user) return;
    const wasNotPremium = !user.is_premium;
    // Respect manual override — RC saying false must not revoke an explicit override grant
    const effectivePremium = active || user.premium_override;
    set({ user: { ...user, is_premium: effectivePremium }, isPremiumVerified: true });
    // Sync upgrade to Supabase via SECURITY DEFINER RPC (only on upgrade, no revoke RPC exists)
    if (active && wasNotPremium) {
      void (async () => { await supabase.rpc("set_premium"); })().catch(() => {});
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        // RC login: use CustomerInfo returned directly by logIn() to avoid stale cache
        const { active: rcActive, verified: rcVerified } = await logInUser(data.user.id).catch(
          () => ({ active: false, verified: false })
        );

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: profile?.display_name || "",
          avatar_url: profile?.avatar_url || "",
          premium_override: isOverrideActive(profile),
          // RC active → premium. Manual override (active + not expired) → premium. RC unverified → trust cached Supabase value.
          is_premium: rcActive || isOverrideActive(profile) || (!rcVerified && (profile?.is_premium ?? false)),
          leaderboard_visible: profile?.leaderboard_visible ?? true,
          created_at: data.user.created_at,
        };

        set({
          user,
          session: data.session,
          loading: false,
          isPremiumVerified: rcVerified,
        });

        // Start real-time RC listener (clears any previous one first)
        if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
        rcListenerRemover = setupCustomerInfoListener((active) => get().setPremiumStatus(active));

        // Store session in AsyncStorage
        await AsyncStorage.setItem("supabase_session", JSON.stringify(data.session));
      }

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  signInWithApple: async () => {
    if (Platform.OS !== "ios")
      return { success: false, error: "Apple Sign-In is only available on iOS" };
    set({ loading: true });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        set({ loading: false });
        return { success: false, error: "No identity token received from Apple" };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Apple provides full name only on first sign-in — save it if present
        const displayName = credential.fullName
          ? [credential.fullName.givenName, credential.fullName.familyName]
              .filter(Boolean)
              .join(" ")
          : null;

        if (displayName) {
          await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", data.user.id);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        const { active: rcActive, verified: rcVerified } = await logInUser(data.user.id).catch(
          () => ({ active: false, verified: false })
        );

        const user: User = {
          id: data.user.id,
          email: data.user.email || credential.email || "",
          display_name: displayName || profile?.display_name || "",
          avatar_url: profile?.avatar_url || "",
          premium_override: isOverrideActive(profile),
          // RC active → premium. Manual override (active + not expired) → premium. RC unverified → trust cached Supabase value.
          is_premium: rcActive || isOverrideActive(profile) || (!rcVerified && (profile?.is_premium ?? false)),
          leaderboard_visible: profile?.leaderboard_visible ?? true,
          created_at: data.user.created_at,
        };

        set({ user, session: data.session, loading: false, isPremiumVerified: rcVerified });

        // Start real-time RC listener (clears any previous one first)
        if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
        rcListenerRemover = setupCustomerInfoListener((active) => get().setPremiumStatus(active));
        await AsyncStorage.setItem("supabase_session", JSON.stringify(data.session));
      }

      return { success: true };
    } catch (error: any) {
      set({ loading: false });
      if (error?.code === "ERR_REQUEST_CANCELED") return { success: false };
      return { success: false, error: error.message ?? "Apple Sign-In failed" };
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "parlio://auth/callback",
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error || !data.url) {
        return { success: false, error: error?.message || "Could not get OAuth URL" };
      }

      console.log("OAUTH URL:", data.url);

      const result = await WebBrowser.openAuthSessionAsync(data.url, "parlio://auth/callback");

      console.log("AUTH RESULT:", result);
      console.log("AUTH RESULT TYPE:", result.type);

      if (result.type !== "success") {
        return { success: false };
      }

      console.log("CALLBACK URL:", result.url);

      const callbackResult = await establishSessionFromCallbackUrl(result.url);

      console.log("GOOGLE CALLBACK RESULT:", {
        duplicate: callbackResult.duplicate,
        hasSession: !!callbackResult.session,
        error: callbackResult.error ?? null,
      });

      if (!callbackResult.session) {
        return {
          success: false,
          error: callbackResult.error || "Could not establish session",
        };
      }

      console.log("SIGN IN WITH GOOGLE SUCCESS PATH");
      return { success: true };
    } catch (error) {
      console.log("SIGN IN WITH GOOGLE CATCH:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      set({ loading: false });
      console.log("GOOGLE LOADING FALSE");
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      // Remove RC listener before signing out
      if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove(["supabase_session", "user_settings", "user_settings:guest"]);
      await clearAITrialCache();
      await logOutUser().catch(console.error);
      clearClientStores();
      set({
        user: null,
        session: null,
        loading: false,
        isPremiumVerified: false,
        passwordRecoveryActive: false,
      });
    } catch (error) {
      set({ loading: false });
      if (__DEV__) console.error("Sign out error:", error);
    }
  },

  deleteAccount: async () => {
    set({ loading: true });
    try {
      // Refresh session to ensure a fresh, non-expired access token
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        set({ loading: false });
        return { success: false, error: "Session expired. Please sign in again." };
      }

      const { error } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${refreshData.session.access_token}` },
      });
      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      // Edge function deleted the user — clean up locally
      if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
      await AsyncStorage.multiRemove(["supabase_session", "user_settings", "user_settings:guest"]);
      await clearAITrialCache();
      await logOutUser().catch(console.error);
      clearClientStores();
      set({
        user: null,
        session: null,
        loading: false,
        isPremiumVerified: false,
        passwordRecoveryActive: false,
      });
      return { success: true };
    } catch (error: any) {
      set({ loading: false });
      if (__DEV__) console.error("Delete account error:", error);
      return { success: false, error: error.message ?? "An unexpected error occurred" };
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "parlio://auth/reset-password",
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ loading: true });
    try {
      // is_premium is protected by a DB trigger — it can only be changed via
      // the set_premium() RPC (SECURITY DEFINER). Strip it from direct updates
      // so the trigger doesn't reject the request; local state is still synced below.
      const { is_premium: _ignored, ...dbUpdates } = updates;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
        if (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      }

      set({
        user: { ...user, ...updates },
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  uploadAvatar: async (uri: string, base64?: string) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    try {
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${user.id}/avatar.${ext}`;
      const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

      let uploadData: Blob | Uint8Array;
      if (base64) {
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        uploadData = bytes;
      } else {
        const response = await fetch(uri);
        uploadData = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, uploadData, { contentType, upsert: true });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const result = await get().updateProfile({ avatar_url: publicUrl });
      if (!result.success) return result;

      return { success: true, url: publicUrl };
    } catch (error: any) {
      if (__DEV__) console.error("[uploadAvatar] exception:", error);
      return { success: false, error: error.message ?? "Upload failed" };
    }
  },

  removeAvatar: async () => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };
    try {
      const avatarPaths = await resolveAvatarPaths(user.id, user.avatar_url);

      if (avatarPaths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .remove(avatarPaths);

        if (removeError) {
          return { success: false, error: removeError.message };
        }
      }

      const result = await get().updateProfile({ avatar_url: "" });
      if (!result.success) return result;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Remove failed" };
    }
  },

  updateEmail: async (newEmail: string) => {
    try {
      const { user } = get();
      if (!user) return { success: false, error: "No user logged in" };

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) return { success: false, error: error.message };

      set({ user: { ...user, email: newEmail } });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Update failed" };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      set({ passwordRecoveryActive: false });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Update failed" };
    }
  },

  verifyAndUpdatePassword: async (currentPassword: string, newPassword: string) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };
    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) return { success: false, wrongPassword: true };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Update failed" };
    }
  },

  activatePasswordRecovery: () => set({ passwordRecoveryActive: true }),

  clearPasswordRecovery: () => set({ passwordRecoveryActive: false }),

  initialize: async () => {
    try {
      // Try to restore session from AsyncStorage
      const storedSession = await AsyncStorage.getItem("supabase_session");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.setSession(session);

        if (sessionError) {
          // Refresh token expired or invalid — clear stale session so we don't
          // retry it on every subsequent app launch.
          await AsyncStorage.removeItem("supabase_session");
        } else if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // RC login: use CustomerInfo returned directly by logIn() to avoid stale cache
          const { active: rcActive, verified: rcVerified } = await logInUser(user.id).catch(
            () => ({ active: false, verified: false })
          );

          const userData: User = {
            id: user.id,
            email: user.email!,
            display_name: profile?.display_name || "",
            avatar_url: profile?.avatar_url || "",
            premium_override: isOverrideActive(profile),
          // RC active → premium. Manual override (active + not expired) → premium. RC unverified → trust cached Supabase value.
          is_premium: rcActive || isOverrideActive(profile) || (!rcVerified && (profile?.is_premium ?? false)),
            leaderboard_visible: profile?.leaderboard_visible ?? true,
            created_at: user.created_at,
          };

          set({
            user: userData,
            session,
            initialized: true,
            isPremiumVerified: rcVerified,
          });

          // Start real-time RC listener (clears any previous one first)
          if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
          rcListenerRemover = setupCustomerInfoListener((active) => get().setPremiumStatus(active));
          return;
        }
      }

      // Clean up any previous listener before attaching a new one.
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }

      // Listen for auth changes.
      // IMPORTANT: callback must be synchronous — async callbacks inside
      // onAuthStateChange cause a Supabase internal queue deadlock where
      // setSession never resolves because the async callback holds the lock.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("AUTH STATE CHANGE EVENT:", event, !!session?.user);
        if (event === "SIGNED_IN" && session?.user) {
          // Set minimal user state synchronously so navigation unblocks immediately.
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email!,
            display_name: "",
            avatar_url: "",
            is_premium: false,
            premium_override: false,
            leaderboard_visible: true,
            created_at: session.user.created_at,
          };
          set({ user: basicUser, session });

          // Defer all async work outside the callback to avoid the deadlock.
          void (async () => {
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              await AsyncStorage.setItem("supabase_session", JSON.stringify(session));

              // RC login: use CustomerInfo returned directly by logIn() to avoid stale cache
              const { active: rcActive, verified: rcVerified } = await logInUser(session.user.id).catch(
                () => ({ active: false, verified: false })
              );

              set((state) => ({
                user: state.user
                  ? {
                      ...state.user,
                      display_name: profile?.display_name || "",
                      avatar_url: profile?.avatar_url || "",
                      premium_override: isOverrideActive(profile),
          // RC active → premium. Manual override (active + not expired) → premium. RC unverified → trust cached Supabase value.
          is_premium: rcActive || isOverrideActive(profile) || (!rcVerified && (profile?.is_premium ?? false)),
                      leaderboard_visible: profile?.leaderboard_visible ?? true,
                    }
                  : state.user,
                isPremiumVerified: rcVerified,
              }));

              // Start real-time RC listener (clears any previous one first)
              if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
              rcListenerRemover = setupCustomerInfoListener((active) => get().setPremiumStatus(active));
            } catch (e) {
              console.error("[onAuthStateChange] deferred async error:", e);
            }
          })();
        } else if (event === "SIGNED_OUT") {
          clearClientStores();
          set({
            user: null,
            session: null,
            isPremiumVerified: false,
            passwordRecoveryActive: false,
          });
          void AsyncStorage.removeItem("supabase_session");
          void clearAITrialCache();
        }
      });
      authSubscription = subscription;

      set({ initialized: true });
    } catch (error) {
      if (__DEV__) console.error("Auth initialization error:", error);
      set({ initialized: true });
    }
  },

  clear: () => {
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }
    if (rcListenerRemover) { rcListenerRemover(); rcListenerRemover = null; }
    set({
      user: null,
      session: null,
      loading: false,
      initialized: false,
      isPremiumVerified: false,
      passwordRecoveryActive: false,
    });
  },
}));
