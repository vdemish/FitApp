## Goal

Implement a “timer finished” audible cue in an Expo (managed) React Native app using `expo-notifications`, such that:

* When the app is **backgrounded or the phone is locked**, the user hears a **custom sound** at the timer end.
* You **do not show a banner** (as much as iOS allows).
* The cue **should not stop** other audio (e.g., Spotify). Ideally it should “mix” (may briefly duck; iOS does not give full control for notification sounds).

---

## Non-negotiable iOS constraints (must be reflected in the solution)

1. **Background/locked playback without “Background Audio” mode is reliably achievable only via a notification sound.**
   JS timers and in-app audio are not reliable in the background on iOS unless the app legitimately uses Background Audio.

2. **iOS does not provide a true “sound-only notification with zero UI footprint.”**
   You can minimize presentation (no banner, no visible content), but the system may still create a Notification Center entry (often just the app name).

3. **Mixing with Spotify:**

   * **In-app sound (foreground)** can be configured to mix with other audio via `expo-av` audio mode.
   * **Notification sound (background)** is controlled by iOS; it typically plays over other audio but may duck it briefly. You cannot fully control that behavior.

Given the constraints, the recommended design is:

* **Foreground:** play the sound yourself (no banner, no notification UI), configured to mix with other audio.
* **Background/Locked:** schedule a local notification with the custom sound (minimize UI content).

---

## High-level architecture

### Source of truth

Use an absolute timestamp:

* `endAtMs` (Unix ms) as the single source of truth for when the interval ends.

Do not rely on “tick counters” in JS for correctness.

### Persisted timer state

Persist a small struct (AsyncStorage, SQLite, etc.) so you can recover after app restarts:

* `status`: `"running" | "paused" | "stopped"`
* `phase`: `"work" | "rest"` (or your domain phases)
* `endAtMs`: number | null
* `remainingMs`: number | null (only meaningful when paused)
* `scheduledNotificationId`: string | null

---

## State machine (events → transitions → side effects)

### Event: START(durationMs, phase)

**Transition:**

* `status = "running"`
* `phase = phase`
* `endAtMs = now + durationMs`
* `remainingMs = null`

**Side effects:**

* Cancel any existing scheduled notification (if `scheduledNotificationId` exists).
* Schedule a **local notification** for `endAtMs` using the custom sound. Store returned `scheduledNotificationId`.
* UI countdown is derived from `endAtMs - now` and is for display only.

### Event: PAUSE

**Transition:**

* `status = "paused"`
* `remainingMs = max(0, endAtMs - now)`
* `endAtMs = null`

**Side effects:**

* Cancel scheduled notification by `scheduledNotificationId`.
* `scheduledNotificationId = null`

### Event: RESUME

**Transition:**

* `status = "running"`
* `endAtMs = now + remainingMs`
* `remainingMs = null`

**Side effects:**

* Schedule new local notification at new `endAtMs`, store new `scheduledNotificationId`.

### Event: STOP / CANCEL

**Transition:**

* `status = "stopped"`
* `endAtMs = null`
* `remainingMs = null`

**Side effects:**

* Cancel scheduled notification if present.
* Clear `scheduledNotificationId`.

### Event: APP_BECOMES_ACTIVE (rehydration / resume)

This runs whenever app comes to foreground or on cold start.

**Logic:**

* Load persisted state.
* If `status === "running"` and `endAtMs` exists:

  * `remaining = endAtMs - now`
  * If `remaining <= 0`: treat as “finished”.

    * Move state to next phase or `stopped` depending on product logic.
    * Ensure scheduled notification is cleared (it should have fired already, but cleanup anyway).
    * If you want an immediate cue on re-entry (optional), you may play the sound once, but be careful not to double-play if the notification already sounded.

---

## Notifications configuration (Expo managed)

### 1) Add custom notification sound to the iOS build

You have `assets/countdown.wav`. Ensure it is embedded in the iOS app bundle for notification use.

**Task:**

* Update `app.json` / `app.config.js` to configure `expo-notifications` plugin with the sound file.
* The config should reference the asset and ensure it is copied into the iOS project during prebuild.

**Acceptance criteria:**

* In a dev build / TestFlight build (not Expo Go), scheduling a local notification with `sound: "countdown.wav"` actually plays that sound.

### 2) Request notification permissions at the right time

**Task:**

* On first use of timer feature (or onboarding), request notification permission.
* If denied, show an in-app explanation: background/locked sound requires notifications enabled.

### 3) Minimize UI (“no banner”)

**Foreground:**

* Use `Notifications.setNotificationHandler` to return:

  * `shouldShowAlert: false`
  * `shouldPlaySound: false` (because you’ll play the sound yourself via `expo-av`)
  * `shouldSetBadge: false`

**Background/Locked:**

* iOS decides presentation. To reduce visible content:

  * Schedule the notification with an empty/minimal `title`/`body` (e.g., empty string or a single whitespace if required).
  * Do not rely on this to eliminate the Notification Center entry; it only minimizes user-facing content.

---

## Foreground sound playback (to ensure mixing with Spotify)

Because you don’t want banners and you want mixing behavior, do **not** rely on notification sound while app is active. Instead:

**Task:**

* Use `expo-av` to play `assets/countdown.wav` when the timer ends *while the app is in the foreground*.
* Configure `Audio.setAudioModeAsync` with mixing enabled:

  * iOS: `interruptionModeIOS: MixWithOthers` (or equivalent)
  * `playsInSilentModeIOS`: decide based on product requirement (most timers should respect silent; fitness timers vary)
  * Avoid taking audio focus that stops other apps.

**Acceptance criteria:**

* With Spotify playing, and your app in foreground, timer end plays your cue without stopping Spotify (it may slightly duck; but must not pause/stop).

---

## Background/locked behavior (notification scheduling)

**Task:**

* When starting/resuming a timer, schedule exactly one local notification for `endAtMs`.
* Use the custom sound:

  * `sound: "countdown.wav"` (name must match what iOS sees in the bundle)
* Store `scheduledNotificationId` and always cancel it on pause/stop/restart.

**Acceptance criteria:**

* With the phone locked and Spotify playing, the cue plays at the correct time. Spotify should not be stopped (ducking is acceptable, stopping is not).

---

## Testing checklist (must do in a real build)

1. Build a **development build** (or TestFlight). Do not test this in Expo Go.
2. Validate:

   * Foreground: no banner; cue plays and mixes with Spotify.
   * Background (unlocked): cue plays at end time.
   * Locked screen: cue plays at end time.
   * Pause/Resume: no “ghost” cues after pausing.
   * Restart app mid-timer: state rehydrates; UI shows correct remaining time; cue still happens (notification scheduled).
3. Validate sound file compatibility:

   * If `.wav` doesn’t play as a notification sound on a device, convert to `.caf` or `.aiff` and re-embed, then retest.

---

## Deliverables for Codex agent

1. Implement the timer state store (`endAtMs`, `remainingMs`, `scheduledNotificationId`) and the state machine events above.
2. Configure `expo-notifications` plugin to embed `/assets/countdown.wav`.
3. Add permission request + “notifications disabled” UX fallback.
4. Add `Notifications.setNotificationHandler` to suppress alerts in foreground.
5. Implement foreground cue via `expo-av` with mixing-friendly audio mode.
6. Implement scheduling/canceling local notifications on START/PAUSE/RESUME/STOP.
7. Add an end-to-end manual test script (steps) for QA on iOS device.

