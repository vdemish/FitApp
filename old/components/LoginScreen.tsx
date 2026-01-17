/**
 * ============================================================================
 * ЭКРАН ВХОДА / РЕГИСТРАЦИИ (LOGIN SCREEN)
 * ============================================================================
 * 
 * Экран аутентификации с переключением между режимами входа и регистрации.
 * Использует компоненты дизайн-системы (GlassCard, Button, Input).
 * 
 * ФУНКЦИОНАЛ:
 * - Вход по email/password
 * - Регистрация с полным именем
 * - Кнопки OAuth (заглушки с сообщением "Скоро")
 * - Отображение ошибок
 * - Валидация формы
 */

import React, { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { GlassCard } from './GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Heading, Text, Label } from './ui/Text';

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const LoginScreen: React.FC = () => {
    // --------------------------------------------------------------------------
    // Состояние формы
    // --------------------------------------------------------------------------

    // Режим: вход или регистрация
    const [isSignUp, setIsSignUp] = useState(false);

    // Поля формы
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Локальная ошибка валидации
    const [validationError, setValidationError] = useState<string | null>(null);

    // --------------------------------------------------------------------------
    // Хук аутентификации
    // --------------------------------------------------------------------------

    const {
        signIn,
        signUp,
        signInWithOAuth,
        loading,
        error,
        clearError
    } = useAuth();

    // --------------------------------------------------------------------------
    // Переключение режима
    // --------------------------------------------------------------------------

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setValidationError(null);
        clearError();
    };

    // --------------------------------------------------------------------------
    // Валидация
    // --------------------------------------------------------------------------

    const validate = (): boolean => {
        if (!email.trim()) {
            setValidationError('Введите email');
            return false;
        }

        if (!email.includes('@')) {
            setValidationError('Некорректный email');
            return false;
        }

        if (password.length < 6) {
            setValidationError('Пароль должен быть минимум 6 символов');
            return false;
        }

        if (isSignUp && !fullName.trim()) {
            setValidationError('Введите ваше имя');
            return false;
        }

        setValidationError(null);
        return true;
    };

    // --------------------------------------------------------------------------
    // Отправка формы
    // --------------------------------------------------------------------------

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (isSignUp) {
                await signUp(email, password, fullName);
            } else {
                await signIn(email, password);
            }
            // При успехе App.tsx автоматически покажет главный экран
        } catch {
            // Ошибка уже обработана в контексте и доступна через error
        }
    };

    // --------------------------------------------------------------------------
    // OAuth обработчики
    // --------------------------------------------------------------------------

    const handleGoogleSignIn = async () => {
        try {
            await signInWithOAuth('google');
        } catch {
            // Ошибка обработана в контексте
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await signInWithOAuth('apple');
        } catch {
            // Ошибка обработана в контексте
        }
    };

    // --------------------------------------------------------------------------
    // Отображаемая ошибка (локальная валидация или серверная)
    // --------------------------------------------------------------------------

    const displayError = validationError || error;

    // --------------------------------------------------------------------------
    // РЕНДЕР
    // --------------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 selection:bg-primary selection:text-white">
            {/* Динамический фон */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 dark:bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-purple/20 dark:bg-accent-purple/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Логотип и заголовок */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30">
                        <span className="material-symbols-outlined text-5xl text-white dark:text-background-dark font-bold">
                            fitness_center
                        </span>
                    </div>
                    <Heading level={1}>
                        Fit<span className="text-primary">App</span>
                    </Heading>
                    <Text variant="body-sm" muted className="mt-2">
                        {isSignUp ? 'Создайте аккаунт для начала' : 'Войдите в свой аккаунт'}
                    </Text>
                </div>

                {/* Форма */}
                <GlassCard className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Поле имени (только при регистрации) */}
                        {isSignUp && (
                            <div>
                                <Label className="mb-2 block ml-1">Ваше имя</Label>
                                <Input
                                    icon="person"
                                    type="text"
                                    placeholder="Александр Иванов"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={loading}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <Label className="mb-2 block ml-1">Email</Label>
                            <Input
                                icon="mail"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        {/* Пароль */}
                        <div>
                            <Label className="mb-2 block ml-1">Пароль</Label>
                            <Input
                                icon="lock"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            />
                        </div>

                        {/* Ошибка */}
                        {displayError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <Text variant="body-sm" className="text-red-500 text-center">
                                    {displayError}
                                </Text>
                            </div>
                        )}

                        {/* Кнопка отправки */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={loading}
                            glow
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin">
                                    progress_activity
                                </span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">
                                        {isSignUp ? 'person_add' : 'login'}
                                    </span>
                                    {isSignUp ? 'Создать аккаунт' : 'Войти'}
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Разделитель */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                        <Text variant="caption" muted className="uppercase">или</Text>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                    </div>

                    {/* OAuth кнопки */}
                    <div className="space-y-3">
                        {/* Google */}
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Продолжить с Google
                        </Button>

                        {/* Apple */}
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={handleAppleSignIn}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Продолжить с Apple
                        </Button>
                    </div>

                    {/* Переключение режима */}
                    <div className="mt-6 text-center">
                        <Text variant="body-sm" muted>
                            {isSignUp ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'}
                        </Text>
                        <button
                            type="button"
                            onClick={toggleMode}
                            disabled={loading}
                            className="ml-2 text-primary font-bold hover:underline disabled:opacity-50"
                        >
                            {isSignUp ? 'Войти' : 'Создать'}
                        </button>
                    </div>
                </GlassCard>

                {/* Подвал */}
                <Text variant="caption" muted className="text-center mt-6 block">
                    Продолжая, вы соглашаетесь с условиями использования
                </Text>
            </div>
        </div>
    );
};
