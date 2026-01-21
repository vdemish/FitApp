import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { triggerTimerTick, triggerSuccess } from '@/utils/haptics';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface UseWorkoutTimerProps {
    /** Is the timer running? */
    isActive: boolean;
    /** Duration in seconds */
    duration: number;
    /** Callback when timer finishes */
    onComplete: () => void;
    /** Optional timestamp to sync with (e.g., from DB) */
    startTime?: number | null;
}

export function useWorkoutTimer({
    isActive,
    duration,
    onComplete,
    startTime
}: UseWorkoutTimerProps) {
    const [remainingTime, setRemainingTime] = useState(0);
    const soundRef = useRef<Audio.Sound | null>(null);
    const appState = useRef(AppState.currentState);
    const notificationId = useRef<string | null>(null);

    // Initial Load & Audio Setup
    useEffect(() => {
        async function setupAudio() {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: true,
                    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                    playThroughEarpieceAndroid: false,
                });

                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/sounds/countdown.mp3'),
                    { shouldPlay: false }
                );
                soundRef.current = sound;
            } catch (error) {
                console.error('Error loading sound:', error);
            }
        }

        setupAudio();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        if (!isActive) {
            setRemainingTime(0);
            cancelNotification();
            return;
        }

        const startTimestamp = startTime || Date.now();
        const endTimestamp = startTimestamp + (duration * 1000);

        // Schedule notification immediate when active
        scheduleNotification(duration);

        const updateTimer = async () => {
            const now = Date.now();
            const timeLeft = Math.max(0, Math.ceil((endTimestamp - now) / 1000));

            // Only update state if changed (optimization)
            setRemainingTime(prev => {
                if (prev !== timeLeft) {
                    handleTicks(timeLeft);
                    return timeLeft;
                }
                return prev;
            });

            if (timeLeft <= 0) {
                onComplete();
                cancelNotification();
            }
        };

        // Run immediately
        updateTimer();

        const interval = setInterval(updateTimer, 200); // Check more frequently for precision

        return () => {
            clearInterval(interval);
            cancelNotification();
        };
    }, [isActive, duration, startTime, onComplete]);

    // Handle Ticks & Sounds
    const lastTickRef = useRef<number>(-1);

    const handleTicks = useCallback(async (seconds: number) => {
        if (seconds === lastTickRef.current) return;
        lastTickRef.current = seconds;

        // Sound at T-3s
        if (seconds === 3 && soundRef.current) {
            try {
                // Replay from start if already played
                await soundRef.current.setPositionAsync(0);
                await soundRef.current.playAsync();
            } catch (error) {
                console.log('Error playing sound', error);
            }
        }

        // Haptics
        if (seconds <= 5 && seconds > 0) {
            triggerTimerTick();
        } else if (seconds === 0) {
            triggerSuccess();
        }
    }, []);

    // Notifications Helpers
    const scheduleNotification = async (seconds: number) => {
        // Prevent duplicates
        if (notificationId.current) return;

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Timer Complete",
                    body: "Time to get back to work!",
                    sound: true,
                },
                trigger: {
                    seconds: seconds,
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
                },
            });
            notificationId.current = id;
        } catch (e) {
            console.log("Failed to schedule notification", e);
        }
    };

    const cancelNotification = async () => {
        if (notificationId.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationId.current);
            notificationId.current = null;
        }
    };

    return { remainingTime };
}
