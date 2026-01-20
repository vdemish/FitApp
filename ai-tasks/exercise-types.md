Context: We need to render the Set Input Row dynamically based on the exercise type.

Task: Refactor the `SetRow` component in the `ActiveWorkoutScreen`.

Requirements:
1. Logic:
   - Receive the `exercise` object (specifically its `tracking_type`) as a prop.
   - Use the helper function (from Step 2) to determine which input fields to render.

2. Visuals (Tailwind/NativeWind):
   - Case 'weight_reps': Show standard Weight and Reps inputs.
   - Case 'weighted_bodyweight': Show Weight input with a placeholder "+0" (indicating added weight) and Reps input.
   - Case 'duration': Hide Weight/Reps. Show a Time Input (MM:SS) that saves as total seconds.
   - Case 'distance_duration': Show Distance input (km/mi) and Time Input.

3. Time Input Logic:
   - Since we store duration as seconds, create a small utility or component to mask the input as "MM:SS" for user friendliness, but convert to integers for the state.

Output:
- The code for the refactored `SetRow` component handling these conditional renders.