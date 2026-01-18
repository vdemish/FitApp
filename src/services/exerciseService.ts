/**
 * ============================================================================
 * EXERCISE SERVICE
 * ============================================================================
 * Сервис для работы с упражнениями и группами мышц
 */

import { supabase } from './supabase';
import type { Exercise, MuscleGroup } from '@/types';

// ============================================================================
// MUSCLE GROUPS
// ============================================================================

/**
 * Получает все группы мышц, отсортированные по sort_order
 */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
    const { data, error } = await supabase
        .from('muscle_groups')
        .select('*')
        .order('sort_order');

    if (error) {
        console.error('[ExerciseService] Ошибка загрузки muscle_groups:', error.message);
        throw error;
    }

    return data || [];
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Получает все упражнения с присоединённой группой мышц
 */
export async function getExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            muscle_group:muscle_groups(*)
        `)
        .order('name');

    if (error) {
        console.error('[ExerciseService] Ошибка загрузки exercises:', error.message);
        throw error;
    }

    return data || [];
}

/**
 * Получает упражнения по группе мышц
 */
export async function getExercisesByMuscleGroup(muscleGroupId: string): Promise<Exercise[]> {
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            muscle_group:muscle_groups(*)
        `)
        .eq('muscle_group_id', muscleGroupId)
        .order('name');

    if (error) {
        console.error('[ExerciseService] Ошибка загрузки exercises по группе:', error.message);
        throw error;
    }

    return data || [];
}

/**
 * Получает упражнение по ID
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            muscle_group:muscle_groups(*)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('[ExerciseService] Ошибка загрузки exercise:', error.message);
        throw error;
    }

    return data;
}

/**
 * Поиск упражнений по имени
 */
export async function searchExercises(query: string): Promise<Exercise[]> {
    const { data, error } = await supabase
        .from('exercises')
        .select(`
            *,
            muscle_group:muscle_groups(*)
        `)
        .ilike('name', `%${query}%`)
        .order('name');

    if (error) {
        console.error('[ExerciseService] Ошибка поиска exercises:', error.message);
        throw error;
    }

    return data || [];
}

/**
 * Создаёт кастомное упражнение
 */
export async function createCustomExercise(
    exercise: Omit<Exercise, 'id' | 'created_at' | 'is_custom' | 'created_by'>
): Promise<Exercise> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            ...exercise,
            is_custom: true,
            created_by: user.id,
        })
        .select(`
            *,
            muscle_group:muscle_groups(*)
        `)
        .single();

    if (error) {
        console.error('[ExerciseService] Ошибка создания exercise:', error.message);
        throw error;
    }

    return data;
}
