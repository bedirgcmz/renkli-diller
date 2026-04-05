import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// RevenueCat event types that grant premium access
const ACTIVATE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
]);

// RevenueCat event types that revoke premium access
const DEACTIVATE_EVENTS = new Set([
  "EXPIRATION",
]);

// All other event types (CANCELLATION, BILLING_ISSUE, etc.) are ignored —
// CANCELLATION means "won't renew" but the subscription is still active until period end.

serve(async (req) => {
  // RevenueCat calls this endpoint directly (server-to-server).
  // No CORS headers needed — this is not called from a browser.

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // ── 1. Verify webhook secret ────────────────────────────────────────────
  const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[rc-webhook] REVENUECAT_WEBHOOK_SECRET is not set");
    return new Response("Server misconfiguration", { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== webhookSecret) {
    console.warn("[rc-webhook] Unauthorized request — bad or missing secret");
    return new Response("Unauthorized", { status: 401 });
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let payload: { event?: { type?: string; app_user_id?: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = payload?.event?.type;
  const appUserId = payload?.event?.app_user_id;

  console.log(`[rc-webhook] event=${eventType} user=${appUserId}`);

  if (!eventType || !appUserId) {
    return new Response("Missing event.type or event.app_user_id", { status: 400 });
  }

  // ── 3. Determine action ──────────────────────────────────────────────────
  let newIsPremium: boolean | null = null;

  if (ACTIVATE_EVENTS.has(eventType)) {
    newIsPremium = true;
  } else if (DEACTIVATE_EVENTS.has(eventType)) {
    newIsPremium = false;
  } else {
    // Unknown or intentionally ignored event — acknowledge without DB write
    console.log(`[rc-webhook] ignoring event type: ${eventType}`);
    return new Response("OK", { status: 200 });
  }

  // ── 4. Update database (service_role bypasses RLS and the guard trigger) ─
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await adminClient
    .from("profiles")
    .update({ is_premium: newIsPremium })
    .eq("id", appUserId);

  if (error) {
    console.error(`[rc-webhook] DB update failed for user ${appUserId}:`, error.message);
    // Return 500 so RevenueCat retries the webhook
    return new Response("Database error", { status: 500 });
  }

  console.log(`[rc-webhook] set is_premium=${newIsPremium} for user ${appUserId}`);
  return new Response("OK", { status: 200 });
});
