/**
 * ============================================================================
 * useWorkout Hook
 * ============================================================================
 * Хук для управления активной тренировкой
 */

import { useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutExercise, Set } from '@/types';
import * as workoutService from '@/services/workoutService';

interface UseWorkoutState {
    workout: Workout | null;
    loading: boolean;
    error: string | null;
}

interface UseWorkoutReturn extends UseWorkoutState {
    refetch: () => Promise<void>;
    startWorkout: (name: string, templateId?: string) => Promise<Workout>;
    finishWorkout: () => Promise<void>;
    cancelWorkout: () => Promise<void>;
    addExercise: (exerciseId: string) => Promise<WorkoutExercise>;
    removeExercise: (workoutExerciseId: string) => Promise<void>;
    addSet: (workoutExerciseId: string, weight: number, reps: number) => Promise<Set>;
    logSet: (setId: string, weight: number, reps: number) => Promise<Set>;
    updateSet: (setId: string, updates: Partial<Pick<Set, 'weight' | 'reps'>>) => Promise<Set>;
    deleteSet: (setId: string) => Promise<void>;
}

export function useWorkout(): UseWorkoutReturn {
    const [state, setState] = useState<UseWorkoutState>({
        workout: null,
        loading: true,
        error: null,
    });

    const fetchActiveWorkout = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const workout = await workoutService.getActiveWorkout();
            setState({
                workout,
                loading: false,
                error: null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка загрузки тренировки';
            setState(prev => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, []);

    useEffect(() => {
        fetchActiveWorkout();
    }, [fetchActiveWorkout]);

    const startWorkout = useCallback(async (name: string, templateId?: string): Promise<Workout> => {
        const workout = await workoutService.createWorkout(name, templateId);
        setState(prev => ({ ...prev, workout }));
        return workout;
    }, []);

    const finishWorkout = useCallback(async () => {
        if (!state.workout) return;

        // Вычисляем длительность и объём
        const startTime = new Date(state.workout.started_at).getTime();
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

        // Вычисляем объём из всех completed сетов
        let totalVolume = 0;
        state.workout.exercises?.forEach(we => {
            we.sets?.forEach(set => {
                if (set.status === 'completed') {
                    totalVolume += set.weight * set.reps;
                }
            });
        });

        await workoutService.completeWorkout(state.workout.id, durationSeconds, totalVolume);
        setState(prev => ({ ...prev, workout: null }));
    }, [state.workout]);

    const cancelWorkout = useCallback(async () => {
        if (!state.workout) return;
        await workoutService.cancelWorkout(state.workout.id);
        setState(prev => ({ ...prev, workout: null }));
    }, [state.workout]);

    const addExercise = useCallback(async (exerciseId: string): Promise<WorkoutExercise> => {
        if (!state.workout) throw new Error('No active workout');

        const workoutExercise = await workoutService.addExerciseToWorkout(
            state.workout.id,
            exerciseId
        );

        // Обновляем локальное состояние
        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: [...(prev.workout.exercises || []), workoutExercise],
            } : null,
        }));

        return workoutExercise;
    }, [state.workout]);

    const removeExercise = useCallback(async (workoutExerciseId: string) => {
        await workoutService.removeExerciseFromWorkout(workoutExerciseId);

        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: prev.workout.exercises?.filter(we => we.id !== workoutExerciseId),
            } : null,
        }));
    }, []);

    const addSet = useCallback(async (
        workoutExerciseId: string,
        weight: number,
        reps: number
    ): Promise<Set> => {
        // Находим текущий номер сета
        const workoutExercise = state.workout?.exercises?.find(we => we.id === workoutExerciseId);
        const setNumber = (workoutExercise?.sets?.length || 0) + 1;

        const newSet = await workoutService.addSet(workoutExerciseId, weight, reps, setNumber);

        // Обновляем локальное состояние
        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: prev.workout.exercises?.map(we =>
                    we.id === workoutExerciseId
                        ? { ...we, sets: [...(we.sets || []), newSet] }
                        : we
                ),
            } : null,
        }));

        return newSet;
    }, [state.workout]);

    const logSet = useCallback(async (
        setId: string,
        weight: number,
        reps: number
    ): Promise<Set> => {
        const updatedSet = await workoutService.completeSet(setId, weight, reps);

        // Обновляем локальное состояние
        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: prev.workout.exercises?.map(we => ({
                    ...we,
                    sets: we.sets?.map(s => s.id === setId ? updatedSet : s),
                })),
            } : null,
        }));

        return updatedSet;
    }, []);

    const updateSet = useCallback(async (
        setId: string,
        updates: Partial<Pick<Set, 'weight' | 'reps'>>
    ): Promise<Set> => {
        const updatedSet = await workoutService.updateSet(setId, updates);

        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: prev.workout.exercises?.map(we => ({
                    ...we,
                    sets: we.sets?.map(s => s.id === setId ? updatedSet : s),
                })),
            } : null,
        }));

        return updatedSet;
    }, []);

    const deleteSet = useCallback(async (setId: string) => {
        await workoutService.deleteSet(setId);

        setState(prev => ({
            ...prev,
            workout: prev.workout ? {
                ...prev.workout,
                exercises: prev.workout.exercises?.map(we => ({
                    ...we,
                    sets: we.sets?.filter(s => s.id !== setId),
                })),
            } : null,
        }));
    }, []);

    return {
        ...state,
        refetch: fetchActiveWorkout,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        addExercise,
        removeExercise,
        addSet,
        logSet,
        updateSet,
        deleteSet,
    };
}
