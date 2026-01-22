import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, Linking, type AlertButton } from 'react-native';
import { triggerTimerTick, triggerSuccess } from '@/utils/haptics';
import { playCountdownSound, prepareCountdownSound } from '@/services/SoundService';
import {
    cancelTimerNotifications,
    scheduleTimerNotifications,
} from '@/services/TimerNotificationService';
import { updateRestTimerState } from '@/services/TimerStateStore';
import { TIMER_SOUND_LEAD_SECONDS } from '@/constants/timer';
import { useSettings } from '@/context/SettingsContext';

interface UseWorkoutTimerProps {
    /** Is the timer running? */
    isActive: boolean;
    /** Duration in seconds */
    duration: number;
    /** Callback when timer finishes */
    onComplete: () => void;
    /** Optional timestamp to sync with (e.g., from DB) */
    startTime?: number | null;
    /** Optional label for notifications */
    label?: string;
}

export function useWorkoutTimer({
    isActive,
    duration,
    onComplete,
    startTime,
    label,
}: UseWorkoutTimerProps) {
    const [remainingTime, setRemainingTime] = useState(0);
    const notificationIds = useRef<string[]>([]);
    const permissionPromptedRef = useRef(false);
    const endSoundPlayedRef = useRef(false);
    const { restTimerSounds } = useSettings();

    useEffect(() => {
        prepareCountdownSound();
    }, []);

    const cancelNotifications = useCallback(async () => {
        if (notificationIds.current.length === 0) return;
        await cancelTimerNotifications(notificationIds.current);
        notificationIds.current = [];
        updateRestTimerState({ scheduledNotificationIds: [] });
    }, []);

    const scheduleNotifications = useCallback(
        async (startTimestamp: number, durationSeconds: number) => {
            await cancelNotifications();
            const result = await scheduleTimerNotifications({
                startTimeMs: startTimestamp,
                durationSeconds,
                label,
                soundEnabled: restTimerSounds,
            });
            notificationIds.current = result.ids;
            updateRestTimerState({ scheduledNotificationIds: result.ids });

            if (!result.granted && !permissionPromptedRef.current) {
                permissionPromptedRef.current = true;
                const actions: AlertButton[] = result.canAskAgain
                    ? [{ text: 'OK' }]
                    : [
                        { text: 'Cancel', style: 'cancel' as const },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ];

                Alert.alert(
                    'Notifications Disabled',
                    'Enable notifications to hear timer sounds while the app is in the background or locked.',
                    actions
                );
            }
        },
        [cancelNotifications, label, restTimerSounds]
    );

    // Timer Logic
    useEffect(() => {
        if (!isActive) {
            setRemainingTime(0);
            cancelNotifications();
            endSoundPlayedRef.current = false;
            return;
        }

        const startTimestamp = startTime || Date.now();
        const endTimestamp = startTimestamp + (duration * 1000);
        endSoundPlayedRef.current = false;

        // Schedule notification immediately when active
        scheduleNotifications(startTimestamp, duration);

        const updateTimer = async () => {
            const now = Date.now();
            const timeLeft = Math.max(0, Math.ceil((endTimestamp - now) / 1000));
            const shouldPlayLeadSound =
                !endSoundPlayedRef.current &&
                AppState.currentState === 'active' &&
                restTimerSounds &&
                endTimestamp - now <= TIMER_SOUND_LEAD_SECONDS * 1000 &&
                endTimestamp - now > 0;

            if (shouldPlayLeadSound) {
                endSoundPlayedRef.current = true;
                await playCountdownSound();
            }

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
                cancelNotifications();
            }
        };

        // Run immediately
        updateTimer();

        const interval = setInterval(updateTimer, 200); // Check more frequently for precision

        return () => {
            clearInterval(interval);
            cancelNotifications();
        };
    }, [
        isActive,
        duration,
        startTime,
        onComplete,
        scheduleNotifications,
        cancelNotifications,
        restTimerSounds,
    ]);

    // Handle Ticks & Haptics
    const lastTickRef = useRef<number>(-1);

    const handleTicks = useCallback((seconds: number) => {
        if (seconds === lastTickRef.current) return;
        lastTickRef.current = seconds;

        if (seconds <= 5 && seconds > 0) {
            triggerTimerTick();
        } else if (seconds === 0) {
            triggerSuccess();
        }
    }, []);

    return { remainingTime };
}
