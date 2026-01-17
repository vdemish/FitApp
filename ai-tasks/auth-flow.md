**Task:** Implement a modular Authentication system that currently supports **Email/Password** but is architected to easily add **Google** and **Apple** OAuth later.

**Requirements:**



* Create a class or a set of functions that wrap Supabase Auth methods.
* Implement: `signUp(email, password, fullName)`, `signIn(email, password)`, and `signOut()`.
* **Crucial:** Add a placeholder method `signInWithOAuth(provider: 'google' | 'apple')` that currently just throws an error or logs "Not implemented", so I can fill it later.

* Create an `AuthContext` and a `useAuth` hook.
* It must listen to Supabase auth state changes (`onAuthStateChange`).
* It should store the `user` object and a `loading` state.
* It should fetch additional profile data (like `subscription_tier`) from the `public.users` table whenever a user logs in.



* Create a `ProtectedRoute` component to wrap private pages.
* If the user is not authenticated, redirect them to the `/login` page.


Deliverables:

* Detailed comments in **Russian** explaining the architecture and how to add OAuth providers in the future.
