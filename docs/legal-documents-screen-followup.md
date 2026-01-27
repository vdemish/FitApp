# Legal Documents Screen Follow-up

This document captures the follow-up notes for the Legal Documents screen (Privacy Policy and Terms of Service).

## What was added
- New LegalDocuments screen with a header/back button and scrollable document layout.
- Legal document copy stored in a dedicated constants file.
- Screen registered in the root stack for authenticated and unauthenticated users.

## Files touched
- `src/screens/LegalDocumentsScreen.tsx`
- `src/constants/legalDocuments.ts`
- `src/navigation/RootNavigator.tsx`

## Notes
- Content is placeholder copy and should be reviewed by legal before release.
- Back button uses `navigation.goBack()` and haptic selection feedback.

## Quick QA checklist
- Navigate to the LegalDocuments screen and verify the header/back button works.
- Scroll through both Privacy Policy and Terms sections without clipping.
- Verify text colors and borders adapt correctly in light and dark themes.
