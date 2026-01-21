import { useState, useRef, useEffect, useCallback } from 'react';

type TimerMode = 'countdown' | 'stopwatch';

interface UseSetTimerProps {
    initialDuration?: number;
    onComplete?: () => void;
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

export function useSetTimer({ initialDuration = 0, onComplete }: UseSetTimerProps = {}): UseSetTimerReturn {
    const [isActive, setIsActive] = useState(false);
    const [elapsed, setElapsed] = useState(0); // Time elapsed since start
    const [startTime, setStartTime] = useState<number | null>(null);
    const [targetTime, setTargetTime] = useState(0); // For countdown
    const [mode, setMode] = useState<TimerMode>('stopwatch');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate remaining for countdown
    const remaining = Math.max(0, targetTime - elapsed);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
        setStartTime(null);
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

        // Use passed target time OR fallback to current state (which should be synced with prop)
        const effectiveTarget = newTargetTime !== undefined ? newTargetTime : targetTime;

        if (effectiveTarget > 0) {
            setMode('countdown');
            setTargetTime(effectiveTarget);
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
                // Ensure we hit exactly 0 remaining
                setElapsed(effectiveTarget);
                if (onComplete) onComplete();
            }
        }, 1000);

    }, [isActive, onComplete, stopTimer, targetTime]);

    // Sync state with prop if updated externally (and timer not running)
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
