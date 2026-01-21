Role: Senior React Native Developer
Context: Active Workout Screen -> SetRow Component.
Task: Implement interactive Timer Logic for exercises of type `duration` and `distance_duration`.

Current Behavior: The SetRow currently only handles simple data entry.
New Behavior: For duration-based exercises, the SetRow must function as an active timer/tracker.

Requirements:

1. UI/UX Conditionals:
   - If the exercise type is `duration` or `distance_duration`, hide the standard Checkbox. The "Finish" button will act as the completion trigger.
   - Display a "Start" button initially.
   - Display a "Finish" button while the timer is running.
   - Display an input field for the "Target Time" (duration).
   - For `distance_duration` type ONLY: Display an additional independent input field for Distance. This can be edited at any time (before, during, or after) and is saved when the set is completed.

2. Timer Logic - "Start" Action:
   - When user clicks "Start", check the "Target Time" input:
     - Case A (Target Time is set): Start a COUNTDOWN timer (Target Time -> 0).
     - Case B (Target Time is empty/zero): Start a STOPWATCH timer (0 -> Infinity).

3. Timer Logic - "Finish" / Completion Action:
   - Case A (Countdown):
     - If the timer reaches 0 naturally: Mark set as complete. Logged Time = Target Time.
     - If user clicks "Finish" early: Mark set as complete. Logged Time = (Target Time - Remaining Time).
   - Case B (Stopwatch):
     - User clicks "Finish": Mark set as complete. Logged Time = Elapsed Time.

4. Data Persistence:
   - When the set marks as complete (via "Finish" button or timer reaching 0), update the parent state with the final `time` and `distance` (if applicable) values.
   - Ensure the SetRow creates a visually distinct state when the timer is active vs inactive.

5. Technical Constraints:
   - Use `useEffect` or a custom hook to manage the interval.
   - Ensure the timer interval is cleared properly on unmount or completion.
   - Do not style the components yet, focus on the functional implementation of the logic described above.