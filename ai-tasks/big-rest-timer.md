Role: Senior React Native Developer (UI/UX Focus)
Context: Active Workout Screen. Currently, the rest timer is too small and hard to read while working out.

Task: Implement a "Focus Mode" Rest Timer Overlay.

Requirements:
1. Trigger Logic:
   - When a user marks a set as "Completed", automatically trigger this new Focus Timer visibility.
   - It should NOT trigger if the user unchecks the box.

2. Component UI. Now we have @RestTimerCard.tsx:
   - Use a React Native `Modal` (transparent={true}) or an absolute positioned Overlay with high z-index.
   - Background: Semi-transparent dark overlay (use app's theme, do not hardcode colors) to hide the workout list and focus attention.
   - Timer: Massive, high-contrast font for the countdown (e.g., MM:SS in center).
   - Controls: Large, easy-to-tap buttons placed ergonomically:
     - "+30s" (Add time)
     - "-10s" (Subtract time)
     - "Skip" (Dismisses the timer immediately).

3. Tech Stack:
   - React Native (Expo)
   - NativeWind (Tailwind CSS) for styling.
   - Lucide Icons (or your current icon set) for button icons.

4. Props Interface:
   - `isVisible`: boolean
   - `secondsRemaining`: number
   - `onAddSeconds`: (seconds: number) => void
   - `onClose`: () => void

Output:
- Code for the timer component component.
- Example showing how to integrate it into `ActiveWorkoutScreen` state (handling the visibility toggle on set completion).