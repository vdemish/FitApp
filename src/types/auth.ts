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
    current_weight: number | null;
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
 * Полный тип контекста аутентификации
 */
export interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
    clearError: () => void;
}
