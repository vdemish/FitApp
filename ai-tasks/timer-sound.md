Role: React Native Developer (Audio & Timer Logic)
Context: We are implementing a countdown audio cue for our timers. 
Asset: We have a specific sound file: `/assets/sounds/countdown.mp3`.
Audio Description: The file contains sounds for "Three, Two, One, Start!". It is exactly 4 seconds long. The sound is a mix of different sounds.

Task: Implement the timer logic that triggers this sound 3 seconds BEFORE the timer ends.

Requirements:
1. Scope of Applicability:
   - This logic must work for the **Rest Timer**.
   - It must ALSO work for active exercises with `tracking_type` = 'duration' (e.g., Plank) and 'distance_duration' (e.g., Running).

2. Playback Logic (Foreground):
   - Use `expo-av`.
   - Preload the sound on mount.
   - Inside your timer interval (tick), check: `if (timeLeft === 3) { sound.playAsync(); }`.
   - Ensure the audio session is set to `MixWithOthers` (do not stop user music).

3. Background Logic (System Notifications):
   - Use `expo-notifications`.
   - When the timer starts, schedule a notification for the exact end time (`Date.now() + duration * 1000`).
   - (Note: We rely on the system notification for background completion, as exact audio triggering at T-3s in background is unreliable in Expo).

4. Reusable Hook:
   - Create a custom hook `useWorkoutTimer({ duration, onComplete })`.
   - It should handle the countdown logic internally so we can reuse it across different screens (Rest Overlay vs Active Exercise Card).

Output:
- Code for the `useWorkoutTimer` hook.
- Logic for loading and playing the specific `/assets/sounds/countdown.mp3` at T-3s.