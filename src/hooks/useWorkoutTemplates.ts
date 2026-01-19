/**
 * useWorkoutTemplates Hook
 * Fetches workout templates from the database
 */

import { useState, useEffect, useCallback } from 'react';
import type { WorkoutTemplate } from '@/types';
import * as workoutService from '@/services/workoutService';

interface UseWorkoutTemplatesState {
    templates: WorkoutTemplate[];
    loading: boolean;
    error: string | null;
}

interface UseWorkoutTemplatesReturn extends UseWorkoutTemplatesState {
    refetch: () => Promise<void>;
}

export function useWorkoutTemplates(limit = 10): UseWorkoutTemplatesReturn {
    const [state, setState] = useState<UseWorkoutTemplatesState>({
        templates: [],
        loading: true,
        error: null,
    });

    const fetchTemplates = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const templates = await workoutService.getWorkoutTemplates(limit);
            setState({
                templates,
                loading: false,
                error: null,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error loading templates';
            setState(prev => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, [limit]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return {
        ...state,
        refetch: fetchTemplates,
    };
}
