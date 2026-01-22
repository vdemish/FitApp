/**
 * ============================================================================
 * WORKOUT SERVICE
 * ============================================================================
 * Сервис для работы с тренировками, упражнениями и подходами
 */

import { supabase } from './supabase';
import type { Workout, WorkoutExercise, Set, WorkoutStatus, WorkoutTemplate, SelectedExercise } from '@/types';

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
 * Получает полную информацию о тренировке по ID (включая подходы)
 */
export async function getWorkoutDetails(workoutId: string): Promise<Workout | null> {
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
        .eq('id', workoutId)
        .order('sort_order', { foreignTable: 'workout_exercises', ascending: true })
        .order('set_number', { foreignTable: 'workout_exercises.sets', ascending: true })
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка загрузки деталей тренировки:', error.message);
        return null;
    }

    return data;
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
 * Получает шаблон тренировки по ID
 */
export async function getWorkoutTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
    const { data, error } = await supabase
        .from('workout_templates')
        .select(`
            *,
            exercises:template_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('id', templateId)
        .single();

    if (error) {
        console.error('[WorkoutService] Ошибка загрузки шаблона:', error.message);
        return null;
    }

    return data;
}

/**
 * Создаёт новый пользовательский шаблон тренировки
 */
export async function saveNewTemplate(
    name: string,
    exercises: { exercise_id: string; sort_order: number; target_sets?: number; rest_seconds?: number }[]
): Promise<WorkoutTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Create Template
    const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
            user_id: user.id,
            name,
            icon: 'fitness_center', // Default icon
            is_system: false,
        })
        .select()
        .single();

    if (templateError) {
        console.error('[WorkoutService] Ошибка создания шаблона:', templateError.message);
        throw templateError;
    }

    // 2. Add Exercises
    if (exercises && exercises.length > 0) {
        const templateExercises = exercises.map((ex) => ({
            template_id: template.id,
            exercise_id: ex.exercise_id,
            sort_order: ex.sort_order,
            target_sets: ex.target_sets || 3,
            rest_seconds: ex.rest_seconds || 90,
        }));

        const { error: exercisesError } = await supabase
            .from('template_exercises')
            .insert(templateExercises);

        if (exercisesError) {
            console.error('[WorkoutService] Ошибка добавления упражнений в шаблон:', exercisesError.message);
            // Consider cleanup here if critical, but for now we warn
            throw exercisesError;
        }
    }

    // 3. Return full template with exercises
    const { data: fullTemplate, error: fetchError } = await supabase
        .from('workout_templates')
        .select(`
            *,
            exercises:template_exercises(
                *,
                exercise:exercises(*)
            )
        `)
        .eq('id', template.id)
        .order('sort_order', { foreignTable: 'template_exercises', ascending: true })
        .single();

    if (fetchError || !fullTemplate) {
        return template;
    }

    return fullTemplate;
}

/**
 * Обновляет упражнения в существующем пользовательском шаблоне
 */
export async function updateTemplateExercises(
    templateId: string,
    exercises: { exercise_id: string; sort_order: number; target_sets?: number; rest_seconds?: number }[]
): Promise<void> {
    const { error: deleteError } = await supabase
        .from('template_exercises')
        .delete()
        .eq('template_id', templateId);

    if (deleteError) {
        console.error('[WorkoutService] Ошибка удаления упражнений шаблона:', deleteError.message);
        throw deleteError;
    }

    if (!exercises.length) return;

    const templateExercises = exercises.map((ex) => ({
        template_id: templateId,
        exercise_id: ex.exercise_id,
        sort_order: ex.sort_order,
        target_sets: ex.target_sets || 1,
        rest_seconds: ex.rest_seconds || 90,
    }));

    const { error: insertError } = await supabase
        .from('template_exercises')
        .insert(templateExercises);

    if (insertError) {
        console.error('[WorkoutService] Ошибка обновления упражнений шаблона:', insertError.message);
        throw insertError;
    }
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

    // 3. Copy exercises and create sets
    if (template.exercises && template.exercises.length > 0) {
        // Prepare exercises for insertion
        const workoutExercises = template.exercises.map((te: any) => ({
            workout_id: workout.id,
            exercise_id: te.exercise_id,
            sort_order: te.sort_order, // CRITICAL: Copy sort_order
            rest_seconds: te.rest_seconds,
        }));

        const { data: createdExercises, error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(workoutExercises)
            .select();

        if (exercisesError) {
            console.error('[WorkoutService] Ошибка копирования упражнений:', exercisesError.message);
            throw exercisesError;
        }

        // Create sets for each exercise based on template target_sets
        if (createdExercises && createdExercises.length > 0) {
            const setsToCreate: any[] = [];

            createdExercises.forEach((createdExercise) => {
                // Find original template exercise to get target_sets
                // We match by exercise_id and sort_order to be precise
                const templateExercise = template.exercises.find(
                    (te: any) => te.exercise_id === createdExercise.exercise_id && te.sort_order === createdExercise.sort_order
                );

                // Determine sets count: use target_sets or default to 1
                // If target_sets is null/undefined/0/negative, fallback to 1
                const setsCount = (templateExercise?.target_sets && templateExercise.target_sets > 0)
                    ? templateExercise.target_sets
                    : 1;

                // Generate set objects
                for (let i = 1; i <= setsCount; i++) {
                    setsToCreate.push({
                        workout_exercise_id: createdExercise.id,
                        set_number: i,
                        weight: 0,
                        reps: 0,
                        status: 'pending',
                    });
                }
            });

            if (setsToCreate.length > 0) {
                const { error: setsError } = await supabase
                    .from('sets')
                    .insert(setsToCreate);

                if (setsError) {
                    console.error('[WorkoutService] Ошибка создания подходов:', setsError.message);
                    // Non-fatal, but good to know
                }
            }
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
export async function createWorkoutFromExercises(exercises: SelectedExercise[]): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const clampSets = (value: number) => Math.min(19, Math.max(1, value));
    const targetSetsBySortOrder = new Map(
        exercises.map((exercise, index) => [index, clampSets(exercise.target_sets ?? 1)])
    );

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

        const { data: newExercises, error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(workoutExercises)
            .select();

        if (exercisesError) {
            console.error('[WorkoutService] Ошибка добавления упражнений:', exercisesError.message);
            throw exercisesError;
        }

        // Add default sets if exercises created
        if (newExercises && newExercises.length > 0) {
            const setsToCreate: any[] = [];

            newExercises.forEach((exercise) => {
                const setsCount = targetSetsBySortOrder.get(exercise.sort_order) ?? 1;
                for (let i = 1; i <= setsCount; i++) {
                    setsToCreate.push({
                        workout_exercise_id: exercise.id,
                        set_number: i,
                        weight: 0,
                        reps: 0,
                        status: 'pending',
                    });
                }
            });

            const { error: setsError } = await supabase
                .from('sets')
                .insert(setsToCreate);

            if (setsError) {
                console.error('[WorkoutService] Ошибка создания дефолтных подходов:', setsError.message);
            }
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

    // Вставляем упражнение
    const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
            workout_id: workoutId,
            exercise_id: exerciseId,
            sort_order: nextOrder,
            rest_seconds: restSeconds,
        })
        .select()
        .single(); // We need basic data first without joins to be safe, or just use ID for set creation

    if (error) {
        console.error('[WorkoutService] Ошибка добавления упражнения:', error.message);
        throw error;
    }

    // Add default set
    const { error: setError } = await supabase
        .from('sets')
        .insert({
            workout_exercise_id: data.id,
            set_number: 1,
            weight: 0,
            reps: 0,
            status: 'pending',
        });

    if (setError) {
        console.error('[WorkoutService] Ошибка создания дефолтного подхода:', setError.message);
    }

    // Return full data
    const { data: fullData, error: fetchError } = await supabase
        .from('workout_exercises')
        .select(`
            *,
            exercise:exercises(*),
            sets:sets(*)
        `)
        .eq('id', data.id)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    return fullData;
}

/**
 * Добавляет список упражнений в тренировку
 */
export async function addExercisesToWorkout(
    workoutId: string,
    exerciseIds: string[],
    restSeconds = 90
): Promise<WorkoutExercise[]> {
    if (!exerciseIds.length) return [];

    // 1. Получаем текущий максимальный sort_order
    const { data: existing } = await supabase
        .from('workout_exercises')
        .select('sort_order')
        .eq('workout_id', workoutId)
        .order('sort_order', { ascending: false })
        .limit(1);

    const startOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    // 2. Подготавливаем данные для вставки
    const uniqueIds = [...new Set(exerciseIds)];
    const workoutExercises = uniqueIds.map((exerciseId, index) => ({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sort_order: startOrder + index,
        rest_seconds: restSeconds,
    }));

    // 3. Вставляем упражнения
    const { data: newExercises, error } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises)
        .select();

    if (error) {
        console.error('[WorkoutService] Ошибка добавления упражнений:', error.message);
        throw error;
    }

    if (!newExercises || newExercises.length === 0) return [];

    // 4. Добавляем дефолтный подход (Set 1) для каждого упражнения
    const defaultSets = newExercises.map(ex => ({
        workout_exercise_id: ex.id,
        set_number: 1,
        weight: 0,
        reps: 0,
        status: 'pending',
    }));

    const { error: setsError } = await supabase
        .from('sets')
        .insert(defaultSets);

    if (setsError) {
        console.error('[WorkoutService] Ошибка создания дефолтных подходов:', setsError.message);
        // Не прерываем выполнение, если подходы не создались, но логируем
    }

    // 5. Возвращаем полные данные с подходами
    const { data: result, error: fetchError } = await supabase
        .from('workout_exercises')
        .select(`
            *,
            exercise:exercises(*),
            sets:sets(*)
        `)
        .in('id', newExercises.map(e => e.id))
        .order('sort_order', { ascending: true });

    if (fetchError) {
        console.error('[WorkoutService] Ошибка загрузки созданных упражнений:', fetchError.message);
        throw fetchError;
    }

    return result || [];
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
    updates: Partial<Pick<Set, 'weight' | 'reps' | 'distance' | 'duration_seconds' | 'status' | 'notes'>>
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
