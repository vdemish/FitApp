Role: Senior React Native Developer
Context: Active Workout Screen. Users find it tedious to enter the same weight/reps for multiple sets.

Task: Implement "Waterfall Auto-fill" logic for Weight and Reps inputs.

Requirements:
1. Logic Definition:
   - When a user finishes editing (triggers `onBlur`) a specific field (Weight or Reps) in Set N:
   - Automatically update the same field in all *subsequent* sets (N+1, N+2, etc.) belonging to the current exercise.
   - Do NOT affect preceding sets (0 to N-1).

2. Behavior Example:
   - Given: 4 Sets, all initialized to 0kg.
   - User updates Set 1 to "20kg" -> Logic updates Sets 2, 3, and 4 to "20kg".
   - User then updates Set 2 to "25kg" -> Logic updates Sets 3 and 4 to "25kg". (Set 1 remains 20kg).

3. Technical Implementation:
   - Modify the `SetRow` component to accept an `onBlur` prop for weight and reps.
   - In the Parent Component (where state is managed), create a handler function (e.g., `handleAutoFill(index, field, value)`).
   - Ensure the state update is immutable.
   - IMPORTANT: Only trigger this logic if the new value is greater than 0 (to avoid wiping out data if the user accidentally clears a field).

4. Output:
   - Code for the `handleAutoFill` function in the Parent Component.
   - Interface updates for `SetRow` props.
   - Usage example in the list rendering.