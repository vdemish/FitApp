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

export interface Exercise {
    id: string;
    name: string;
    muscle_group_id: string;
    muscle_group?: MuscleGroup; // Присоединённые данные
    exercise_type: ExerciseType;
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
    weight: number; // В kg
    reps: number;
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

/** Форматирует вес с единицей измерения */
export function formatWeight(weightKg: number, unit: UnitPreference): string {
    const converted = convertWeight(weightKg, unit);
    return `${converted.toFixed(1)} ${unit}`;
}
