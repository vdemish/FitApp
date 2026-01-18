/**
 * ============================================================================
 * STATS SERVICE
 * ============================================================================
 * Сервис для получения статистики пользователя
 */

import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface UserStats {
    totalWorkouts: number;
    currentWeight: number | null;
    weekStreak: number;
}

export interface VolumeDataPoint {
    date: string;
    volume: number;
}

// ============================================================================
// USER STATS
// ============================================================================

/**
 * Получает статистику пользователя
 */
export async function getUserStats(): Promise<UserStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalWorkouts: 0, currentWeight: null, weekStreak: 0 };

    // Получаем количество завершённых тренировок
    const { count: workoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

    // Получаем профиль пользователя для веса
    const { data: profile } = await supabase
        .from('users')
        .select('current_weight_kg')
        .eq('id', user.id)
        .single();

    // Вычисляем streak недель (упрощённая версия)
    const weekStreak = await calculateWeekStreak(user.id);

    return {
        totalWorkouts: workoutCount || 0,
        currentWeight: profile?.current_weight_kg || null,
        weekStreak,
    };
}

/**
 * Вычисляет streak недель (сколько недель подряд были тренировки)
 */
async function calculateWeekStreak(userId: string): Promise<number> {
    // Получаем последние 12 недель тренировок
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const { data: workouts } = await supabase
        .from('workouts')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', twelveWeeksAgo.toISOString())
        .order('completed_at', { ascending: false });

    if (!workouts || workouts.length === 0) return 0;

    // Группируем по неделям
    const weekSet = new Set<string>();
    workouts.forEach(w => {
        if (w.completed_at) {
            const date = new Date(w.completed_at);
            const weekStart = getWeekStart(date);
            weekSet.add(weekStart.toISOString().split('T')[0]);
        }
    });

    // Считаем последовательные недели
    let streak = 0;
    const currentWeekStart = getWeekStart(new Date());

    for (let i = 0; i < 12; i++) {
        const checkWeek = new Date(currentWeekStart);
        checkWeek.setDate(checkWeek.getDate() - (i * 7));
        const weekKey = checkWeek.toISOString().split('T')[0];

        if (weekSet.has(weekKey)) {
            streak++;
        } else if (i > 0) {
            // Если не текущая неделя и нет тренировки - streak прерван
            break;
        }
    }

    return streak;
}

/**
 * Получает начало недели (понедельник)
 */
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ============================================================================
// VOLUME STATS
// ============================================================================

/**
 * Получает данные объёма за последние N дней
 */
export async function getVolumeData(days = 30): Promise<VolumeDataPoint[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: workouts } = await supabase
        .from('workouts')
        .select('completed_at, total_volume')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at');

    if (!workouts) return [];

    // Группируем по дням
    const volumeByDate = new Map<string, number>();

    workouts.forEach(w => {
        if (w.completed_at && w.total_volume) {
            const dateKey = w.completed_at.split('T')[0];
            const current = volumeByDate.get(dateKey) || 0;
            volumeByDate.set(dateKey, current + Number(w.total_volume));
        }
    });

    return Array.from(volumeByDate.entries()).map(([date, volume]) => ({
        date,
        volume,
    }));
}

/**
 * Получает общий объём за период
 */
export async function getTotalVolume(days = 30): Promise<number> {
    const volumeData = await getVolumeData(days);
    return volumeData.reduce((sum, point) => sum + point.volume, 0);
}
