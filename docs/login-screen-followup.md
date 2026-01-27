# Login Screen UI Follow-up

This document captures the follow-up notes for the Login screen UI task (OAuth button stubs and temporary navigation).

## What was added
- Updated Login screen UI to include Apple/Google sign-in placeholders.
- Buttons are visual stubs only (no OAuth implementation).
- Tapping either button navigates to the main dashboard (`Main`) for now.

## Files touched
- `src/screens/LoginScreen.tsx`
- `src/navigation/RootNavigator.tsx`

## Temporary behavior
- OAuth buttons call a stub handler that replaces the stack with `Main`.
- `Main` is registered in the unauthenticated branch of `RootNavigator` to allow this temporary flow.

## TODO (when implementing real OAuth)
- Wire Apple/Google buttons to `signInWithOAuth` and update `authService` implementation.
- Remove `Main` from the unauthenticated stack (restore auth gating).
- Add proper loading/error states and deep link handling for OAuth redirects.

## Quick QA checklist
- Login screen renders centered and clean on iOS and Android.
- OAuth buttons are visible and tappable.
- Tapping either button navigates to the main dashboard.
- Normal email/password sign-in flow remains unchanged.
