/**
 * LoginScreen - Экран входа/регистрации
 * Redesigned with glassmorphism design system
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { GlassCard, Button, Input, Heading, Label } from '@/components/ui';
import { Text as UIText } from '@/components/ui/Text';
import { colors, typography, spacing, radius } from '@/theme';

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
        <View style={styles.container}>
            {/* Динамический фон с градиентными пятнами */}
            <View style={styles.backgroundContainer}>
                <View style={[styles.gradientBlob, styles.blobTopRight]} />
                <View style={[styles.gradientBlob, styles.blobBottomLeft]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Логотип и заголовок */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Text style={styles.logoIcon}>⚡</Text>
                            </View>
                            <Heading level={1}>
                                Fit<Text style={styles.accentText}>App</Text>
                            </Heading>
                            <UIText variant="body-sm" muted style={styles.subtitle}>
                                {mode === 'signIn' ? 'Войдите в свой аккаунт' : 'Создайте аккаунт для начала'}
                            </UIText>
                        </View>

                        {/* Форма */}
                        <GlassCard style={styles.formCard}>
                            <View style={styles.formContent}>
                                {/* Поле имени (только при регистрации) */}
                                {mode === 'signUp' && (
                                    <View style={styles.inputGroup}>
                                        <Label style={styles.inputLabel}>Ваше имя</Label>
                                        <Input
                                            icon="person"
                                            placeholder="Александр Иванов"
                                            value={fullName}
                                            onChangeText={setFullName}
                                            editable={!loading}
                                            autoCapitalize="words"
                                            testID="fullname-input"
                                        />
                                    </View>
                                )}

                                {/* Email */}
                                <View style={styles.inputGroup}>
                                    <Label style={styles.inputLabel}>Email</Label>
                                    <Input
                                        icon="mail"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!loading}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        testID="email-input"
                                    />
                                </View>

                                {/* Пароль */}
                                <View style={styles.inputGroup}>
                                    <Label style={styles.inputLabel}>Пароль</Label>
                                    <Input
                                        icon="lock"
                                        placeholder="Минимум 6 символов"
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        testID="password-input"
                                    />
                                </View>

                                {/* Ошибка */}
                                {error && (
                                    <View style={styles.errorContainer}>
                                        <UIText variant="body-sm" style={styles.errorText}>
                                            {error}
                                        </UIText>
                                    </View>
                                )}

                                {/* Кнопка отправки */}
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    glow
                                    disabled={!isValid}
                                    loading={loading}
                                    onPress={handleSubmit}
                                    testID="submit-button"
                                >
                                    {mode === 'signIn' ? 'Войти' : 'Создать аккаунт'}
                                </Button>

                                {/* Разделитель */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <UIText variant="caption" muted>ИЛИ</UIText>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* OAuth кнопки */}
                                <View style={styles.oauthButtons}>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        fullWidth
                                        onPress={() => { }}
                                        testID="google-button"
                                    >
                                        <Text style={styles.oauthIcon}>G</Text>
                                        <Text style={styles.oauthText}>Продолжить с Google</Text>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        fullWidth
                                        onPress={() => { }}
                                        testID="apple-button"
                                    >
                                        <Text style={styles.oauthIcon}></Text>
                                        <Text style={styles.oauthText}>Продолжить с Apple</Text>
                                    </Button>
                                </View>

                                {/* Переключение режима */}
                                <View style={styles.modeToggle}>
                                    <UIText variant="body-sm" muted>
                                        {mode === 'signIn' ? 'Ещё нет аккаунта?' : 'Уже есть аккаунт?'}
                                    </UIText>
                                    <Pressable onPress={toggleMode} disabled={loading}>
                                        <Text style={styles.modeToggleLink}>
                                            {mode === 'signIn' ? 'Создать' : 'Войти'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Подвал */}
                        <UIText variant="caption" muted style={styles.footer}>
                            Продолжая, вы соглашаетесь с условиями использования
                        </UIText>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.dark,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradientBlob: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
    },
    blobTopRight: {
        top: -100,
        right: -100,
        backgroundColor: `${colors.primary.DEFAULT}0D`, // 5% opacity
    },
    blobBottomLeft: {
        bottom: -100,
        left: -100,
        backgroundColor: `${colors.accent.purple}0D`, // 5% opacity
    },
    safeArea: {
        flex: 1,
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
        width: 80,
        height: 80,
        borderRadius: radius.xl,
        backgroundColor: colors.primary.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 25,
            },
            android: {
                elevation: 15,
            },
        }),
    },
    logoIcon: {
        fontSize: 40,
    },
    accentText: {
        color: colors.primary.DEFAULT,
    },
    subtitle: {
        marginTop: spacing.sm,
    },
    formCard: {
        marginBottom: spacing.lg,
    },
    formContent: {
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    errorContainer: {
        backgroundColor: `${colors.error}1A`, // 10% opacity
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: `${colors.error}33`, // 20% opacity
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border.dark,
    },
    oauthButtons: {
        gap: spacing.sm,
    },
    oauthIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
        color: colors.text.primary.dark,
    },
    oauthText: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.secondary.dark,
    },
    modeToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.lg,
    },
    modeToggleLink: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.DEFAULT,
    },
    footer: {
        textAlign: 'center',
    },
});
