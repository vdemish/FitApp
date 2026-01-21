Context: Active Workout Screen. We are improving the UX for data entry to make it faster and easier during workouts.

Task: Refactor the input mechanism to replace "Wheel/Picker" inputs with direct keyboard text inputs.

Problem: The current `WheelInput` is too slow for changing values significantly (e.g., jumping from 20kg to 60kg) and difficult to use with sweaty or shaky hands.

Requirements:
1. Remove `WheelInput`: Completely remove the usage of wheel/picker components for data entry.

2. Implement Numeric Text Inputs:
   - Replace the old inputs with standard text input fields for different exercise types.
   - Ensure the correct keyboard type is used (numeric or decimal pad) for each metric.

3. "Select All on Focus" Behavior (Critical):
   - Configure the inputs so that when a user taps a field, the existing value is automatically selected/highlighted.
   - The UX goal is that typing a new number should immediately overwrite the old value. The user should NOT have to manually backspace or delete the previous number.

4. General:
   - Ensure this logic applies consistently across all the metric types mentioned above.