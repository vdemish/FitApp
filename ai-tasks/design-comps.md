### Prompt for IDE AI Agent (Refactoring & Design System)

**Context:**
You are a Senior Frontend Architect and UI/UX expert specialized in React and TypeScript. I have a project where screens were generated individually, leading to inconsistent design elements (colors, shadows, font sizes, padding) and messy code.

**Objective:**
Refactor the codebase to establish a unified Design System, clean up technical debt, and ensure visual consistency across all screens.

**Task Checklist:**

**1. Design Tokens Extraction (The "Source of Truth"):**

* Analyze all existing CSS/Styles in the project.
* Identify the most frequent and "correct" looking colors, gradients, and fonts (aiming for a modern "Liquid Glass" aesthetic).
* Create a central theme file (e.g., `theme.ts`, `tailwind.config.js`, or a CSS variables file) defining:
* **Palette:** Primary, Secondary, Backgrounds, Text (primary/secondary), and Alert colors.
* **Typography:** Headings (H1-H3), Body text, Captions. Define font-family, weight, and size.
* **Effects:** Standardize the "Glass" effect (blur, opacity, border), Shadows, and Border Radius.
* **Spacing:** Define a grid system (4px or 8px baseline).



**2. Component Library Creation (Atomic Design):**

* Create a `components/ui` directory.
* Extract and normalize the following reusable components using React & TypeScript interfaces:
* **Button:** Create variants (Primary, Secondary, Ghost, Icon-only). Ensure large touch targets (min 44px).
* **Input:** Text fields with consistent states (focus, error, disabled).
* **Card/Container:** A standard "Glass" container component to wrap content.
* **Typography:** Reusable text components (e.g., `<Text variant="h1">`) to enforce font consistency.


* **Strict Rule:** Do not allow hardcoded hex values or magic numbers inside components. Use the Design Tokens defined in Step 1.

**3. Refactoring & Cleanup:**

* Go through the screen files one by one.
* Replace hardcoded HTML/CSS with the new components from `components/ui`.
* Remove unused imports, dead code, and redundant style definitions.
* Ensure all components are strictly typed with TypeScript.

**4. Visual QA:**

* Ensure that Dark Mode and Light Mode logic is consistent (if applicable).
* Check that the "Start Workout" screen retains its specific "Large UI" requirement while still using the shared design tokens.

**Output Requirement:**
Start by listing the Design Tokens you plan to establish. Once I approve, proceed with creating the base components, and finally refactor the screens.

