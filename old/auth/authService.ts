/**
 * ============================================================================
 * СЕРВИС АУТЕНТИФИКАЦИИ (AUTH SERVICE)
 * ============================================================================
 * 
 * Модульная обёртка над Supabase Auth для централизованного управления
 * аутентификацией в приложении.
 * 
 * АРХИТЕКТУРА:
 * Все методы аутентификации вынесены в отдельный сервис для:
 * 1. Централизации логики (легко менять провайдера в будущем)
 * 2. Упрощения тестирования (можно мокировать весь сервис)
 * 3. Чистоты компонентов (не импортируют supabase напрямую)
 * 
 * ============================================================================
 * КАК ДОБАВИТЬ OAuth ПРОВАЙДЕРА (Google/Apple):
 * ============================================================================
 * 
 * 1. Настроить провайдер в Supabase Dashboard:
 *    - Перейти: Authentication → Providers → [Provider Name]
 *    - Включить провайдер и ввести client_id / client_secret
 *    
 * 2. Для Google:
 *    - Создать OAuth 2.0 клиент в Google Cloud Console
 *    - Добавить redirect URL: https://[your-project].supabase.co/auth/v1/callback
 *    
 * 3. Для Apple:
 *    - Настроить Sign in with Apple в Apple Developer Console
 *    - Создать Services ID и приватный ключ
 *    
 * 4. Раскомментировать код в методе signInWithOAuth ниже
 * 
 * ============================================================================
 */

import { supabase } from '../supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import type { UserProfile, OAuthProvider } from './types';

// ============================================================================
// РЕГИСТРАЦИЯ
// ============================================================================

/**
 * Регистрация нового пользователя с email и паролем
 * 
 * @param email - Email пользователя
 * @param password - Пароль (минимум 6 символов)
 * @param fullName - Полное имя для профиля
 * 
 * ВАЖНО: После успешной регистрации Supabase автоматически создаст запись
 * в public.users благодаря триггеру handle_new_user (см. миграции БД).
 * Имя передаётся через raw_user_meta_data и сохраняется триггером.
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
            // Передаём имя в метаданные - триггер БД сохранит его в public.users
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
 * 
 * @param email - Email пользователя
 * @param password - Пароль
 * 
 * После успешного входа Supabase автоматически:
 * 1. Установит сессию в localStorage
 * 2. Вызовет onAuthStateChange с событием SIGNED_IN
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
 * 
 * Удаляет сессию из localStorage и вызывает onAuthStateChange
 * с событием SIGNED_OUT.
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
 * 
 * @param provider - Провайдер OAuth ('google' | 'apple')
 * 
 * ============================================================================
 * КАК РЕАЛИЗОВАТЬ:
 * ============================================================================
 * 
 * 1. Настроить провайдер в Supabase Dashboard (см. инструкции выше)
 * 
 * 2. Раскомментировать код ниже:
 * 
 * ```typescript
 * const { data, error } = await supabase.auth.signInWithOAuth({
 *   provider,
 *   options: {
 *     // Redirect URL после успешной авторизации
 *     redirectTo: window.location.origin,
 *     
 *     // Для Google: запросить доступ к профилю
 *     // scopes: 'openid profile email',
 *     
 *     // Для Apple: запросить имя при первом входе
 *     // scopes: 'name email',
 *   },
 * });
 * 
 * if (error) {
 *   throw new AuthServiceError(error.message, error);
 * }
 * 
 * // Для OAuth браузер будет перенаправлен на страницу провайдера,
 * // поэтому здесь функция не возвращает user напрямую.
 * // После возврата onAuthStateChange получит событие SIGNED_IN.
 * ```
 * 
 * 3. Обновить UI кнопок OAuth в LoginScreen (убрать disabled)
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
    // TODO: Раскомментировать когда будут настроены OAuth провайдеры
    console.warn(`[AuthService] OAuth вход через ${provider} ещё не реализован`);

    throw new AuthServiceError(
        `Вход через ${provider === 'google' ? 'Google' : 'Apple'} пока недоступен. Скоро появится!`
    );

    // === РАСКОММЕНТИРОВАТЬ ДЛЯ ВКЛЮЧЕНИЯ OAuth ===
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider,
    //   options: {
    //     redirectTo: window.location.origin,
    //   },
    // });
    //
    // if (error) {
    //   throw new AuthServiceError(error.message, error);
    // }
}

// ============================================================================
// ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
// ============================================================================

/**
 * Получить текущего пользователя из сессии
 * 
 * Возвращает null если пользователь не авторизован.
 * Используется для проверки состояния при загрузке приложения.
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        // Ошибка "session not found" не критична - просто нет сессии
        console.warn('[AuthService] Ошибка получения пользователя:', error.message);
        return null;
    }

    return user;
}

/**
 * Получить расширенный профиль пользователя из таблицы public.users
 * 
 * @param userId - ID пользователя (из auth.users)
 * 
 * Возвращает null если профиль не найден (например, триггер не сработал).
 * В этом случае UI должен показать форму заполнения профиля.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        // Ошибка "row not found" не критична - профиль ещё не создан
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
 * 
 * @param callback - Функция, вызываемая при изменении состояния
 * @returns Функция отписки
 * 
 * События:
 * - SIGNED_IN: Пользователь вошёл (email/password или OAuth)
 * - SIGNED_OUT: Пользователь вышел
 * - TOKEN_REFRESHED: Токен обновлён (фоновое событие)
 * - USER_UPDATED: Данные пользователя обновлены
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
 * 
 * Позволяет отличать ошибки аутентификации от других ошибок
 * и сохраняет оригинальную ошибку Supabase для отладки.
 */
export class AuthServiceError extends Error {
    public readonly originalError?: AuthError | Error;

    constructor(message: string, originalError?: AuthError | Error) {
        super(message);
        this.name = 'AuthServiceError';
        this.originalError = originalError;
    }
}
