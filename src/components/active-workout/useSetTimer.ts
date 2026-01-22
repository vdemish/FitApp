import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert, AppState, Linking, type AlertButton } from 'react-native';
import { playCountdownSound, prepareCountdownSound } from '@/services/SoundService';
import {
    cancelTimerNotifications,
    scheduleTimerNotifications,
} from '@/services/TimerNotificationService';
import { TIMER_SOUND_LEAD_SECONDS } from '@/constants/timer';
import { useSettings } from '@/context/SettingsContext';

type TimerMode = 'countdown' | 'stopwatch';

interface UseSetTimerProps {
    initialDuration?: number;
    onComplete?: () => void;
    label?: string;
}

interface UseSetTimerReturn {
    isActive: boolean;
    elapsed: number;
    remaining: number;
    mode: TimerMode;
    toggleTimer: (targetTime?: number) => void;
    stopTimer: () => void;
    finishTimer: () => number; // Returns total logged time
}

export function useSetTimer({
    initialDuration = 0,
    onComplete,
    label,
}: UseSetTimerProps = {}): UseSetTimerReturn {
    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(0); // Time elapsed since start
    const [startTime, setStartTime] = useState<number | null>(null);
    const [targetTime, setTargetTime] = useState(0); // For countdown
    const [mode, setMode] = useState<TimerMode>('stopwatch');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const notificationIds = useRef<string[]>([]);
    const permissionPromptedRef = useRef(false);
    const endSoundPlayedRef = useRef(false);
    const { restTimerSounds } = useSettings();

    // Calculate remaining for countdown
    const remaining = Math.max(0, targetTime - elapsed);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
        setStartTime(null);
        cancelTimerNotifications(notificationIds.current);
        notificationIds.current = [];
        endSoundPlayedRef.current = false;
    }, []);

    const finishTimer = useCallback(() => {
        stopTimer();

        let loggedTime = 0;
        if (mode === 'countdown') {
            // In countdown:
            // If remaining > 0 (finished early): Logged = Target - Remaining = Elapsed
            // If remaining == 0 (finished naturally): Logged = Target
            // Simplified: Logged time is effectively the elapsed time, capped at target
            loggedTime = Math.min(elapsed, targetTime);
        } else {
            // In stopwatch: Logged = Elapsed
            loggedTime = elapsed;
        }

        return loggedTime;
    }, [elapsed, mode, targetTime, stopTimer]);


    const toggleTimer = useCallback((newTargetTime?: number) => {
        if (isActive) {
            stopTimer(); // Pause behavior if needed, currently just stops
            return;
        }

        const now = Date.now();
        setStartTime(now);
        setIsActive(true);
        setElapsed(0); // Reset elapsed on new start
        endSoundPlayedRef.current = false;

        // Use passed target time OR fallback to current state (which should be synced with prop)
        const effectiveTarget = newTargetTime !== undefined ? newTargetTime : targetTime;

        if (effectiveTarget > 0) {
            setMode('countdown');
            setTargetTime(effectiveTarget);
            scheduleTimerNotifications({
                startTimeMs: now,
                durationSeconds: effectiveTarget,
                label,
                soundEnabled: restTimerSounds,
            }).then((result) => {
                notificationIds.current = result.ids;
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
            });
        } else {
            setMode('stopwatch');
            setTargetTime(0);
        }

        // Start interval
        intervalRef.current = setInterval(() => {
            const currentElapsed = Math.floor((Date.now() - now) / 1000);
            setElapsed(currentElapsed);

            // Auto-stop for countdown
            if (effectiveTarget > 0 && currentElapsed >= effectiveTarget) {
                // Timer reached 0
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsActive(false);
                cancelTimerNotifications(notificationIds.current);
                notificationIds.current = [];
                // Ensure we hit exactly 0 remaining
                setElapsed(effectiveTarget);
                if (onComplete) onComplete();
                return;
            }

            if (
                !endSoundPlayedRef.current &&
                effectiveTarget > 0 &&
                AppState.currentState === 'active' &&
                restTimerSounds
            ) {
                const remainingSeconds = effectiveTarget - currentElapsed;
                if (remainingSeconds <= TIMER_SOUND_LEAD_SECONDS && remainingSeconds > 0) {
                    endSoundPlayedRef.current = true;
                    playCountdownSound();
                }
            }
        }, 1000);

    }, [isActive, onComplete, stopTimer, targetTime, label, restTimerSounds]);

    // Sync state with prop if updated externally (and timer not running)
    useEffect(() => {
        prepareCountdownSound();
    }, []);

    useEffect(() => {
        if (!isActive && initialDuration !== undefined) {
            setTargetTime(initialDuration);
        }
    }, [initialDuration, isActive]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (notificationIds.current.length > 0) {
                cancelTimerNotifications(notificationIds.current);
                notificationIds.current = [];
            }
        };
    }, []);

    return {
        isActive,
        elapsed,
        remaining,
        mode,
        toggleTimer,
        stopTimer,
        finishTimer
    };
}
