**Task:**
I need to implement Haptic Feedback throughout the app to improve the user experience.
Please use the `expo-haptics` library.

**Requirements:**

1. **Library Setup:** Ensure `expo-haptics` is used.
2. **Haptic Utility:** Create a reusable utility file (e.g., `utils/haptics.ts`) with functions for different feedback types:
* `triggerLight()`: For standard button presses.
* `triggerSelection()`: For toggling checkboxes or selection changes.
* `triggerTimerTick()`: Distinct tick for countdowns.
* `triggerSuccess()`: Strong vibration for completion.


3. **UI Integration:**
* Apply `triggerLight()` or `triggerSelection()` to the existing Checkboxes (Set completion) and main Buttons.


4. **Timer Logic (Crucial):**
* Update the **Rest Timer** component logic.
* **Countdown Sequence:** When the timer reaches the last 5 seconds (5, 4, 3, 2, 1), trigger a "Tick" haptic feedback (`Haptics.selectionAsync()` or similar) exactly once per second.
* **Completion:** When the timer hits 0 (End), trigger a "Success/Notification" haptic (`Haptics.notificationAsync` or a heavier impact).



**Output:**

1. The `utils/haptics.ts` file code.
2. Example code showing how to integrate the countdown logic inside the Timer's `useEffect` or interval loop to ensure it doesn't vibrate multiple times unnecessarily.
