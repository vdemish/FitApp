/**
 * RestTimerCard - Карточка таймера отдыха
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { GlassCard } from './ui/GlassCard';
import { typography, spacing, radius } from '@/theme';
import { useThemeColors } from '@/hooks';

interface RestTimerCardProps {
    /** Время в секундах */
    seconds: number;
    /** Добавить время (+10 сек) */
    onAdd?: () => void;
    /** Уменьшить время (-5 сек) */
    onSubtract?: () => void;
    /** Закрыть таймер */
    onClose?: () => void;
    /** ID для тестирования */
    testID?: string;
}

export function RestTimerCard({
    seconds,
    onAdd,
    onSubtract,
    onClose,
    testID,
}: RestTimerCardProps) {
    const themeColors = useThemeColors();

    // Форматирование MM:SS
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    // Dynamic styles
    const dynamicStyles = {
        container: {
            borderColor: `${themeColors.primary}33`,
            backgroundColor: themeColors.surface,
        },
        label: { color: themeColors.primary },
        digits: { color: themeColors.textPrimary },
        separator: { color: `${themeColors.primary}80` }, // 50% opacity
        accent: { color: themeColors.primary },
        button: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        buttonIcon: { color: themeColors.textSecondary },
        primaryButton: {
            backgroundColor: themeColors.primary,
            borderColor: themeColors.primary,
        },
        primaryIcon: { color: themeColors.background },
        closeIcon: { color: themeColors.textSecondary },
    };

    return (
        <GlassCard
            glow
            testID={testID}
            style={StyleSheet.flatten([styles.container, dynamicStyles.container])}
        >
            <View style={styles.content}>
                {/* Close Button */}
                {onClose && (
                    <Pressable
                        style={({ pressed }) => [styles.closeButton, pressed && styles.opacity50]}
                        onPress={onClose}
                        hitSlop={12}
                    >
                        <Text style={[styles.closeButtonText, dynamicStyles.closeIcon]}>✕</Text>
                    </Pressable>
                )}

                {/* Метка и время */}
                <View style={styles.timerInfo}>
                    <Text style={[styles.label, dynamicStyles.label]}>REST TIMER</Text>
                    <View style={styles.timeRow}>
                        <Text style={[styles.timeDigits, dynamicStyles.digits]}>{formattedMinutes}</Text>
                        <Text style={[styles.timeSeparator, dynamicStyles.separator]}>:</Text>
                        <Text style={[styles.timeDigits, dynamicStyles.accent]}>{formattedSeconds}</Text>
                    </View>
                </View>

                {/* Кнопки управления */}
                <View style={styles.buttonsRow}>
                    <Pressable
                        testID={`${testID}-subtract`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            dynamicStyles.button,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onSubtract}
                    >
                        <Text style={[styles.buttonIcon, dynamicStyles.buttonIcon]}>-10</Text>
                    </Pressable>
                    <Pressable
                        testID={`${testID}-add`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            dynamicStyles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onAdd}
                    >
                        <Text style={[styles.buttonIcon, dynamicStyles.primaryIcon]}>+10</Text>
                    </Pressable>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        borderRadius: radius.xl,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.lg,
    },
    timerInfo: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    label: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 2,
        marginBottom: 2,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeDigits: {
        fontSize: typography.fontSize.h2,
        fontWeight: typography.fontWeight.bold,
        fontVariant: ['tabular-nums'],
    },
    timeSeparator: {
        fontSize: typography.fontSize.h2,
        fontWeight: typography.fontWeight.bold,
        marginHorizontal: 1,
        marginBottom: 2,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
    },
    timerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
    },
    buttonIcon: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,
    },
    closeButton: {
        position: 'absolute',
        top: -spacing.sm,
        right: -spacing.sm,
        padding: spacing.xs,
        zIndex: 10,
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    opacity50: {
        opacity: 0.5,
    },
});
