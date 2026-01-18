/**
 * ============================================================================
 * useExercises Hook
 * ============================================================================
 * Хук для работы с упражнениями и группами мышц
 */

import { useState, useEffect, useCallback } from 'react';
import type { Exercise, MuscleGroup } from '@/types';
import * as exerciseService from '@/services/exerciseService';

interface UseExercisesState {
    exercises: Exercise[];
    muscleGroups: MuscleGroup[];
    loading: boolean;
    error: string | null;
}

interface UseExercisesReturn extends UseExercisesState {
    refetch: () => Promise<void>;
    searchExercises: (query: string) => Promise<Exercise[]>;
    getByMuscleGroup: (muscleGroupId: string) => Exercise[];
}

export function useExercises(): UseExercisesReturn {
    const [state, setState] = useState<UseExercisesState>({
        exercises: [],
        muscleGroups: [],
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [exercises, muscleGroups] = await Promise.all([
                exerciseService.getExercises(),
                exerciseService.getMuscleGroups(),
            ]);

            setState({
                exercises,
                muscleGroups,
                loading: false,
                error: null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка загрузки упражнений';
            setState(prev => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const searchExercises = useCallback(async (query: string): Promise<Exercise[]> => {
        if (!query.trim()) return state.exercises;

        try {
            return await exerciseService.searchExercises(query);
        } catch {
            return state.exercises.filter(e =>
                e.name.toLowerCase().includes(query.toLowerCase())
            );
        }
    }, [state.exercises]);

    const getByMuscleGroup = useCallback((muscleGroupId: string): Exercise[] => {
        return state.exercises.filter(e => e.muscle_group_id === muscleGroupId);
    }, [state.exercises]);

    return {
        ...state,
        refetch: fetchData,
        searchExercises,
        getByMuscleGroup,
    };
}
