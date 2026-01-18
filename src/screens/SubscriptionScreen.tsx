/**
 * ============================================================================
 * ЭКРАН ПОДПИСКИ (SubscriptionScreen)
 * ============================================================================
 * Заглушка с описанием Premium-функций
 * Кнопки: Upgrade, Restore, Cancel (все заглушки)
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks';
import { colors, typography, spacing, radius } from '@/theme';

// Список Premium-функций
const PREMIUM_FEATURES = [
    {
        icon: '📊',
        title: 'Расширенная аналитика',
        description: 'Детальные графики прогресса и статистика по всем упражнениям',
    },
    {
        icon: '🎯',
        title: 'Персональные программы',
        description: 'ИИ-тренер составит программу под ваши цели',
    },
    {
        icon: '🔔',
        title: 'Умные напоминания',
        description: 'Персонализированные напоминания о тренировках',
    },
    {
        icon: '☁️',
        title: 'Облачная синхронизация',
        description: 'Данные на всех ваших устройствах',
    },
    {
        icon: '🏋️',
        title: 'Безлимитные тренировки',
        description: 'Никаких ограничений на количество тренировок',
    },
    {
        icon: '🎨',
        title: 'Темы оформления',
        description: 'Выберите тему, которая вам нравится',
    },
];

export function SubscriptionScreen({ navigation }: any) {
    const { profile } = useAuth();
    const themeColors = useThemeColors();

    // Текущий статус подписки
    const isPremium = profile?.subscription_tier === 'premium';

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        container: { backgroundColor: themeColors.background },
        textPrimary: { color: themeColors.textPrimary },
        textSecondary: { color: themeColors.textSecondary },
        textMuted: { color: themeColors.textMuted },
        surface: { backgroundColor: themeColors.surface },
        border: { borderColor: themeColors.border },
    }), [themeColors]);

    // Обработчик покупки
    const handleUpgrade = () => {
        Alert.alert(
            'Premium',
            'Покупка подписки пока недоступна. Скоро появится!',
            [{ text: 'OK' }]
        );
    };

    // Обработчик восстановления
    const handleRestore = () => {
        Alert.alert(
            'Восстановление',
            'Функция восстановления покупок будет доступна позже',
            [{ text: 'OK' }]
        );
    };

    // Обработчик отмены подписки
    const handleCancel = () => {
        Alert.alert(
            'Отмена подписки',
            'Для отмены подписки перейдите в настройки App Store или Google Play',
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            {/* Шапка */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>← Назад</Text>
                </Pressable>
                <Text style={[styles.titleText, dynamicStyles.textPrimary]}>
                    Premium
                </Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Баннер статуса */}
                <View style={[
                    styles.statusBanner,
                    isPremium ? styles.statusBannerPremium : styles.statusBannerFree
                ]}>
                    <View style={styles.statusContent}>
                        <Text style={styles.statusIcon}>{isPremium ? '👑' : '⭐'}</Text>
                        <Text style={[styles.statusTitle, dynamicStyles.textPrimary]}>
                            {isPremium ? 'Premium активен' : 'Перейдите на Premium'}
                        </Text>
                        <Text style={[styles.statusDescription, dynamicStyles.textSecondary]}>
                            {isPremium
                                ? 'Вы уже пользуетесь всеми преимуществами'
                                : 'Разблокируйте все возможности приложения'
                            }
                        </Text>
                    </View>
                </View>

                {/* Список функций */}
                <Text style={[styles.sectionLabel, dynamicStyles.textMuted]}>
                    Premium-функции
                </Text>

                <View style={[styles.featuresCard, dynamicStyles.surface, dynamicStyles.border]}>
                    {PREMIUM_FEATURES.map((feature, index) => (
                        <View key={feature.title}>
                            <View style={styles.featureRow}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <View style={styles.featureInfo}>
                                    <Text style={[styles.featureTitle, dynamicStyles.textPrimary]}>
                                        {feature.title}
                                    </Text>
                                    <Text style={[styles.featureDescription, dynamicStyles.textMuted]}>
                                        {feature.description}
                                    </Text>
                                </View>
                                {isPremium && (
                                    <Text style={styles.checkIcon}>✓</Text>
                                )}
                            </View>
                            {index < PREMIUM_FEATURES.length - 1 && (
                                <View style={[styles.divider, dynamicStyles.border]} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Кнопки */}
                <View style={styles.buttonsContainer}>
                    {!isPremium && (
                        <Pressable
                            onPress={handleUpgrade}
                            style={styles.upgradeButton}
                        >
                            <Text style={styles.upgradeButtonText}>
                                Перейти на Premium — $9.99/мес
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleRestore}
                        style={[styles.restoreButton, dynamicStyles.surface, dynamicStyles.border]}
                    >
                        <Text style={[styles.restoreButtonText, dynamicStyles.textPrimary]}>
                            Восстановить покупки
                        </Text>
                    </Pressable>

                    {isPremium && (
                        <Pressable
                            onPress={handleCancel}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>
                                Отменить подписку
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Юридическая информация */}
                <Text style={styles.legalText}>
                    Подписка автоматически продлевается каждый месяц.{'\n'}
                    Вы можете отменить её в любое время через App Store или Google Play.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.dark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    backText: {
        color: colors.primary.DEFAULT,
        fontSize: typography.fontSize.body,
    },
    titleText: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
    },
    spacer: {
        width: 64,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    statusBanner: {
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    statusBannerPremium: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    statusBannerFree: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusContent: {
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    statusTitle: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
        color: colors.text.primary.dark,
    },
    statusDescription: {
        fontSize: typography.fontSize.body,
        textAlign: 'center',
        color: colors.text.secondary.dark,
    },
    sectionLabel: {
        fontSize: typography.fontSize.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        color: colors.text.muted.dark,
    },
    featuresCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface.dark,
        borderColor: colors.border.dark,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xs,
        color: colors.text.primary.dark,
    },
    featureDescription: {
        fontSize: typography.fontSize.bodySm,
        color: colors.text.muted.dark,
    },
    checkIcon: {
        fontSize: typography.fontSize.h3,
        color: colors.success,
    },
    divider: {
        height: 1,
        marginHorizontal: spacing.md,
        backgroundColor: colors.border.dark,
    },
    buttonsContainer: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    upgradeButton: {
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: colors.background.dark,
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.bold,
    },
    restoreButton: {
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: colors.surface.dark,
        borderColor: colors.border.dark,
    },
    restoreButtonText: {
        fontSize: typography.fontSize.body,
        color: colors.text.primary.dark,
    },
    cancelButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.error,
        fontSize: typography.fontSize.bodySm,
    },
    legalText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: typography.fontSize.caption,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: spacing.lg,
    },
});
