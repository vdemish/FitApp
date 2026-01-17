**Role:** Senior Security Engineer & Lead DevOps Specialist.
**Task:** Conduct a comprehensive Security Vulnerability Analysis, Supabase Connection Audit, and Authentication Scheme Review for the "FitApp" React Native (Expo) project.

**Context:**
The project is a fitness tracker migrated to React Native. It uses Supabase for the backend. The authentication system is currently being implemented/transitioned.

**Objective:** Generate a structured "Security & Connectivity Report".
**Constraint:** Do not modify any code. Focus strictly on identification, logic verification, and reporting.

**Scope of Analysis:**

1. **Secret Management & Leakage:**
   - Audit the codebase for hardcoded Supabase keys or sensitive credentials.
   - Verify that `EXPO_PUBLIC_` variables are used correctly and no "Service Role" keys are exposed in the client build.

2. **Authentication Scheme Deep Dive:**
   - **Email/Password Flow:** Review the implementation of the standard login/signup. Check for secure password handling and session persistence via `AsyncStorage`.
   - **OAuth Readiness (Google & Apple):** - Audit the placeholders/configuration for Google and Apple Sign-In.
     - Check for "Deep Linking" configuration (URL Schemes/Universal Links) which is required for OAuth redirects in mobile apps.
     - Verify if the code is prepared for the `PKCE` flow (Supabase's standard for mobile auth).
   - **iOS Compliance:** Ensure the plan accounts for Apple's requirement: if Google login is offered, "Sign in with Apple" must also be implemented and equally prominent.

3. **Supabase Connectivity & Integration:**
   - Verify the `supabase.ts` client initialization and the use of the `auth` helper for React Native.
   - Analyze how the app handles session expiration and token refreshing on mobile.

4. **Database Security (RLS Audit):**
   - Review table structures (exercises, sessions, sets) for Row Level Security (RLS) policies.
   - Ensure that `auth.uid()` checks are correctly planned to prevent cross-user data leaks.

5. **Data Privacy & Logging:**
   - Check for sensitive data (user metrics, tokens) being printed to `console.log` in development/production modes.

**Deliverable Format:**
Provide a structured Markdown report including:
- **Executive Summary:** Overall security and readiness score.
- **Authentication Audit:** Detailed breakdown of Email/Password security and OAuth (Google/Apple) preparation status.
- **Critical Vulnerabilities:** List of high-risk issues (e.g., missing RLS, leaked keys).
- **Connectivity & Persistence Status:** Evaluation of how the app stays connected to Supabase.
- **Recommendations Checklist:** Prioritized steps for the developer to harden the app before release.