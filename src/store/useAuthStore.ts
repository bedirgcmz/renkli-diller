import { create } from "zustand";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logInUser, logOutUser, isPremiumActive } from "@/services/revenueCat";
import * as AppleAuthentication from "expo-apple-authentication";

interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  leaderboard_visible: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;

  // Actions
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
  initialize: () => Promise<void>;
  clear: () => void;
}

// Module-level subscription handle — prevents duplicate listeners across
// multiple `initialize` calls (e.g. hot-reload or fast-refresh cycles).
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

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

        // RevenueCat login + premium check
        await logInUser(data.user.id).catch(console.error);
        const rcPremium = await isPremiumActive().catch(() => false);

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: profile?.display_name || "",
          avatar_url: profile?.avatar_url || "",
          is_premium: profile?.is_premium || rcPremium,
          leaderboard_visible: profile?.leaderboard_visible ?? true,
          created_at: data.user.created_at,
        };

        set({
          user,
          session: data.session,
          loading: false,
        });

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
        await logInUser(data.user.id).catch(console.error);
        const rcPremium = await isPremiumActive().catch(() => false);

        const user: User = {
          id: data.user.id,
          email: data.user.email || credential.email || "",
          display_name: displayName || profile?.display_name || "",
          avatar_url: profile?.avatar_url || "",
          is_premium: profile?.is_premium || rcPremium,
          leaderboard_visible: profile?.leaderboard_visible ?? true,
          created_at: data.user.created_at,
        };

        set({ user, session: data.session, loading: false });
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
      console.log("CALLBACK URL:", result?.url);
      console.log("AUTH RESULT TYPE:", result.type);

      if (result.type !== "success") {
        return { success: false };
      }

      // Parse tokens from the callback URL (fragment or query string)
      const callbackUrl = result.url;
      const tokenString = callbackUrl.includes("#")
        ? callbackUrl.split("#")[1]
        : callbackUrl.split("?")[1];

      if (!tokenString) {
        return { success: false, error: "No tokens in callback URL" };
      }

      const params = Object.fromEntries(
        tokenString.split("&").map((pair) => pair.split("=").map(decodeURIComponent)),
      );

      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      console.log("PARSED TOKENS:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      if (!accessToken || !refreshToken) {
        return { success: false, error: "Missing tokens in callback" };
      }

      console.log("BEFORE setSession");

      // Fire-and-forget: setSession hangs on React Native + AsyncStorage (deadlock
      // between Supabase's internal storage write and onAuthStateChange handler's
      // AsyncStorage.setItem). onAuthStateChange SIGNED_IN handles user state.
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data: sessionData, error: sessionError }) => {
          console.log("AFTER setSession", {
            hasSession: !!sessionData?.session,
            hasUser: !!sessionData?.user,
            sessionError: sessionError?.message ?? null,
          });
        })
        .catch((e) => console.log("setSession rejected:", e));

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
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove(["supabase_session", "user_settings"]);
      await logOutUser().catch(console.error);
      set({
        user: null,
        session: null,
        loading: false,
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
      await AsyncStorage.multiRemove(["supabase_session", "user_settings"]);
      await logOutUser().catch(console.error);
      set({ user: null, session: null, loading: false });
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
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
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
        .from("user_profile_img")
        .upload(filePath, uploadData, { contentType, upsert: true });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data } = supabase.storage.from("user_profile_img").getPublicUrl(filePath);
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
      const filePath = `${user.id}/avatar.jpg`;
      await supabase.storage.from("user_profile_img").remove([filePath]);
      const result = await get().updateProfile({ avatar_url: "" });
      if (!result.success) return result;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Remove failed" };
    }
  },

  updateEmail: async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Update failed" };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
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

          // RevenueCat login + premium check
          await logInUser(user.id).catch(console.error);
          const rcPremium = await isPremiumActive().catch(() => false);

          const userData: User = {
            id: user.id,
            email: user.email!,
            display_name: profile?.display_name || "",
            avatar_url: profile?.avatar_url || "",
            is_premium: profile?.is_premium || rcPremium,
            leaderboard_visible: profile?.leaderboard_visible ?? true,
            created_at: user.created_at,
          };

          set({
            user: userData,
            session,
            initialized: true,
          });
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

              if (profile) {
                set((state) => ({
                  user: state.user
                    ? {
                        ...state.user,
                        display_name: profile.display_name || "",
                        avatar_url: profile.avatar_url || "",
                        is_premium: profile.is_premium || false,
                        leaderboard_visible: profile.leaderboard_visible ?? true,
                      }
                    : state.user,
                }));
              }
            } catch (e) {
              console.error("[onAuthStateChange] deferred async error:", e);
            }
          })();
        } else if (event === "SIGNED_OUT") {
          set({ user: null, session: null });
          void AsyncStorage.removeItem("supabase_session");
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
    set({
      user: null,
      session: null,
      loading: false,
      initialized: false,
    });
  },
}));
