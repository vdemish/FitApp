/**
 * ============================================================================
 * WORKOUT SERVICE
 * ============================================================================
 * Сервис для работы с тренировками, упражнениями и подходами
 */

import { supabase } from './supabase';
import type { Workout, WorkoutExercise, Set, WorkoutStatus } from '@/types';

// ============================================================================
// WORKOUTS
// ============================================================================

/**
 * Получает активную тренировку текущего пользователя
 */
export async function getActiveWorkout(): Promise<Workout | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('workouts')
        .select(`
            *,
            exercises:workout_exercises(
                *,
                exercise:exercises(*),
                sets:sets(*)
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[WorkoutService] Ошибка загрузки активной тренировки:', error.message);
        throw error;
    }

    return data;
}

/**
 * Получает историю тренировок пользователя
 */
export async function getWorkoutHistory(limit = 10): Promise<Workout[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('workouts')
        .select(`
            *,
            exercises:workout_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[WorkoutService] Ошибка загрузки истории:', error.message);
        throw error;
    }

    return data || [];
}

/**
 * Создаёт новую тренировку
 */
export async function createWorkout(name: string, templateId?: string): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name,
            template_id: templateId || null,
            status: 'active',
            icon: 'fitness_center',
        })
        .select()
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка создания тренировки:', error.message);
        throw error;
    }

    return data;
}

/**
 * Завершает тренировку
 */
export async function completeWorkout(
    workoutId: string,
    durationSeconds: number,
    totalVolume: number
): Promise<Workout> {
    const { data, error } = await supabase
        .from('workouts')
        .update({
            status: 'completed' as WorkoutStatus,
            completed_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            total_volume: totalVolume,
        })
        .eq('id', workoutId)
        .select()
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка завершения тренировки:', error.message);
        throw error;
    }

    return data;
}

/**
 * Отменяет тренировку
 */
export async function cancelWorkout(workoutId: string): Promise<void> {
    const { error } = await supabase
        .from('workouts')
        .update({ status: 'cancelled' as WorkoutStatus })
        .eq('id', workoutId);

    if (error) {
        console.error('[WorkoutService] Ошибка отмены тренировки:', error.message);
        throw error;
    }
}

// ============================================================================
// WORKOUT EXERCISES
// ============================================================================

/**
 * Добавляет упражнение в тренировку
 */
export async function addExerciseToWorkout(
    workoutId: string,
    exerciseId: string,
    restSeconds = 90
): Promise<WorkoutExercise> {
    // Получаем текущий максимальный sort_order
    const { data: existing } = await supabase
        .from('workout_exercises')
        .select('sort_order')
        .eq('workout_id', workoutId)
        .order('sort_order', { ascending: false })
        .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
            workout_id: workoutId,
            exercise_id: exerciseId,
            sort_order: nextOrder,
            rest_seconds: restSeconds,
        })
        .select(`
            *,
            exercise:exercises(*)
        `)
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка добавления упражнения:', error.message);
        throw error;
    }

    return data;
}

/**
 * Удаляет упражнение из тренировки
 */
export async function removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId);

    if (error) {
        console.error('[WorkoutService] Ошибка удаления упражнения:', error.message);
        throw error;
    }
}

// ============================================================================
// SETS
// ============================================================================

/**
 * Добавляет подход
 */
export async function addSet(
    workoutExerciseId: string,
    weight: number,
    reps: number,
    setNumber: number
): Promise<Set> {
    const { data, error } = await supabase
        .from('sets')
        .insert({
            workout_exercise_id: workoutExerciseId,
            set_number: setNumber,
            weight,
            reps,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка добавления подхода:', error.message);
        throw error;
    }

    return data;
}

/**
 * Обновляет подход
 */
export async function updateSet(
    setId: string,
    updates: Partial<Pick<Set, 'weight' | 'reps' | 'status' | 'notes'>>
): Promise<Set> {
    const updateData: any = { ...updates };

    // Если статус меняется на completed, устанавливаем время
    if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('sets')
        .update(updateData)
        .eq('id', setId)
        .select()
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка обновления подхода:', error.message);
        throw error;
    }

    return data;
}

/**
 * Завершает подход (логирует)
 */
export async function completeSet(setId: string, weight: number, reps: number): Promise<Set> {
    return updateSet(setId, {
        weight,
        reps,
        status: 'completed',
    });
}

/**
 * Удаляет подход
 */
export async function deleteSet(setId: string): Promise<void> {
    const { error } = await supabase
        .from('sets')
        .delete()
        .eq('id', setId);

    if (error) {
        console.error('[WorkoutService] Ошибка удаления подхода:', error.message);
        throw error;
    }
}
