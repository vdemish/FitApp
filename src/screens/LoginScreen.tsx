/**
 * LoginScreen - Экран входа/регистрации
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { colors, typography, spacing } from '@/theme';

type AuthMode = 'signIn' | 'signUp';

export function LoginScreen() {
    const { signIn, signUp, loading, error, clearError } = useAuth();

    const [mode, setMode] = useState<AuthMode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = async () => {
        try {
            if (mode === 'signIn') {
                await signIn(email, password);
            } else {
                await signUp(email, password, fullName);
            }
        } catch (e) {
            // Ошибка уже установлена в контексте
        }
    };

    const toggleMode = () => {
        clearError();
        setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    };

    const isValid = mode === 'signIn'
        ? email.length > 0 && password.length >= 6
        : email.length > 0 && password.length >= 6 && fullName.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoIcon}>⚡</Text>
                        </View>
                        <Text style={styles.title}>FitApp</Text>
                        <Text style={styles.subtitle}>
                            {mode === 'signIn' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {mode === 'signUp' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Имя</Text>
                                <TextInput
                                    style={styles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Ваше имя"
                                    placeholderTextColor={colors.text.muted.dark}
                                    autoCapitalize="words"
                                />
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor={colors.text.muted.dark}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Пароль</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Минимум 6 символов"
                                placeholderTextColor={colors.text.muted.dark}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Pressable
                            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={!isValid || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background.dark} />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {mode === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Toggle Mode */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {mode === 'signIn' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                        </Text>
                        <Pressable onPress={toggleMode}>
                            <Text style={styles.footerLink}>
                                {mode === 'signIn' ? 'Зарегистрироваться' : 'Войти'}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.dark,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: colors.primary.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 10,
    },
    logoIcon: {
        fontSize: 32,
    },
    title: {
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.body,
        color: colors.text.secondary.dark,
    },
    form: {
        marginBottom: spacing.xl,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.secondary.dark,
        marginBottom: spacing.xs,
    },
    input: {
        height: 48,
        backgroundColor: colors.surface.dark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.dark,
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.body,
        color: colors.text.primary.dark,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    errorText: {
        fontSize: typography.fontSize.bodySm,
        color: '#ef4444',
        textAlign: 'center',
    },
    submitButton: {
        height: 52,
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.bold,
        color: colors.background.dark,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
    footerText: {
        fontSize: typography.fontSize.bodySm,
        color: colors.text.muted.dark,
    },
    footerLink: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.DEFAULT,
    },
});
