/**
 * ============================================================================
 * useActiveWorkout Hook
 * ============================================================================
 * Hook for managing active workout with optimistic UI updates
 * Uses hybrid approach: Local state for immediate UI + Debounced API calls
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import type { Workout, WorkoutExercise, Set as WorkoutSet, SetStatus, Exercise, ExerciseTrackingType } from '@/types';
import * as workoutService from '@/services/workoutService';
import type { SetData } from '@/components/active-workout';
import {
    clearRestTimerState,
    loadRestTimerState,
    saveRestTimerState,
    updateRestTimerState,
} from '@/services/TimerStateStore';

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
    trackingType: ExerciseTrackingType;
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
        /** Update a set's weight, reps, distance, or duration (debounced save) */
        updateSet: (setId: string, field: 'weight' | 'reps' | 'distance' | 'durationSeconds', value: number) => void;
        /** Toggle set completion (immediate save) */
        toggleSetComplete: (setId: string) => void;
        /** Add a new set to an exercise */
        addSet: (workoutExerciseId: string) => Promise<void>;
        /** Remove a set */
        removeSet: (setId: string) => Promise<void>;
        /** Add an exercise to the workout */
        addExercise: (exerciseId: string) => Promise<void>;
        /** Add multiple exercises to the workout */
        addExercises: (exerciseIds: string[]) => Promise<void>;
        /** Reorder exercises in the workout */
        reorderExercises: (data: ActiveExercise[]) => void;
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
        /** Waterfall auto-fill sets */
        autoFillSets: (setId: string, field: 'weight' | 'reps', value: number) => void;
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
        trackingType: we.exercise?.tracking_type || 'weight_reps',
        restSeconds: we.rest_seconds,
        sets: (we.sets || []).map((set: WorkoutSet) => ({
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            distance: set.distance,
            durationSeconds: set.duration_seconds,
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

    const rehydrateRestTimer = useCallback(async () => {
        if (timerState.isActive) return;
        const stored = await loadRestTimerState();
        if (!stored || stored.status !== 'running' || !stored.endAtMs || !stored.durationMs) {
            return;
        }

        const now = Date.now();
        const remainingMs = stored.endAtMs - now;
        if (remainingMs <= 0) {
            await clearRestTimerState();
            setTimerState((prev) => ({
                ...prev,
                isActive: false,
                lastCompletedSetTimestamp: null,
                exerciseId: null,
            }));
            return;
        }

        setTimerState({
            isActive: true,
            lastCompletedSetTimestamp: stored.endAtMs - stored.durationMs,
            exerciseId: stored.exerciseId ?? null,
            restSeconds: Math.ceil(stored.durationMs / 1000),
        });
    }, [timerState.isActive]);

    useEffect(() => {
        if (isLoading) return;
        rehydrateRestTimer();
    }, [isLoading, workout?.id, rehydrateRestTimer]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                rehydrateRestTimer();
            }
        });

        return () => subscription.remove();
    }, [rehydrateRestTimer]);

    // Create debounced save function
    const debouncedSaveSet = useMemo(
        () =>
            debounce(async (setId: string, updates: Partial<{ weight: number; reps: number; distance: number; durationSeconds: number }>) => {
                try {
                    // Map camelCase to snake_case for database
                    const dbUpdates: Record<string, number> = {};
                    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
                    if (updates.reps !== undefined) dbUpdates.reps = updates.reps;
                    if (updates.distance !== undefined) dbUpdates.distance = updates.distance;
                    if (updates.durationSeconds !== undefined) dbUpdates.duration_seconds = updates.durationSeconds;

                    await workoutService.updateSet(setId, dbUpdates);
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
        (setId: string, field: 'weight' | 'reps' | 'distance' | 'durationSeconds', value: number) => {
            // Store previous state for rollback
            previousWorkoutState.current = workout;

            // Optimistic update
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                // Map field name for local state (DB schema matches these except durationSeconds)
                const stateField = field === 'durationSeconds' ? 'duration_seconds' : field;

                return {
                    ...prev,
                    exercises: prev.exercises.map((we) => ({
                        ...we,
                        sets: we.sets?.map((set) =>
                            set.id === setId ? { ...set, [stateField]: value } : set
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
                const startTimestamp = Date.now();
                const durationMs = targetExercise.rest_seconds * 1000;
                setTimerState({
                    isActive: true,
                    lastCompletedSetTimestamp: startTimestamp,
                    exerciseId: targetExercise.id,
                    restSeconds: targetExercise.rest_seconds,
                });
                saveRestTimerState({
                    status: 'running',
                    phase: 'rest',
                    endAtMs: startTimestamp + durationMs,
                    remainingMs: null,
                    durationMs,
                    scheduledNotificationIds: [],
                    exerciseId: targetExercise.id,
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
            const isRepBased = workoutExercise.exercise?.tracking_type === 'weight_reps' ||
                workoutExercise.exercise?.tracking_type === 'weighted_bodyweight';
            // Default to 10 for rep-based exercises, 0 for others (duration/distance)
            const fallbackReps = isRepBased ? 10 : 0;
            const defaultReps = lastSet?.reps ?? fallbackReps;

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

    const addExercises = useCallback(
        async (exerciseIds: string[]) => {
            if (!workout || exerciseIds.length === 0) return;

            // Generate temp IDs and optimistic items
            // We need exercise details for optimistic UI, but we only have IDs here.
            // In a real scenario, we might pass the full exercise objects or just wait for the server.
            // For now, let's defer the UI update to the server response to avoid complexity with missing exercise data (name, icon, etc.)
            // OR checks if we can pass exercises instead of IDs, but the props say IDs.
            // Let's implement optimistic update assuming we don't have full details immediately, 
            // OR essentially wait for the fast response. 
            // actually, let's just use standard loading state or just wait. 
            // The user exp might be fine with a small spinner or just appending after a sec.

            // However, to keep it consistent with "addExercise", let's try to just call the service and update state.

            try {
                const newWorkoutExercises = await workoutService.addExercisesToWorkout(
                    workout.id,
                    exerciseIds
                );

                setWorkout((prev) =>
                    prev
                        ? {
                            ...prev,
                            exercises: [...(prev.exercises || []), ...newWorkoutExercises],
                        }
                        : null
                );
            } catch (err) {
                console.error('[useActiveWorkout] Failed to add exercises:', err);
                setError(err instanceof Error ? err.message : 'Failed to add exercises');
            }
        },
        [workout]
    );

    const reorderExercises = useCallback(
        (data: ActiveExercise[]) => {
            setWorkout((prev) => {
                if (!prev?.exercises) return prev;

                // Create a map of current exercises for quick lookup
                const currentExercisesMap = new Map(
                    prev.exercises.map((e) => [e.id, e])
                );

                // Reconstruct the exercises array based on the new order
                const reorderedExercises = data
                    .map((item, index) => {
                        const original = currentExercisesMap.get(item.workoutExerciseId);
                        if (!original) return null;
                        return {
                            ...original,
                            sort_order: index,
                        };
                    })
                    .filter((e): e is WorkoutExercise => e !== null);

                // If we lost any exercises, append them at the end
                if (reorderedExercises.length !== prev.exercises.length) {
                    const processedIds = new Set(reorderedExercises.map((e) => e.id));
                    prev.exercises.forEach((e) => {
                        if (!processedIds.has(e.id)) {
                            reorderedExercises.push(e);
                        }
                    });
                }

                return {
                    ...prev,
                    exercises: reorderedExercises,
                };
            });
        },
        []
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
        clearRestTimerState();
    }, []);

    const addRestTime = useCallback((seconds: number) => {
        setTimerState((prev) => {
            const nextRestSeconds = prev.restSeconds + seconds;
            if (prev.isActive && prev.lastCompletedSetTimestamp) {
                const endAtMs = prev.lastCompletedSetTimestamp + nextRestSeconds * 1000;
                updateRestTimerState({
                    endAtMs,
                    durationMs: nextRestSeconds * 1000,
                });
            }

            return {
                ...prev,
                restSeconds: nextRestSeconds,
            };
        });
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
            addExercises,
            reorderExercises,
            removeExercise,
            dismissTimer,
            addRestTime,
            startWorkout,
            finishWorkout,
            cancelWorkout,
            refetch: fetchActiveWorkout,
            autoFillSets: useCallback(
                (setId: string, field: 'weight' | 'reps', value: number) => {
                    if (value <= 0) return;

                    // find the exercise and set details first to know what to update
                    let targetExerciseIndex = -1;
                    let targetSetIndex = -1;
                    let targetSets: WorkoutSet[] = [];

                    if (!workout?.exercises) return;

                    for (let i = 0; i < workout.exercises.length; i++) {
                        const sets = workout.exercises[i].sets || [];
                        const setIdx = sets.findIndex((s) => s.id === setId);
                        if (setIdx !== -1) {
                            targetExerciseIndex = i;
                            targetSetIndex = setIdx;
                            targetSets = sets;
                            break;
                        }
                    }

                    if (targetExerciseIndex === -1) return;

                    // Optimistic update
                    setWorkout((prev) => {
                        if (!prev?.exercises) return prev;
                        // Need to re-find in prev to be safe with state updates
                        const currentExercise = prev.exercises[targetExerciseIndex];
                        if (!currentExercise || !currentExercise.sets) return prev;

                        const updatedSets = currentExercise.sets.map((set, index) => {
                            if (index > targetSetIndex) {
                                // Update subsequent sets
                                return { ...set, [field]: value };
                            }
                            return set;
                        });

                        const updatedExercise = { ...currentExercise, sets: updatedSets };
                        const updatedExercises = [...prev.exercises];
                        updatedExercises[targetExerciseIndex] = updatedExercise;

                        return { ...prev, exercises: updatedExercises };
                    });

                    // Persist changes
                    // targetSets refers to the sets before update, but IDs are stable.
                    targetSets.forEach((set, index) => {
                        if (index > targetSetIndex) {
                            // Update pending updates and trigger save
                            const existing = pendingUpdates.current.get(set.id) || {};
                            pendingUpdates.current.set(set.id, { ...existing, [field]: value });
                            debouncedSaveSet(set.id, pendingUpdates.current.get(set.id)!);
                        }
                    });
                },
                [workout, debouncedSaveSet]
            ),
        },
    };
}
