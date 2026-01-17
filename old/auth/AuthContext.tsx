/**
 * ============================================================================
 * КОНТЕКСТ АУТЕНТИФИКАЦИИ (AUTH CONTEXT)
 * ============================================================================
 * 
 * React Context для управления состоянием аутентификации во всём приложении.
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * 1. Обернуть приложение в <AuthProvider> в index.tsx
 * 2. Использовать хук useAuth() в любом компоненте
 * 
 * ПРИМЕР:
 * ```tsx
 * const { user, profile, loading, signIn, signOut } = useAuth();
 * 
 * if (loading) return <Loader />;
 * if (!user) return <LoginScreen />;
 * 
 * return <div>Привет, {profile?.full_name}!</div>;
 * ```
 * 
 * АРХИТЕКТУРА:
 * - AuthProvider слушает изменения состояния через onAuthStateChange
 * - При входе автоматически загружается профиль из public.users
 * - Все методы (signIn, signUp, signOut) доступны через контекст
 * - loading=true при инициализации и любых операциях аутентификации
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode
} from 'react';

import * as authService from './authService';
import type { AuthContextType, AuthState, OAuthProvider } from './types';

// ============================================================================
// СОЗДАНИЕ КОНТЕКСТА
// ============================================================================

/**
 * Начальное состояние контекста
 * 
 * loading: true - приложение проверяет есть ли сохранённая сессия
 * Все остальные поля null/пустые до проверки
 */
const initialState: AuthState = {
    user: null,
    session: null,
    profile: null,
    loading: true, // Важно: начинаем с loading=true для проверки сессии
    error: null,
};

/**
 * Контекст аутентификации
 * 
 * undefined используется как значение по умолчанию чтобы отловить
 * использование useAuth вне AuthProvider (выбросит ошибку).
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// ПРОВАЙДЕР
// ============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Провайдер контекста аутентификации
 * 
 * Должен оборачивать всё приложение для предоставления доступа
 * к состоянию и методам аутентификации.
 * 
 * ЖИЗНЕННЫЙ ЦИКЛ:
 * 1. При монтировании проверяет текущую сессию (getCurrentUser)
 * 2. Подписывается на изменения состояния (onAuthStateChange)
 * 3. При входе загружает профиль пользователя
 * 4. При размонтировании отписывается от событий
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>(initialState);

    // --------------------------------------------------------------------------
    // Загрузка профиля пользователя
    // --------------------------------------------------------------------------

    /**
     * Загрузить профиль из public.users
     * 
     * Вызывается автоматически при входе пользователя.
     * Если профиль не найден - не критично, пользователь может продолжить,
     * но UI должен предложить заполнить профиль.
     */
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const profile = await authService.getUserProfile(userId);
            setState(prev => ({ ...prev, profile }));
        } catch (error) {
            console.error('[AuthContext] Ошибка загрузки профиля:', error);
            // Не выбрасываем ошибку - профиль необязателен для работы приложения
        }
    }, []);

    // --------------------------------------------------------------------------
    // Инициализация и подписка на события
    // --------------------------------------------------------------------------

    useEffect(() => {
        let mounted = true;

        /**
         * Проверить текущую сессию при загрузке приложения
         * 
         * Если пользователь ранее входил и сессия действительна,
         * он автоматически будет авторизован.
         */
        const initAuth = async () => {
            try {
                const user = await authService.getCurrentUser();

                if (!mounted) return;

                if (user) {
                    setState(prev => ({ ...prev, user, loading: false }));
                    // Загружаем профиль после установки user
                    await loadProfile(user.id);
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('[AuthContext] Ошибка инициализации:', error);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Ошибка проверки авторизации'
                    }));
                }
            }
        };

        initAuth();

        /**
         * Подписка на изменения состояния аутентификации
         * 
         * События:
         * - SIGNED_IN: загружаем профиль
         * - SIGNED_OUT: очищаем состояние  
         * - TOKEN_REFRESHED: игнорируем (фоновое обновление)
         */
        const unsubscribe = authService.onAuthStateChange(async (event, user) => {
            if (!mounted) return;

            console.log('[AuthContext] Событие аутентификации:', event);

            switch (event) {
                case 'SIGNED_IN':
                    if (user) {
                        setState(prev => ({ ...prev, user, error: null }));
                        await loadProfile(user.id);
                    }
                    break;

                case 'SIGNED_OUT':
                    setState({
                        user: null,
                        session: null,
                        profile: null,
                        loading: false,
                        error: null,
                    });
                    break;

                case 'USER_UPDATED':
                    if (user) {
                        setState(prev => ({ ...prev, user }));
                    }
                    break;

                // TOKEN_REFRESHED - игнорируем, это фоновое событие
            }
        });

        // Очистка при размонтировании
        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [loadProfile]);

    // --------------------------------------------------------------------------
    // Методы аутентификации
    // --------------------------------------------------------------------------

    /**
     * Вход с email и паролем
     */
    const signIn = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signIn(email, password);
            // Состояние обновится через onAuthStateChange
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка входа';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    /**
     * Регистрация с email и паролем
     */
    const signUp = useCallback(async (email: string, password: string, fullName: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signUp(email, password, fullName);
            // Состояние обновится через onAuthStateChange
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка регистрации';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    /**
     * Выход из системы
     */
    const signOut = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signOut();
            // Состояние обновится через onAuthStateChange
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка выхода';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, []);

    /**
     * Вход через OAuth (заглушка)
     */
    const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signInWithOAuth(provider);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'OAuth недоступен';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, []);

    /**
     * Очистка ошибки
     */
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // --------------------------------------------------------------------------
    // Мемоизация значения контекста
    // --------------------------------------------------------------------------

    const value = useMemo<AuthContextType>(() => ({
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        clearError,
    }), [state, signIn, signUp, signOut, signInWithOAuth, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// ХУК useAuth
// ============================================================================

/**
 * Хук для доступа к контексту аутентификации
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * ```tsx
 * const { user, profile, loading, signIn, signOut, error } = useAuth();
 * ```
 * 
 * ВОЗВРАЩАЕТ:
 * - user: Объект пользователя Supabase (или null)
 * - profile: Расширенный профиль из public.users (или null)
 * - loading: Флаг загрузки
 * - error: Последняя ошибка (или null)
 * - signIn(email, password): Функция входа
 * - signUp(email, password, fullName): Функция регистрации
 * - signOut(): Функция выхода
 * - signInWithOAuth(provider): Функция OAuth (заглушка)
 * - clearError(): Очистить ошибку
 * 
 * @throws Ошибка если используется вне AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            '[useAuth] Хук должен использоваться внутри <AuthProvider>. ' +
            'Убедитесь, что App обёрнут в AuthProvider в index.tsx'
        );
    }

    return context;
}
