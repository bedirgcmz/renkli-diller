import { supabase } from "@/lib/supabase";

const AUTH_DEDUP_WINDOW_MS = 3000;

let lastHandledAuthUrl: string | null = null;
let lastHandledAuthTime = 0;

export function isAuthCallbackUrl(url: string) {
  return url.includes("auth/callback") || url.includes("auth/reset-password");
}

function extractTokenString(url: string) {
  if (url.includes("#")) {
    return url.split("#")[1] ?? null;
  }

  if (url.includes("?")) {
    return url.split("?")[1] ?? null;
  }

  return null;
}

export async function establishSessionFromCallbackUrl(url: string): Promise<{
  handled: boolean;
  duplicate: boolean;
  session: any | null;
  error?: string;
}> {
  if (!isAuthCallbackUrl(url)) {
    return {
      handled: false,
      duplicate: false,
      session: null,
    };
  }

  const now = Date.now();
  if (lastHandledAuthUrl === url && now - lastHandledAuthTime < AUTH_DEDUP_WINDOW_MS) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      handled: true,
      duplicate: true,
      session: session ?? null,
      error: session ? undefined : "Duplicate auth callback ignored before session was available",
    };
  }

  lastHandledAuthUrl = url;
  lastHandledAuthTime = now;

  const tokenString = extractTokenString(url);
  if (!tokenString) {
    return {
      handled: true,
      duplicate: false,
      session: null,
      error: "No tokens in callback URL",
    };
  }

  const params = new URLSearchParams(tokenString);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return {
      handled: true,
      duplicate: false,
      session: null,
      error: "Missing tokens in callback",
    };
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return {
      handled: true,
      duplicate: false,
      session: null,
      error: error?.message || "Could not establish session",
    };
  }

  return {
    handled: true,
    duplicate: false,
    session: data.session,
  };
}
