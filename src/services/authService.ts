/**
 * ============================================================================
 * СЕРВИС АУТЕНТИФИКАЦИИ (AUTH SERVICE)
 * ============================================================================
 * 
 * Модульная обёртка над Supabase Auth для централизованного управления
 * аутентификацией в приложении.
 */

import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import type { UserProfile, OAuthProvider } from '@/types/auth';

// ============================================================================
// РЕГИСТРАЦИЯ
// ============================================================================

/**
 * Регистрация нового пользователя с email и паролем
 */
export async function signUp(
    email: string,
    password: string,
    fullName: string
): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        throw new AuthServiceError(error.message, error);
    }

    if (!data.user) {
        throw new AuthServiceError('Регистрация не удалась: пользователь не создан');
    }

    return data.user;
}

// ============================================================================
// ВХОД
// ============================================================================

/**
 * Вход с email и паролем
 */
export async function signIn(
    email: string,
    password: string
): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new AuthServiceError(error.message, error);
    }

    if (!data.user) {
        throw new AuthServiceError('Вход не удался: пользователь не найден');
    }

    return data.user;
}

// ============================================================================
// ВЫХОД
// ============================================================================

/**
 * Выход из системы
 */
export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new AuthServiceError(error.message, error);
    }
}

// ============================================================================
// OAuth ВХОД (ЗАГЛУШКА)
// ============================================================================

/**
 * Вход через OAuth провайдера (Google/Apple)
 * 
 * ⚠️ СЕЙЧАС ЭТО ЗАГЛУШКА - выбрасывает ошибку "Не реализовано"
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
    console.warn(`[AuthService] OAuth вход через ${provider} ещё не реализован`);

    throw new AuthServiceError(
        `Вход через ${provider === 'google' ? 'Google' : 'Apple'} пока недоступен. Скоро появится!`
    );

    // TODO: Реализовать OAuth для React Native с expo-auth-session
    // Требует настройки deeplinks и redirect URLs
}

// ============================================================================
// ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

/**
 * Получить текущего пользователя из сессии
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.warn('[AuthService] Ошибка получения пользователя:', error.message);
        return null;
    }

    return user;
}

/**
 * Получить расширенный профиль пользователя из таблицы public.users
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.warn('[AuthService] Профиль пользователя не найден');
            return null;
        }
        throw new AuthServiceError(`Ошибка загрузки профиля: ${error.message}`, error);
    }

    return data as UserProfile;
}

// ============================================================================
// ПОДПИСКА НА ИЗМЕНЕНИЯ СОСТОЯНИЯ
// ============================================================================

/**
 * Подписаться на изменения состояния аутентификации
 */
export function onAuthStateChange(
    callback: (event: string, user: User | null) => void
): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(event, session?.user ?? null);
        }
    );

    return () => subscription.unsubscribe();
}

// ============================================================================
// КЛАСС ОШИБКИ
// ============================================================================

/**
 * Кастомный класс ошибки для сервиса аутентификации
 */
export class AuthServiceError extends Error {
    public readonly originalError?: AuthError | Error;

    constructor(message: string, originalError?: AuthError | Error) {
        super(message);
        this.name = 'AuthServiceError';
        this.originalError = originalError;
    }
}
