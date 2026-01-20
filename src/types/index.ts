/**
 * ============================================================================
 * ТИПЫ ДЛЯ ПРИЛОЖЕНИЯ FITAPP
 * ============================================================================
 * Типы соответствуют структуре базы данных Supabase.
 * Все веса хранятся в kg, конвертация в lbs происходит на уровне UI.
 */

// ============================================================================
// НАВИГАЦИЯ
// ============================================================================

export type Tab = 'workout' | 'library' | 'history' | 'profile';

// ============================================================================
// MUSCLE GROUPS (Категории упражнений)
// ============================================================================

export interface MuscleGroup {
    id: string;
    name: string;
    icon: string;
    color: string;
    sort_order: number;
}

// ============================================================================
// EXERCISES (Библиотека упражнений)
// ============================================================================

export type ExerciseType = 'Compound' | 'Isolation' | 'Heavy' | 'Stretch';

/** Tracking type for exercises (matches DB ENUM) */
export type ExerciseTrackingType =
    | 'weight_reps'          // Standard gym exercises (Bench Press)
    | 'weighted_bodyweight'  // Bodyweight + optional weight (Dips, Pull-ups)
    | 'duration'             // Time-based static exercises (Plank)
    | 'distance_duration';   // Cardio (Running)

export interface Exercise {
    id: string;
    name: string;
    muscle_group_id: string;
    muscle_group?: MuscleGroup; // Joined data
    exercise_type: ExerciseType;
    tracking_type: ExerciseTrackingType;
    icon: string;
    color: string | null;
    instructions: string | null;
    is_custom: boolean;
    created_by: string | null;
    created_at: string;
}

// ============================================================================
// WORKOUT TEMPLATES (Шаблоны тренировок)
// ============================================================================

export interface WorkoutTemplate {
    id: string;
    user_id: string | null;
    name: string;
    icon: string;
    is_system: boolean;
    created_at: string;
    exercises?: TemplateExercise[]; // Присоединённые данные
}

export interface TemplateExercise {
    id: string;
    template_id: string;
    exercise_id: string;
    exercise?: Exercise; // Присоединённые данные
    sort_order: number;
    target_sets: number;
    rest_seconds: number;
}

// ============================================================================
// WORKOUTS (Тренировочные сессии)
// ============================================================================

export type WorkoutStatus = 'active' | 'completed' | 'cancelled';

export interface Workout {
    id: string;
    user_id: string;
    template_id: string | null;
    name: string;
    status: WorkoutStatus;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    total_volume: number | null; // В kg
    icon: string;
    notes: string | null;
    exercises?: WorkoutExercise[]; // Присоединённые данные
}

// ============================================================================
// WORKOUT EXERCISES (Упражнения в сессии)
// ============================================================================

export interface WorkoutExercise {
    id: string;
    workout_id: string;
    exercise_id: string;
    exercise?: Exercise; // Присоединённые данные
    sort_order: number;
    rest_seconds: number;
    sets?: Set[]; // Присоединённые данные
}

// ============================================================================
// SETS (Подходы)
// ============================================================================

export type SetStatus = 'pending' | 'completed' | 'skipped';

export interface Set {
    id: string;
    workout_exercise_id: string;
    set_number: number;
    weight: number; // In kg
    reps: number;
    distance?: number; // For cardio (distance_duration)
    duration_seconds?: number; // For duration & distance_duration types
    is_warmup: boolean;
    is_dropset: boolean;
    status: SetStatus;
    completed_at: string | null;
    notes: string | null;
}

// ============================================================================
// EXERCISE HISTORY (История упражнений — materialized view)
// ============================================================================

export interface ExerciseHistory {
    user_id: string;
    exercise_id: string;
    last_weight: number; // В kg
    last_reps: number;
    last_performed_at: string;
    max_weight: number; // В kg
}

// ============================================================================
// UNIT HELPERS (Конвертация единиц)
// ============================================================================

export type UnitPreference = 'kg' | 'lbs';

/** Коэффициент конвертации kg → lbs */
export const KG_TO_LBS = 2.20462;

/** Конвертирует вес из kg в единицу пользователя */
export function convertWeight(weightKg: number, unit: UnitPreference): number {
    return unit === 'lbs' ? weightKg * KG_TO_LBS : weightKg;
}

/** Конвертирует вес из единицы пользователя в kg */
export function convertToKg(weight: number, unit: UnitPreference): number {
    return unit === 'lbs' ? weight / KG_TO_LBS : weight;
}

/** Formats weight with unit */
export function formatWeight(weightKg: number, unit: UnitPreference): string {
    const converted = convertWeight(weightKg, unit);
    return `${converted.toFixed(1)} ${unit}`;
}

// ============================================================================
// SET INPUT FIELDS HELPER
// ============================================================================

/** Configuration for which inputs to show based on tracking type */
export interface SetInputFieldsConfig {
    weight: boolean;
    reps: boolean;
    distance: boolean;
    duration: boolean;
}

/** Returns config for which inputs to show for a given exercise tracking type */
export function getSetInputFields(type: ExerciseTrackingType): SetInputFieldsConfig {
    switch (type) {
        case 'weight_reps':
            return { weight: true, reps: true, distance: false, duration: false };
        case 'weighted_bodyweight':
            return { weight: true, reps: true, distance: false, duration: false };
        case 'duration':
            return { weight: false, reps: false, distance: false, duration: true };
        case 'distance_duration':
            return { weight: false, reps: false, distance: true, duration: true };
        default:
            return { weight: true, reps: true, distance: false, duration: false };
    }
}
