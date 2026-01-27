/**
 * ============================================================================
 * ТИПЫ ДЛЯ МОДУЛЯ АУТЕНТИФИКАЦИИ
 * ============================================================================
 */

import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

/**
 * Профиль пользователя из таблицы public.users
 */
export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier: 'free' | 'premium';
    current_weight_kg: number | null;
    current_height_cm: number | null;
    unit_preference: 'kg' | 'lbs';
    age: number | null;
    gender: Gender | null;
    training_goal: TrainingGoal | null;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// СОСТОЯНИЕ АУТЕНТИФИКАЦИИ
// ============================================================================

/**
 * Состояние аутентификации в приложении
 */
export interface AuthState {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

// ============================================================================
// ТИП КОНТЕКСТА
// ============================================================================

/**
 * Провайдеры OAuth
 */
export type OAuthProvider = 'google' | 'apple';

/**
 * Пол пользователя
 */
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/**
 * Цель тренировок
 */
export type TrainingGoal =
    | 'lose_weight'
    | 'build_muscle'
    | 'maintain'
    | 'improve_endurance'
    | 'general_fitness';

/**
 * Данные для локального обновления профиля
 */
export interface ProfileUpdateData {
    full_name?: string | null;
    age?: number | null;
    gender?: Gender | null;
    training_goal?: TrainingGoal | null;
    current_weight_kg?: number | null;
    current_height_cm?: number | null;
}

/**
 * Полный тип контекста аутентификации
 */
export interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updateProfile: (updates: ProfileUpdateData) => Promise<void>;
    deleteAccount: () => Promise<void>;
    clearError: () => void;
}
