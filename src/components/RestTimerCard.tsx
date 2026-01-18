/**
 * RestTimerCard - Карточка таймера отдыха
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { GlassCard } from './ui/GlassCard';
import { colors, typography, spacing, radius } from '@/theme';

interface RestTimerCardProps {
    /** Время в секундах */
    seconds: number;
    /** Добавить время (+10 сек) */
    onAdd?: () => void;
    /** Уменьшить время (-5 сек) */
    onSubtract?: () => void;
    /** ID для тестирования */
    testID?: string;
}

export function RestTimerCard({
    seconds,
    onAdd,
    onSubtract,
    testID,
}: RestTimerCardProps) {
    // Форматирование MM:SS
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    return (
        <GlassCard
            glow
            testID={testID}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Метка и время */}
                <View style={styles.timerInfo}>
                    <Text style={styles.label}>REST TIMER</Text>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeDigits}>{formattedMinutes}</Text>
                        <Text style={styles.timeSeparator}>:</Text>
                        <Text style={[styles.timeDigits, styles.accentDigits]}>{formattedSeconds}</Text>
                    </View>
                </View>

                {/* Кнопки управления */}
                <View style={styles.buttonsRow}>
                    <Pressable
                        testID={`${testID}-subtract`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onSubtract}
                    >
                        <Text style={styles.buttonIcon}>↺</Text>
                    </Pressable>
                    <Pressable
                        testID={`${testID}-add`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onAdd}
                    >
                        <Text style={[styles.buttonIcon, styles.primaryIcon]}>+10</Text>
                    </Pressable>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        borderColor: `${colors.primary.DEFAULT}33`, // 20% opacity
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timerInfo: {
        flexDirection: 'column',
    },
    label: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.DEFAULT,
        letterSpacing: 2,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    timeDigits: {
        fontSize: typography.fontSize.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
    },
    timeSeparator: {
        fontSize: typography.fontSize.h1,
        fontWeight: typography.fontWeight.bold,
        color: `${colors.primary.DEFAULT}80`, // 50% opacity
        marginHorizontal: 2,
    },
    accentDigits: {
        color: colors.primary.DEFAULT,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    timerButton: {
        width: 48,
        height: 48,
        borderRadius: radius.xl,
        backgroundColor: colors.surface.dark,
        borderWidth: 1,
        borderColor: colors.border.dark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    buttonPressed: {
        transform: [{ scale: 0.9 }],
        opacity: 0.8,
    },
    buttonIcon: {
        fontSize: 18,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.secondary.dark,
    },
    primaryIcon: {
        color: colors.background.dark,
        fontSize: 14,
    },
});
