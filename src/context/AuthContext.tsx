/**
 * ============================================================================
 * КОНТЕКСТ АУТЕНТИФИКАЦИИ (AUTH CONTEXT) - React Native
 * ============================================================================
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

import * as authService from '@/services/authService';
import type { AuthContextType, AuthState, OAuthProvider, ProfileUpdateData, UserProfile } from '@/types/auth';

// ============================================================================
// СОЗДАНИЕ КОНТЕКСТА
// ============================================================================

const initialState: AuthState = {
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// ПРОВАЙДЕР
// ============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>(initialState);

    // Загрузка профиля пользователя
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const profile = await authService.getUserProfile(userId);
            setState(prev => ({ ...prev, profile }));
        } catch (error) {
            console.error('[AuthContext] Ошибка загрузки профиля:', error);
        }
    }, []);

    // Инициализация и подписка на события
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const user = await authService.getCurrentUser();

                if (!mounted) return;

                if (user) {
                    setState(prev => ({ ...prev, user, loading: false }));
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
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, [loadProfile]);

    // Методы аутентификации
    const signIn = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signIn(email, password);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка входа';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, fullName: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signUp(email, password, fullName);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка регистрации';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const signOut = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.signOut();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка выхода';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, []);

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

    const updateEmail = useCallback(async (newEmail: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.updateEmail(newEmail);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка обновления email';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.resetPassword(email);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка сброса пароля';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.updatePassword(currentPassword, newPassword);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка обновления пароля';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const updateProfile = useCallback(async (updates: ProfileUpdateData) => {
        const now = new Date().toISOString();
        setState(prev => {
            const baseProfile: UserProfile = prev.profile ?? {
                id: prev.user?.id ?? 'local',
                full_name: null,
                avatar_url: null,
                subscription_tier: 'free',
                current_weight_kg: null,
                current_height_cm: null,
                unit_preference: 'kg',
                age: null,
                gender: null,
                training_goal: null,
                created_at: now,
                updated_at: now,
            };

            return {
                ...prev,
                profile: {
                    ...baseProfile,
                    ...updates,
                    updated_at: now,
                },
            };
        });
    }, []);

    const deleteAccount = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await authService.deleteAccount();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка удаления аккаунта';
            setState(prev => ({ ...prev, loading: false, error: message }));
            throw error;
        }
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        updateEmail,
        resetPassword,
        updatePassword,
        updateProfile,
        deleteAccount,
        clearError,
    }), [state, signIn, signUp, signOut, signInWithOAuth, updateEmail, resetPassword, updatePassword, updateProfile, deleteAccount, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// ХУК useAuth
// ============================================================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            '[useAuth] Хук должен использоваться внутри <AuthProvider>.'
        );
    }

    return context;
}
