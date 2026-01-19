/**
 * ============================================================================
 * useActiveWorkout Hook
 * ============================================================================
 * Hook for managing active workout with optimistic UI updates
 * Uses hybrid approach: Local state for immediate UI + Debounced API calls
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Workout, WorkoutExercise, Set as WorkoutSet, SetStatus, Exercise } from '@/types';
import * as workoutService from '@/services/workoutService';
import type { SetData } from '@/components/active-workout';

// ============================================================================
// TYPES
// ============================================================================

/** Timer state for rest timer integration */
export interface TimerState {
    /** Whether timer should be active */
    isActive: boolean;
    /** Timestamp when last set was completed */
    lastCompletedSetTimestamp: number | null;
    /** ID of the workout exercise that triggered the timer */
    exerciseId: string | null;
    /** Default rest time in seconds */
    restSeconds: number;
}

/** Structure for UI-friendly exercise with sets */
export interface ActiveExercise {
    id: string;
    workoutExerciseId: string;
    name: string;
    icon: string;
    restSeconds: number;
    sets: SetData[];
}

/** Hook return type */
export interface UseActiveWorkoutReturn {
    /** Current workout state */
    workout: Workout | null;
    /** UI-friendly exercises list */
    exercises: ActiveExercise[];
    /** Loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Timer state for rest timer */
    timerState: TimerState;
    /** Action methods */
    actions: {
        /** Update a set's weight or reps (debounced save) */
        updateSet: (setId: string, field: 'weight' | 'reps', value: number) => void;
        /** Toggle set completion (immediate save) */
        toggleSetComplete: (setId: string) => void;
        /** Add a new set to an exercise */
        addSet: (workoutExerciseId: string) => Promise<void>;
        /** Remove a set */
        removeSet: (setId: string) => Promise<void>;
        /** Add an exercise to the workout */
        addExercise: (exerciseId: string) => Promise<void>;
        /** Remove an exercise from the workout */
        removeExercise: (workoutExerciseId: string) => Promise<void>;
        /** Dismiss the rest timer */
        dismissTimer: () => void;
        /** Add time to the rest timer */
        addRestTime: (seconds: number) => void;
        /** Start a new workout */
        startWorkout: (name: string, templateId?: string) => Promise<void>;
        /** Finish the current workout */
        finishWorkout: () => Promise<void>;
        /** Cancel the current workout */
        cancelWorkout: () => Promise<void>;
        /** Refetch workout data */
        refetch: () => Promise<void>;
    };
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Creates a debounced function that delays invoking func until after wait ms
 * have elapsed since the last time the debounced function was invoked.
 */
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): {
    (...args: Parameters<T>): void;
    cancel: () => void;
    flush: () => void;
} {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = (...args: Parameters<T>) => {
        lastArgs = args;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            if (lastArgs) {
                func(...lastArgs);
            }
            timeoutId = null;
            lastArgs = null;
        }, wait);
    };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
            lastArgs = null;
        }
    };

    debounced.flush = () => {
        if (timeoutId && lastArgs) {
            clearTimeout(timeoutId);
            func(...lastArgs);
            timeoutId = null;
            lastArgs = null;
        }
    };

    return debounced;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforms Workout structure to UI-friendly ActiveExercise array
 */
function transformToActiveExercises(workout: Workout | null): ActiveExercise[] {
    if (!workout?.exercises) return [];

    return workout.exercises.map((we: WorkoutExercise) => ({
        id: we.exercise?.id || we.exercise_id,
        workoutExerciseId: we.id,
        name: we.exercise?.name || 'Unknown Exercise',
        icon: we.exercise?.icon || 'fitness_center',
        restSeconds: we.rest_seconds,
        sets: (we.sets || []).map((set: WorkoutSet) => ({
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            isCompleted: set.status === 'completed',
            previousBest: undefined, // TODO: Load from exercise history
        })),
    }));
}

/**
 * Generates a temporary ID for optimistic updates
 */
function generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useActiveWorkout(
    initialWorkoutId?: string,
    templateId?: string,
    initialExercises?: Exercise[]
): UseActiveWorkoutReturn {
    // State
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timerState, setTimerState] = useState<TimerState>({
        isActive: false,
        lastCompletedSetTimestamp: null,
        exerciseId: null,
        restSeconds: 90,
    });

    // Refs for debounced functions
    const pendingUpdates = useRef<Map<string, Partial<{ weight: number; reps: number }>>>(
        new Map()
    );
    const previousWorkoutState = useRef<Workout | null>(null);

    // Create debounced save function
    const debouncedSaveSet = useMemo(
        () =>
            debounce(async (setId: string, updates: Partial<{ weight: number; reps: number }>) => {
                try {
                    await workoutService.updateSet(setId, updates);
                    pendingUpdates.current.delete(setId);
                } catch (err) {
                    console.error('[useActiveWorkout] Failed to save set:', err);
                    // Revert to previous state on error
                    if (previousWorkoutState.current) {
                        setWorkout(previousWorkoutState.current);
                    }
                    setError(err instanceof Error ? err.message : 'Failed to save changes');
                }
            }, 500),
        []
    );

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedSaveSet.flush();
        };
    }, [debouncedSaveSet]);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    const fetchActiveWorkout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const activeWorkout = await workoutService.getActiveWorkout();
            setWorkout(activeWorkout);
            previousWorkoutState.current = activeWorkout;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load workout';
            setError(message);
            console.error('[useActiveWorkout] Error fetching workout:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchActiveWorkout();
    }, [fetchActiveWorkout]);

    // Create workout if needed
    useEffect(() => {
        // Only run if not loading and no workout exists
        if (isLoading || workout) return;

        const initWorkout = async () => {
            try {
                setIsLoading(true);
                let newWorkout: Workout | null = null;

                if (initialExercises && initialExercises.length > 0) {
                    console.log('[useActiveWorkout] Creating from exercises:', initialExercises.length);
                    newWorkout = await workoutService.createWorkoutFromExercises(initialExercises);
                } else if (templateId) {
                    console.log('[useActiveWorkout] Creating from template:', templateId);
                    newWorkout = await workoutService.createWorkoutFromTemplate(templateId);
                }

                if (newWorkout) {
                    setWorkout(newWorkout);
                    previousWorkoutState.current = newWorkout;
                }
            } catch (err) {
                console.error('[useActiveWorkout] Failed to create workout:', err);
                setError(err instanceof Error ? err.message : 'Failed to create workout');
            } finally {
                setIsLoading(false);
            }
        };

        // Only run if we actually have params to create from
        if (initialExercises?.length || templateId) {
            initWorkout();
        }
    }, [isLoading, workout, templateId, initialExercises]);

    // ========================================================================
    // SET OPERATIONS
    // ========================================================================

    const updateSet = useCallback(
        (setId: string, field: 'weight' | 'reps', value: number) => {
            // Store previous state for rollback
            previousWorkoutState.current = workout;

            // Optimistic update
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.map((we) => ({
                        ...we,
                        sets: we.sets?.map((set) =>
                            set.id === setId ? { ...set, [field]: value } : set
                        ),
                    })),
                };
            });

            // Accumulate pending updates for this set
            const existing = pendingUpdates.current.get(setId) || {};
            pendingUpdates.current.set(setId, { ...existing, [field]: value });

            // Debounced save
            debouncedSaveSet(setId, pendingUpdates.current.get(setId)!);
        },
        [workout, debouncedSaveSet]
    );

    const toggleSetComplete = useCallback(
        async (setId: string) => {
            if (!workout?.exercises) return;

            // Find the set and its exercise
            let targetSet: WorkoutSet | undefined;
            let targetExercise: WorkoutExercise | undefined;

            for (const we of workout.exercises) {
                const foundSet = we.sets?.find((s) => s.id === setId);
                if (foundSet) {
                    targetSet = foundSet;
                    targetExercise = we;
                    break;
                }
            }

            if (!targetSet || !targetExercise) return;

            const newStatus: SetStatus =
                targetSet.status === 'completed' ? 'pending' : 'completed';
            const isCompleting = newStatus === 'completed';

            // Optimistic update
            previousWorkoutState.current = workout;
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.map((we) => ({
                        ...we,
                        sets: we.sets?.map((set) =>
                            set.id === setId
                                ? {
                                    ...set,
                                    status: newStatus,
                                    completed_at: isCompleting
                                        ? new Date().toISOString()
                                        : null,
                                }
                                : set
                        ),
                    })),
                };
            });

            // Trigger rest timer if completing a set
            if (isCompleting) {
                setTimerState({
                    isActive: true,
                    lastCompletedSetTimestamp: Date.now(),
                    exerciseId: targetExercise.id,
                    restSeconds: targetExercise.rest_seconds,
                });
            }

            // Immediate API call (no debounce)
            try {
                if (isCompleting) {
                    await workoutService.completeSet(
                        setId,
                        targetSet.weight,
                        targetSet.reps
                    );
                } else {
                    await workoutService.updateSet(setId, { status: 'pending' });
                }
            } catch (err) {
                console.error('[useActiveWorkout] Failed to toggle set:', err);
                // Revert on error
                if (previousWorkoutState.current) {
                    setWorkout(previousWorkoutState.current);
                }
                setError(err instanceof Error ? err.message : 'Failed to update set');
            }
        },
        [workout]
    );

    const addSet = useCallback(
        async (workoutExerciseId: string) => {
            if (!workout?.exercises) return;

            const workoutExercise = workout.exercises.find(
                (we) => we.id === workoutExerciseId
            );
            if (!workoutExercise) return;

            const existingSets = workoutExercise.sets || [];
            const lastSet = existingSets[existingSets.length - 1];
            const setNumber = existingSets.length + 1;
            const defaultWeight = lastSet?.weight || 0;
            const defaultReps = lastSet?.reps || 10;

            // Create optimistic set
            const tempId = generateTempId();
            const optimisticSet: WorkoutSet = {
                id: tempId,
                workout_exercise_id: workoutExerciseId,
                set_number: setNumber,
                weight: defaultWeight,
                reps: defaultReps,
                is_warmup: false,
                is_dropset: false,
                status: 'pending',
                completed_at: null,
                notes: null,
            };

            // Optimistic update
            previousWorkoutState.current = workout;
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.map((we) =>
                        we.id === workoutExerciseId
                            ? { ...we, sets: [...(we.sets || []), optimisticSet] }
                            : we
                    ),
                };
            });

            // API call
            try {
                const newSet = await workoutService.addSet(
                    workoutExerciseId,
                    defaultWeight,
                    defaultReps,
                    setNumber
                );

                // Replace temp ID with real ID
                setWorkout((prev) => {
                    if (!prev?.exercises) return prev;

                    return {
                        ...prev,
                        exercises: prev.exercises.map((we) =>
                            we.id === workoutExerciseId
                                ? {
                                    ...we,
                                    sets: we.sets?.map((s) =>
                                        s.id === tempId ? newSet : s
                                    ),
                                }
                                : we
                        ),
                    };
                });
            } catch (err) {
                console.error('[useActiveWorkout] Failed to add set:', err);
                // Revert on error
                if (previousWorkoutState.current) {
                    setWorkout(previousWorkoutState.current);
                }
                setError(err instanceof Error ? err.message : 'Failed to add set');
            }
        },
        [workout]
    );

    const removeSet = useCallback(
        async (setId: string) => {
            if (!workout?.exercises) return;

            // Optimistic update
            previousWorkoutState.current = workout;
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.map((we) => ({
                        ...we,
                        sets: we.sets?.filter((s) => s.id !== setId),
                    })),
                };
            });

            // API call
            try {
                await workoutService.deleteSet(setId);
            } catch (err) {
                console.error('[useActiveWorkout] Failed to remove set:', err);
                if (previousWorkoutState.current) {
                    setWorkout(previousWorkoutState.current);
                }
                setError(err instanceof Error ? err.message : 'Failed to remove set');
            }
        },
        [workout]
    );

    // ========================================================================
    // EXERCISE OPERATIONS
    // ========================================================================

    const addExercise = useCallback(
        async (exerciseId: string) => {
            if (!workout) return;

            try {
                const workoutExercise = await workoutService.addExerciseToWorkout(
                    workout.id,
                    exerciseId
                );

                setWorkout((prev) =>
                    prev
                        ? {
                            ...prev,
                            exercises: [...(prev.exercises || []), workoutExercise],
                        }
                        : null
                );
            } catch (err) {
                console.error('[useActiveWorkout] Failed to add exercise:', err);
                setError(err instanceof Error ? err.message : 'Failed to add exercise');
            }
        },
        [workout]
    );

    const removeExercise = useCallback(
        async (workoutExerciseId: string) => {
            if (!workout?.exercises) return;

            // Optimistic update
            previousWorkoutState.current = workout;
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.filter((we) => we.id !== workoutExerciseId),
                };
            });

            try {
                await workoutService.removeExerciseFromWorkout(workoutExerciseId);
            } catch (err) {
                console.error('[useActiveWorkout] Failed to remove exercise:', err);
                if (previousWorkoutState.current) {
                    setWorkout(previousWorkoutState.current);
                }
                setError(err instanceof Error ? err.message : 'Failed to remove exercise');
            }
        },
        [workout]
    );

    // ========================================================================
    // WORKOUT OPERATIONS
    // ========================================================================

    const startWorkout = useCallback(async (name: string, workoutTemplateId?: string) => {
        try {
            setIsLoading(true);
            const newWorkout = await workoutService.createWorkout(name, workoutTemplateId);
            setWorkout(newWorkout);
            previousWorkoutState.current = newWorkout;
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start workout');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const finishWorkout = useCallback(async () => {
        if (!workout) return;

        // Calculate duration and volume
        const startTime = new Date(workout.started_at).getTime();
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

        let totalVolume = 0;
        workout.exercises?.forEach((we) => {
            we.sets?.forEach((set) => {
                if (set.status === 'completed') {
                    totalVolume += set.weight * set.reps;
                }
            });
        });

        try {
            // Flush any pending updates
            debouncedSaveSet.flush();

            await workoutService.completeWorkout(workout.id, durationSeconds, totalVolume);
            setWorkout(null);
            previousWorkoutState.current = null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to finish workout');
        }
    }, [workout, debouncedSaveSet]);

    const cancelWorkout = useCallback(async () => {
        if (!workout) return;

        try {
            debouncedSaveSet.cancel();
            await workoutService.cancelWorkout(workout.id);
            setWorkout(null);
            previousWorkoutState.current = null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel workout');
        }
    }, [workout, debouncedSaveSet]);

    // ========================================================================
    // TIMER OPERATIONS
    // ========================================================================

    const dismissTimer = useCallback(() => {
        setTimerState({
            isActive: false,
            lastCompletedSetTimestamp: null,
            exerciseId: null,
            restSeconds: 90,
        });
    }, []);

    const addRestTime = useCallback((seconds: number) => {
        setTimerState((prev) => ({
            ...prev,
            restSeconds: prev.restSeconds + seconds,
        }));
    }, []);

    // ========================================================================
    // DERIVED STATE
    // ========================================================================

    const exercises = useMemo(() => transformToActiveExercises(workout), [workout]);

    // ========================================================================
    // RETURN
    // ========================================================================

    return {
        workout,
        exercises,
        isLoading,
        error,
        timerState,
        actions: {
            updateSet,
            toggleSetComplete,
            addSet,
            removeSet,
            addExercise,
            removeExercise,
            dismissTimer,
            addRestTime,
            startWorkout,
            finishWorkout,
            cancelWorkout,
            refetch: fetchActiveWorkout,
        },
    };
}
