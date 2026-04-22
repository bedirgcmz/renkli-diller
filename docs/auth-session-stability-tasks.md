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
- Review OAuth callback handling in [src/lib/authCallback.ts](/Users/bedir/Desktop/personal-works/parlio/src/lib/authCallback.ts) for compatibility with the new restore model.
- Review password recovery flow to ensure reset links still establish session state correctly.
- Decide whether the manual `supabase_session` key should be removed entirely or kept as a short-lived migration fallback.
- Add focused logging around initialization and auth events so future session-loss issues are easier to diagnose.
- Test cold start, warm reopen, overnight reopen, token refresh, offline reopen, password reset return, Google login, Apple login, and manual logout flows.

## Yapilanlar

- Supabase persisted session tek gerçek kaynak olarak bırakıldı.
- `supabase_session` legacy key normal auth lifecycle içinde artık yazılmıyor.
- Legacy session fallback sadece `initialize()` içinde bir kez okunuyor.
- Legacy restore başarılıysa `setSession()` ile Supabase'e taşınıp legacy key hemen siliniyor.
- `INITIAL_SESSION` ve `SIGNED_IN` ortak hydrate hattı korunarak kullanılıyor.
- `SIGNED_OUT` cleanup davranışı reason-based hale getirildi.
- Manual `signOut()` ve `deleteAccount()` için explicit cleanup guard eklendi.
- `SIGNED_OUT` event'i önce explicit cleanup çakışmasını, sonra recoverable session durumunu kontrol ediyor.
- Callback parser davranışı korunup, gereksiz gevşetme yapılmadı.
- Password recovery akışı korunarak `activatePasswordRecovery()` ve reset ekranı yönlendirmesi bozulmadan bırakıldı.
- Auth restore ve cleanup akışına hedefli teşhis logları eklendi.

## Kalanlar

- Gerçek cihazda birkaç gün sürecek davranış doğrulaması yapılmalı.
- Özellikle overnight reopen, token refresh boundary, offline reopen, Google/Apple callback dönüşleri ve password reset deep link dönüşü izlenmeli.
- Manual logout ve delete account senaryolarında guard davranışı loglarla doğrulanmalı.

## Done Criteria

- Reopening the app the next morning does not require login for a healthy authenticated account.
- Manual logout still clears state immediately and predictably.
- OAuth and password recovery flows remain functional.
- No auth regressions are introduced in app startup/navigation.

## Verification Notes

- Watch logs for `AUTH STATE CHANGE EVENT:` to confirm `INITIAL_SESSION`, `SIGNED_IN`, `TOKEN_REFRESHED`, and `SIGNED_OUT` ordering.
- Watch logs for `[auth] initialize restored session source=supabase_persisted` on normal reopen.
- Watch logs for `[auth] legacy_read`, `[auth] legacy_removed reason=...`, and `[auth] initialize restored session source=legacy_fallback` only on legacy migration scenarios.
- Watch logs for `[auth] cleanup_skipped_explicit` during manual logout and delete account flows.
- Watch logs for `[auth] cleanup_skipped_recoverable` when a transient `SIGNED_OUT` event occurs but a recoverable session still exists.
- Watch logs for `[auth] cleanup_confirmed_signed_out` only when the session is genuinely not recoverable.
- Watch logs for `[auth] manual_signout_cleanup` and `[auth] delete_account_cleanup` to confirm explicit cleanup paths are being used.

## Manual Test Checklist

- [ ] Password sign-in -> fully kill app -> reopen after a few seconds
Expected: user stays signed in and logs show `source=supabase_persisted` on a normal restore path.

- [ ] Password sign-in -> fully kill app -> reopen after device idle/overnight
Expected: user stays signed in without being sent to auth screens.

- [ ] Password sign-in -> background app -> reopen after token refresh window
Expected: user stays signed in, and any auth event noise does not force local cleanup.

- [ ] Password sign-in -> disable network -> reopen app
Expected: last valid local session still restores and the user is not unexpectedly logged out.

- [ ] Warm reopen / foreground return while already signed in
Expected: app stays inside the authenticated shell and does not flicker into auth flow.

- [ ] Google sign-in -> cold start reopen
Expected: sign-in succeeds, reopen keeps the user signed in, and callback handling establishes a valid session.

- [ ] Apple sign-in -> cold start reopen
Expected: sign-in succeeds, reopen keeps the user signed in, and callback handling establishes a valid session.

- [ ] Password reset deep link return
Expected: reset password screen opens, password update succeeds, and the app returns to a valid authenticated state.

- [ ] Manual sign-out
Expected: app returns to auth flow immediately, stays signed out on reopen, and logs show `manual_signout_cleanup` plus `cleanup_skipped_explicit` rather than a duplicate event cleanup.

- [ ] Delete account
Expected: local auth state is cleared, reopen does not restore the deleted session, and logs show `delete_account_cleanup`.
