# FitApp Security & Connectivity Report

**Project:** FitApp – React Native (Expo) Fitness Tracker  
**Audit Date:** 2026-01-17  
**Auditor Role:** Senior Security Engineer & Lead DevOps Specialist

---

## Executive Summary

| Category | Status | Score |
|----------|--------|-------|
| **Secret Management** | ✅ Secure | 9/10 |
| **Auth: Email/Password** | ✅ Implemented | 8/10 |
| **Auth: OAuth (Google/Apple)** | ⚠️ Not Ready | 3/10 |
| **Supabase Connectivity** | ✅ Well Configured | 9/10 |
| **RLS Policies** | ⚠️ Not Auditable | N/A |
| **Data Privacy & Logging** | ✅ Acceptable | 8/10 |

**Overall Readiness Score: 7/10** – Core authentication is functional, but OAuth and RLS require attention before production release.

---

## 1. Secret Management & Leakage

### ✅ Findings: SECURE

| Check | Result |
|-------|--------|
| `.env` properly gitignored | ✅ Yes |
| Uses `EXPO_PUBLIC_` prefix | ✅ Yes (correct for Expo) |
| Service Role key exposed | ✅ No – Only `anon` key present |
| Hardcoded keys in source | ✅ None found |
| JWT tokens in code files | ✅ None found |

**Evidence:**
- `.gitignore` correctly excludes `.env` and `.env*.local`
- `.env` uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Searched for `service_role` and JWT patterns (`eyJhbGci`) in all TS/TSX/JS files – **0 matches**

> [!NOTE]
> The `anon` key is designed to be public and is safe for client-side use. The critical `service_role` key is correctly absent from the codebase.

---

## 2. Authentication Scheme Deep Dive

### 2.1 Email/Password Flow ✅

| Aspect | Status | Details |
|--------|--------|---------|
| Secure password input | ✅ | `secureTextEntry` enabled in `LoginScreen.tsx` |
| Password validation | ✅ | Minimum 6 characters enforced client-side |
| Session persistence | ✅ | Uses `AsyncStorage` via `supabase.ts` |
| Auto token refresh | ✅ | `autoRefreshToken: true` configured |
| Error handling | ✅ | Centralized via `AuthServiceError` class |

**Implementation Quality:** The email/password flow is well-implemented with proper separation of concerns between `authService.ts`, `AuthContext.tsx`, and `LoginScreen.tsx`.

---

### 2.2 OAuth (Google & Apple) ⚠️ NOT READY

> [!WARNING]
> OAuth authentication is currently a **placeholder** that throws an error when invoked.

| Requirement | Status |
|-------------|--------|
| OAuth implementation | ❌ Stub only – throws "Не реализован" error |
| Deep Linking (URL Schemes) | ❌ Not configured in `app.json` |
| Universal Links | ❌ Not configured |
| PKCE flow support | ❓ Not implemented (Supabase supports it) |
| `expo-auth-session` integration | ❌ Not present |

**Evidence from `authService.ts`:**
```typescript
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
    console.warn(`[AuthService] OAuth вход через ${provider} ещё не реализован`);
    throw new AuthServiceError(
        `Вход через ${provider === 'google' ? 'Google' : 'Apple'} пока недоступен.`
    );
}
```

**Missing in `app.json`:**
```json
// Required for OAuth redirects (currently missing):
"ios": {
  "bundleIdentifier": "com.yourcompany.fitapp",
  "associatedDomains": ["applinks:bjxjbmoltombfbxcfpjl.supabase.co"]
},
"android": {
  "package": "com.yourcompany.fitapp",
  "intentFilters": [...]
},
"scheme": "fitapp"
```

---

### 2.3 iOS Compliance (App Store) ⚠️

> [!IMPORTANT]
> **Apple Sign-In Requirement:** If Google Sign-In is offered, Apple Sign-In must also be implemented and equally prominent.

| Check | Status |
|-------|--------|
| Google & Apple parity planned | ✅ Both defined in `OAuthProvider` type |
| Apple Sign-In implemented | ❌ No (placeholder only) |
| UI prominence equal | ❓ Cannot assess (OAuth buttons not rendered) |

**Recommendation:** Before enabling Google Sign-In, ensure Apple Sign-In is fully implemented to avoid App Store rejection.

---

## 3. Supabase Connectivity & Integration ✅

### Client Configuration: EXCELLENT

| Setting | Value | Assessment |
|---------|-------|------------|
| `storage` | `AsyncStorage` | ✅ Required for React Native |
| `autoRefreshToken` | `true` | ✅ Handles token expiration |
| `persistSession` | `true` | ✅ Session survives app restarts |
| `detectSessionInUrl` | `false` | ✅ Correct for mobile (no browser URLs) |

**Session Lifecycle:**
- ✅ Auth state changes trigger automatic profile loading
- ✅ `onAuthStateChange` listener properly manages SIGNED_IN, SIGNED_OUT, USER_UPDATED events
- ✅ Unmount cleanup prevents memory leaks via `mounted` flag pattern

---

## 4. Database Security (RLS Audit) ⚠️

> [!CAUTION]
> **RLS policies cannot be audited** – No Supabase migrations folder found in the React Native project.

| Check | Status |
|-------|--------|
| `supabase/` migrations directory | ❌ Not found |
| RLS policies defined in code | ❌ No SQL files present |
| `auth.uid()` checks | ❓ Cannot verify |

**Risk Assessment:**
The `UserProfile` type references a `users` table. Without RLS policies, any authenticated user could potentially read/write other users' data.

**Required Actions:**
1. If RLS policies exist in a separate Supabase project, verify:
   ```sql
   -- Example: Ensure users can only access their own profile
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can read own profile" ON users
       FOR SELECT USING (auth.uid() = id);
   ```
2. Audit tables: `users`, `exercises`, `sessions`, `sets` (referenced in task context)

---

## 5. Data Privacy & Logging ✅

### Console Output Analysis

| Location | Log Content | Risk Level |
|----------|-------------|------------|
| `AuthContext.tsx:88` | Auth event name (SIGNED_IN, etc.) | 🟢 Low |
| `AuthContext.tsx:51,72` | Error object (no PII) | 🟢 Low |
| `authService.ts:99` | OAuth provider name | 🟢 Low |
| `authService.ts:120` | Error message only | 🟢 Low |
| `authService.ts:139` | "Profile not found" message | 🟢 Low |
| `ProfileScreen.tsx:18` | Sign-out error | 🟢 Low |

**Assessment:** No sensitive data (tokens, passwords, user metrics) is logged. All console output is appropriate for development debugging.

> [!TIP]
> Consider using a logging library (e.g., `react-native-logs`) with environment-based filtering to automatically suppress logs in production builds.

---

## 6. Recommendations Checklist

### 🔴 Critical (Pre-Release Blockers)

- [ ] **Verify RLS Policies** – Access the Supabase dashboard and confirm Row Level Security is enabled on all tables with proper `auth.uid()` checks
- [ ] **Disable OAuth UI** – If Google/Apple buttons are shown in UI, hide them until implementation is complete to prevent user confusion

### 🟡 High Priority

- [ ] **Implement Deep Linking** – Add `scheme`, `bundleIdentifier`, and `associatedDomains` to `app.json` for OAuth redirects
- [ ] **Implement OAuth with PKCE** – Use `expo-auth-session` for Google/Apple sign-in with Supabase's PKCE flow
- [ ] **Apple Sign-In Parity** – Implement Apple Sign-In before or simultaneously with Google Sign-In

### 🟢 Recommended

- [ ] **Production Logging** – Implement log level filtering (debug/info/warn/error) based on `__DEV__` flag
- [ ] **Rate Limiting Awareness** – Consider implementing exponential backoff for failed auth attempts
- [ ] **Delete `old/` Directory** – Remove legacy web codebase to reduce attack surface and confusion

---

## Appendix: Files Audited

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `.gitignore` | Git exclusions |
| `app.json` | Expo configuration |
| `src/services/supabase.ts` | Supabase client |
| `src/services/authService.ts` | Auth business logic |
| `src/context/AuthContext.tsx` | React auth state |
| `src/screens/LoginScreen.tsx` | Login UI |
| `src/navigation/RootNavigator.tsx` | Auth-aware routing |
| `App.tsx` | App entry point |
| `src/types/auth.ts` | Type definitions |
