# Auth Session Stability Tasks

Goal: prevent users from being unexpectedly logged out between app launches, especially after overnight inactivity.

## Scope

- Keep authenticated users signed in unless they explicitly log out or their session is genuinely no longer recoverable.
- Avoid regressions in Google sign-in, Apple sign-in, password recovery, and manual sign-out flows.

## Tasks

- Audit the current auth restore flow end-to-end and document the exact session sources in use.
- Remove dual-source ambiguity between Supabase persisted auth state and the custom `supabase_session` AsyncStorage copy.
- Refactor `useAuthStore.initialize()` so auth subscriptions are always attached, even after a successful restore.
- Handle `INITIAL_SESSION` explicitly in `onAuthStateChange` and align it with the existing `SIGNED_IN` hydration logic.
- Make `SIGNED_OUT` cleanup resilient so transient restore gaps do not wipe local auth state unnecessarily.
- Review OAuth callback handling in [src/lib/authCallback.ts](/Users/bedir/Desktop/personal-works/renkli-diller/src/lib/authCallback.ts) for compatibility with the new restore model.
- Review password recovery flow to ensure reset links still establish session state correctly.
- Decide whether the manual `supabase_session` key should be removed entirely or kept as a short-lived migration fallback.
- Add focused logging around initialization and auth events so future session-loss issues are easier to diagnose.
- Test cold start, warm reopen, overnight reopen, token refresh, offline reopen, password reset return, Google login, Apple login, and manual logout flows.

## Done Criteria

- Reopening the app the next morning does not require login for a healthy authenticated account.
- Manual logout still clears state immediately and predictably.
- OAuth and password recovery flows remain functional.
- No auth regressions are introduced in app startup/navigation.

## Manual Test Matrix

- Password sign-in -> fully kill app -> reopen after a few seconds -> user stays signed in.
- Password sign-in -> fully kill app -> reopen after device idle/overnight -> user stays signed in.
- Password sign-in -> background app for a while -> reopen after token refresh window -> user stays signed in.
- Password sign-in -> disable network -> reopen app -> last valid session still restores locally.
- Google sign-in -> cold start reopen -> user stays signed in.
- Apple sign-in -> cold start reopen -> user stays signed in.
- Password reset deep link -> reset password screen opens -> password update succeeds -> app returns to a valid authenticated state.
- Manual sign-out -> app returns to auth flow immediately and stays signed out on reopen.
- Delete account -> local auth state is cleared and reopen does not restore the deleted session.

## Verification Notes

- Watch logs for `AUTH STATE CHANGE EVENT:` to confirm `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, and `SIGNED_OUT` ordering.
- Watch logs for `[auth] initialize restored Supabase persisted session` on normal reopen.
- Watch logs for `[auth] initialize restored session from legacy fallback` only on old-session migration scenarios.
- If `[auth] SIGNED_OUT ignored because a recoverable session still exists` appears, confirm the user remains inside the app and is not sent to auth screens.
