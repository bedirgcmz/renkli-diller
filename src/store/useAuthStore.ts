import { create } from "zustand";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logInUser, logOutUser, isPremiumActive } from "@/services/revenueCat";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_premium: boolean;
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
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (uri: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  clear: () => void;
}

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
          full_name: profile?.full_name || "",
          avatar_url: profile?.avatar_url || "",
          is_premium: profile?.is_premium || rcPremium,
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

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "parlio://auth/callback",
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

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("supabase_session");
      await logOutUser().catch(console.error);
      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      console.error("Sign out error:", error);
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

  uploadAvatar: async (uri: string) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    try {
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${user.id}/avatar.${ext}`;
      const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("user_profile_img")
        .upload(filePath, blob, { contentType, upsert: true });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data } = supabase.storage.from("user_profile_img").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const result = await get().updateProfile({ avatar_url: publicUrl });
      if (!result.success) return result;

      return { success: true, url: publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message ?? "Upload failed" };
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

  initialize: async () => {
    try {
      // Try to restore session from AsyncStorage
      const storedSession = await AsyncStorage.getItem("supabase_session");
      if (storedSession) {
        const session = JSON.parse(storedSession);
        const {
          data: { user },
        } = await supabase.auth.setSession(session);

        if (user) {
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
            full_name: profile?.full_name || "",
            avatar_url: profile?.avatar_url || "",
            is_premium: profile?.is_premium || rcPremium,
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

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            full_name: profile?.full_name || "",
            avatar_url: profile?.avatar_url || "",
            is_premium: profile?.is_premium || false,
            created_at: session.user.created_at,
          };

          set({
            user,
            session,
          });

          // Store session
          await AsyncStorage.setItem("supabase_session", JSON.stringify(session));
        } else if (event === "SIGNED_OUT") {
          await AsyncStorage.removeItem("supabase_session");
          set({
            user: null,
            session: null,
          });
        }
      });

      set({ initialized: true });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ initialized: true });
    }
  },

  clear: () =>
    set({
      user: null,
      session: null,
      loading: false,
      initialized: false,
    }),
}));
