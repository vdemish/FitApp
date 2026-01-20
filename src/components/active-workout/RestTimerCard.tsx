/**
 * RestTimerCard - Карточка таймера отдыха
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { GlassCard } from '@/components/ui';
import { typography, spacing, radius } from '@/theme';
import { useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';

export interface RestTimerCardProps {
    /** Time in seconds */
    seconds: number;
    /** Add time (+30 sec) */
    onAdd30: () => void;
    /** Subtract time (-10 sec) */
    onSubtract10: () => void;
    /** Skip rest */
    onSkip: () => void;
    /** ID for testing */
    testID?: string;
}

export function RestTimerCard({
    seconds,
    onAdd30,
    onSubtract10,
    onSkip,
    testID,
}: RestTimerCardProps) {
    const themeColors = useThemeColors();

    // Format MM:SS
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
        skipButton: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.error,
        },
        skipText: { color: themeColors.error },
    };

    return (
        <GlassCard
            glow
            testID={testID}
            style={StyleSheet.flatten([styles.container, dynamicStyles.container])}
        >
            <View style={styles.content}>
                {/* Info */}
                <View style={styles.timerInfo}>
                    <Text style={[styles.label, dynamicStyles.label]}>REST TIMER</Text>
                    <View style={styles.timeRow}>
                        <Text style={[styles.timeDigits, dynamicStyles.digits]}>{formattedMinutes}</Text>
                        <Text style={[styles.timeSeparator, dynamicStyles.separator]}>:</Text>
                        <Text style={[styles.timeDigits, dynamicStyles.accent]}>{formattedSeconds}</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                    <Pressable
                        testID={`${testID}-subtract-10`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            dynamicStyles.button,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onSubtract10();
                        }}
                    >
                        <Text style={[styles.buttonIcon, dynamicStyles.buttonIcon]}>-10</Text>
                    </Pressable>

                    <Pressable
                        testID={`${testID}-add-30`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            dynamicStyles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onAdd30();
                        }}
                    >
                        <Text style={[styles.buttonIcon, dynamicStyles.primaryIcon]}>+30</Text>
                    </Pressable>

                    <Pressable
                        testID={`${testID}-skip`}
                        style={({ pressed }) => [
                            styles.timerButton,
                            dynamicStyles.skipButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() => {
                            triggerSelection();
                            onSkip();
                        }}
                    >
                        <Text style={[styles.buttonIcon, dynamicStyles.skipText]}>Skip</Text>
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
});
