/**
 * ============================================================================
 * WORKOUT SERVICE
 * ============================================================================
 * Сервис для работы с тренировками, упражнениями и подходами
 */

import { supabase } from './supabase';
import type { Workout, WorkoutExercise, Set, WorkoutStatus, WorkoutTemplate, Exercise } from '@/types';

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
        .order('sort_order', { foreignTable: 'workout_exercises', ascending: true })
        .order('set_number', { foreignTable: 'workout_exercises.sets', ascending: true })
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
 * Получает шаблоны тренировок
 */
export async function getWorkoutTemplates(limit = 10): Promise<WorkoutTemplate[]> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('workout_templates')
        .select(`
            *,
            exercises:template_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .or(`user_id.eq.${user?.id || ''},is_system.eq.true`)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[WorkoutService] Ошибка загрузки шаблонов:', error.message);
        throw error;
    }

    return data || [];
}

/**
 * Создаёт тренировку из шаблона
 */
export async function createWorkoutFromTemplate(templateId: string): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Fetch template with sorted exercises
    const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .select(`
            *,
            exercises:template_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('id', templateId)
        .order('sort_order', { foreignTable: 'template_exercises', ascending: true })
        .single();

    if (templateError || !template) {
        console.error('[WorkoutService] Ошибка загрузки шаблона:', templateError?.message);
        throw new Error('Template not found');
    }

    // 2. Create Workout
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name: template.name,
            template_id: template.id,
            status: 'active',
            icon: template.icon,
            started_at: new Date().toISOString()
        })
        .select()
        .single();

    if (workoutError) {
        console.error('[WorkoutService] Ошибка создания тренировки:', workoutError.message);
        throw workoutError;
    }

    // 3. Copy exercises
    if (template.exercises && template.exercises.length > 0) {
        const workoutExercises = template.exercises.map((te: any) => ({
            workout_id: workout.id,
            exercise_id: te.exercise_id,
            sort_order: te.sort_order, // CRITICAL: Copy sort_order
            rest_seconds: te.rest_seconds,
        }));

        const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(workoutExercises);

        if (exercisesError) {
            console.error('[WorkoutService] Ошибка копирования упражнений:', exercisesError.message);
            throw exercisesError;
        }
    }

    // 4. Return full workout structure
    const { data: fullWorkout, error: fetchError } = await supabase
        .from('workouts')
        .select(`
            *,
            exercises:workout_exercises(
                *,
                exercise:exercises(*),
                sets:sets(*)
            )
        `)
        .eq('id', workout.id)
        .order('sort_order', { foreignTable: 'workout_exercises', ascending: true })
        .single();

    if (fetchError || !fullWorkout) {
        console.error('[WorkoutService] Ошибка загрузки полной тренировки:', fetchError?.message);
        return workout; // Fallback to basic workout
    }

    return fullWorkout;
}

/**
 * Создаёт пустую тренировку с выбранными упражнениями
 */
export async function createWorkoutFromExercises(exercises: Exercise[]): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Create Workout
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name: 'Тренировка',
            status: 'active',
            icon: 'fitness_center',
            started_at: new Date().toISOString()
        })
        .select()
        .single();

    if (workoutError) {
        console.error('[WorkoutService] Ошибка создания тренировки:', workoutError.message);
        throw workoutError;
    }

    // 2. Add Exercises with index as sort_order
    if (exercises && exercises.length > 0) {
        const workoutExercises = exercises.map((ex, index) => ({
            workout_id: workout.id,
            exercise_id: ex.id,
            sort_order: index, // CRITICAL: Use index
            rest_seconds: 90, // Default rest
        }));

        const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(workoutExercises);

        if (exercisesError) {
            console.error('[WorkoutService] Ошибка добавления упражнений:', exercisesError.message);
            throw exercisesError;
        }
    }

    // 3. Return full workout structure
    const { data: fullWorkout, error: fetchError } = await supabase
        .from('workouts')
        .select(`
            *,
            exercises:workout_exercises(
                *,
                exercise:exercises(*),
                sets:sets(*)
            )
        `)
        .eq('id', workout.id)
        .order('sort_order', { foreignTable: 'workout_exercises', ascending: true })
        .single();

    if (fetchError || !fullWorkout) {
        console.error('[WorkoutService] Ошибка загрузки полной тренировки:', fetchError?.message);
        return workout; // Fallback to basic workout
    }

    return fullWorkout;
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
