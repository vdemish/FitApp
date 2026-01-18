/**
 * ============================================================================
 * useWorkoutHistory Hook
 * ============================================================================
 * Хук для загрузки истории тренировок
 */

import { useState, useEffect, useCallback } from 'react';
import type { Workout } from '@/types';
import * as workoutService from '@/services/workoutService';

interface UseWorkoutHistoryState {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
}

interface UseWorkoutHistoryReturn extends UseWorkoutHistoryState {
    refetch: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export function useWorkoutHistory(initialLimit = 10): UseWorkoutHistoryReturn {
    const [state, setState] = useState<UseWorkoutHistoryState>({
        workouts: [],
        loading: true,
        error: null,
    });
    const [limit, setLimit] = useState(initialLimit);

    const fetchHistory = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const workouts = await workoutService.getWorkoutHistory(limit);
            setState({
                workouts,
                loading: false,
                error: null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка загрузки истории';
            setState(prev => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [limit]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const loadMore = useCallback(async () => {
        setLimit(prev => prev + 10);
    }, []);

    return {
        ...state,
        refetch: fetchHistory,
        loadMore,
    };
}
