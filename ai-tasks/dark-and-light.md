**Context**:
The project, FitApp (built with Expo, NativeWind, and TypeScript), is experiencing theme synchronization issues. When switching to Light Mode, several elements remain dark. Currently, colors are duplicated across `src/constants/colors.ts` and `tailwind.config.js`, leading to inconsistencies and maintenance overhead.

**Objectives**:
Perform a comprehensive audit of the project to identify hardcoded colors and NativeWind logic errors, following the "Single Source of Truth" (SSOT) principle.

**Audit Tasks**:

1. **Tailwind Config & Colors Sync**:
* Analyze the relationship between `tailwind.config.js` and `src/constants/colors.ts`.
* Identify any mismatched HEX codes between these two files.
* Check if `colors.ts` is being programmatically imported into the Tailwind configuration (currently, they appear to be manually synced).


2. **NativeWind Pattern Audit**:
* Identify "Theme Traps": instances where classes like `className="bg-background-dark"` are used without a corresponding light mode class or the `dark:` prefix.
* Verify that all root containers (`View`, `SafeAreaView`, `ScrollView`) have proper `dark:` prefix pairs for background colors.
* Locate elements using `className="bg-primary"` and determine if they correctly transition between `primary.DEFAULT` and `primary.light` during theme changes.


3. **Hardcode Detection**:
* Generate a list of all raw HEX, RGBA, or named color strings (e.g., 'white', 'black') found within `.tsx` or `.ts` files that are not referencing the Tailwind theme or `colors.ts`.


4. **Theme Switcher Logic**:
* Audit the theme switching mechanism (Context or State). Ensure it correctly invokes the `colorScheme` toggle in NativeWind.
* Check the `NavigationContainer` configuration: ensure it receives the active theme state to update system-level navigation backgrounds.



**Output Requirements**:
Create a detailed report in `/ai-tasks/theme_reconstruction_plan.md` with the following sections:

1. **Conflict Map**: A list of discrepancies between `colors.ts` and `tailwind.config.js`.
2. **Hardcode Registry**: A table (File | Line | Value) of all hardcoded color instances.
3. **Critical Fixes**: A list of components missing `dark:` prefixes that are causing the "partial" Light Mode bug.
4. **Refactoring Plan**:
* **Step 1**: Instructions for programmatically merging `colors.ts` into `tailwind.config.js`.
* **Step 2**: A prioritized list of components requiring a transition from fixed colors to dynamic classes (e.g., `text-text dark:text-text-dark`).



**Important**: Do not modify any code. Provide only the analysis and a detailed step-by-step plan in the .md file.

