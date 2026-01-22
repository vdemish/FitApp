## Timer Sound QA Checklist (iOS Device)

Pre-reqs:
- Use a development build or TestFlight build (not Expo Go).
- Ensure notification permission is granted in iOS Settings.
- Have Spotify (or Apple Music) playing.

Steps:
1. Launch app and start a rest timer.
2. Stay in foreground until timer ends.
3. Confirm:
   - No banner or alert appears.
   - Countdown sound plays at timer end.
   - Spotify continues playing (may duck briefly).
4. Start another rest timer and send app to background (home button).
5. Confirm notification sound plays at end time.
6. Lock the phone and start another rest timer.
7. Confirm notification sound plays at end time on the lock screen.
8. Start a timer and immediately pause/skip it.
9. Confirm no sound plays after pause/skip.
10. Start a timer, force-quit the app, then reopen.
11. Confirm timer UI rehydrates with remaining time and sound plays at end.
