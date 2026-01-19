**Context:**
We are refactoring the main tab. The current `WorkoutScreen` will become the `HomeScreen`. We are implementing a new flow to start a workout.

**Objective:**
Rename the screen, update the header, and implement a complex "Start Workout" modal with three sections (History, Templates, and Manual Selection).

**Implementation Plan (Step-by-Step):**

**Step 1: Rename & Header Logic**

1. **Rename:** Change `WorkoutScreen.tsx` to `HomeScreen.tsx`. Update the bottom navigation label to "Home" and change the icon to a "Home" icon.
2. **Header:** Instead of a static title, display the current date in the header.
* Format: "dd/MMM, dddd" (e.g., "19/Jan, Monday").
* Use a helper function to format the date dynamically.



**Step 2: "Start Workout" Interaction & UI Structure**

1. **Main Button:** Add a large "Start Workout" button to the center (or appropriate position) of the Home screen.
2. **The Slider (Bottom Sheet):** When the button is clicked, open a **Modal** or **Bottom Sheet** that takes up most of the screen.
3. **Layout Scaffolding:** Inside this modal, prepare a scrollable view with placeholders for three sections:
* Section A: "Your History"
* Section B: "Start from Template"
* Section C: "Start Empty Workout"

Here is the updated **Step 3** with the specific **Interaction** lines added to Sections A and B.


**Step 3: Sections Implementation (Data & Logic)**

1. **Section A (History):**
* Render a **Grid (2 columns, 1 row)**.
* Show the last 2 workouts (use mock data or fetch from `workout_logs`).
* **Logic:** If the history is empty, hide this entire section (title + cards).
* **Interaction:** On card tap, trigger a navigation event to the `ActiveWorkoutScreen` (placeholder), passing the specific history data to pre-fill the session.


2. **Section B (Templates):**
* Render a **Grid (3 columns, 1 row)**.
* Fetch data from the `workout_templates` table.
* Display the first 3 templates.
* **Interaction:** On card tap, trigger a navigation event to the `ActiveWorkoutScreen` (placeholder), passing the `template_id` so the session loads with the correct exercises.


3. **Section C (Exercise Selection):**
* Render the list of exercises (reuse the design from `LibraryScreen` if possible).
* **Selection State:** Implement a "Multi-select" logic.
* **Interaction:** Tapping an exercise highlights it and adds it to a `selectedExercises` array. Tapping again removes it.
* **Start Button:** Fix a "Start" button at the bottom of the modal.
* **Visibility:** The "Start" button should only appear (or be enabled) if `selectedExercises.length > 0`.
* **Action:** On "Start" click, navigate to the `ActiveWorkoutScreen` (placeholder), passing the list of `selectedExercises` in the order they were selected.

