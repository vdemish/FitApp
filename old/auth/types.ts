/**
 * ============================================================================
 * ТИПЫ ДЛЯ МОДУЛЯ АУТЕНТИФИКАЦИИ
 * ============================================================================
 * 
 * Этот файл содержит TypeScript интерфейсы для системы аутентификации.
 * 
 * АРХИТЕКТУРА:
 * - UserProfile: Данные пользователя из таблицы public.users (расширенный профиль)
 * - AuthState: Состояние контекста аутентификации
 * - AuthContextType: Полный тип контекста с методами
 * 
 * РАСШИРЕНИЕ НА OAuth (Google/Apple):
 * При добавлении OAuth провайдеров интерфейсы не потребуют изменений,
 * так как Supabase возвращает единый User объект независимо от метода входа.
 * Дополнительные данные провайдера можно получить из user.app_metadata.
 */

import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

/**
 * Профиль пользователя из таблицы public.users
 * 
 * Эта таблица расширяет базовые данные auth.users дополнительными полями:
 * - subscription_tier: Уровень подписки (free/premium)
 * - current_weight: Текущий вес для отслеживания прогресса
 * - avatar_url: URL аватара (может быть из OAuth провайдера или загружен вручную)
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
 * 
 * user: Объект пользователя из Supabase Auth (null если не авторизован)
 * session: Текущая сессия с токенами (null если не авторизован)
 * profile: Расширенный профиль из public.users (null если не загружен)
 * loading: Флаг загрузки (true при инициализации и операциях)
 * error: Последняя ошибка аутентификации
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
 * 
 * Сейчас поддерживаются только 'google' и 'apple', но Supabase также
 * поддерживает: github, facebook, twitter, discord, twitch и др.
 * 
 * Для добавления нового провайдера:
 * 1. Добавить провайдер в этот union type
 * 2. Настроить провайдер в Supabase Dashboard (Authentication → Providers)
 * 3. Разкомментировать реализацию в authService.signInWithOAuth()
 */
export type OAuthProvider = 'google' | 'apple';

/**
 * Полный тип контекста аутентификации
 * 
 * Комбинирует состояние (AuthState) с методами для управления аутентификацией.
 * Все методы асинхронные и могут выбрасывать ошибки.
 */
export interface AuthContextType extends AuthState {
    // Вход с email/password
    signIn: (email: string, password: string) => Promise<void>;

    // Регистрация с email/password
    signUp: (email: string, password: string, fullName: string) => Promise<void>;

    // Выход из системы
    signOut: () => Promise<void>;

    // OAuth вход (заглушка, будет реализовано позже)
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;

    // Очистка ошибки
    clearError: () => void;
}
