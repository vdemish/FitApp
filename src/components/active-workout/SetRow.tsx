import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { WheelInput } from './WheelInput';
import { Checkbox } from './Checkbox';
import { colors, typography, spacing } from '@/theme';
import { useThemeColors, useIsDarkTheme } from '@/hooks';
import { getWeightItems, getRepsItems } from './pickerData';

interface SetRowProps {
    /** Set number (1-based) */
    setNumber: number;
    /** Current weight value */
    weight: number;
    /** Current reps value */
    reps: number;
    /** Whether the set is completed */
    isCompleted: boolean;
    /** Whether this is the current active set */
    isActive?: boolean;
    /** Callback when weight changes */
    onWeightChange: (value: number) => void;
    /** Callback when reps changes */
    onRepsChange: (value: number) => void;
    /** Callback when completion is toggled */
    onToggleComplete: () => void;
    /** Previous best (e.g., "50kg × 12") */
    previousBest?: string;
    /** Weight unit label */
    weightUnit?: string;
    /** ID for testing */
    testID?: string;
}

export function SetRow({
    setNumber,
    weight,
    reps,
    isCompleted,
    isActive = false,
    onWeightChange,
    onRepsChange,
    onToggleComplete,
    previousBest,
    weightUnit = 'kg',
    testID,
}: SetRowProps) {
    const themeColors = useThemeColors();
    const isDark = useIsDarkTheme();

    // Animation value for the pulse effect
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Memoize picker items to avoid regenerating on every render
    const weightItems = useMemo(() => getWeightItems(), []);
    const repsItems = useMemo(() => getRepsItems(), []);

    // Setup pulse animation
    useEffect(() => {
        if (isActive) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false, // false because we animate colors/shadows
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        } else {
            pulseAnim.setValue(0);
        }
    }, [isActive, pulseAnim]);

    // Interpolate values for animation
    const borderColor = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            themeColors.surface, // Start with surface color (invisible border effectively)
            isDark ? themeColors.primary : themeColors.primary, // Pulse to primary
        ],
    });

    // Shadow opacity for dark mode "glow"
    const shadowOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
    });

    const activeStyle = isActive
        ? {
            borderColor: borderColor,
            shadowColor: themeColors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isDark ? shadowOpacity : 0,
            shadowRadius: 10,
            elevation: 4, // Android elevation
            borderWidth: 1,
        }
        : {};

    return (
        <Animated.View
            testID={testID}
            style={[
                styles.container,
                { backgroundColor: themeColors.surface },
                isCompleted && styles.completedContainer,
                activeStyle,
            ]}
        >
            {/* Set Number Indicator */}
            <View
                style={[
                    styles.setIndicator,
                    {
                        borderColor: isActive ? themeColors.primary : themeColors.border,
                        backgroundColor: isActive
                            ? `${themeColors.primary}15`
                            : 'transparent',
                    },
                ]}
            >
                <Text
                    style={[
                        styles.setNumber,
                        {
                            color: isActive
                                ? themeColors.primary
                                : themeColors.textSecondary,
                        },
                    ]}
                >
                    {setNumber}
                </Text>
            </View>

            {/* Previous Best (optional) */}
            {previousBest && (
                <Text style={[styles.previousBest, { color: themeColors.textMuted }]}>
                    {previousBest}
                </Text>
            )}

            {/* Weight Input */}
            <View style={styles.inputWrapper}>
                <WheelInput
                    value={weight}
                    onChange={onWeightChange}
                    items={weightItems}
                    label={weightUnit.toUpperCase()}
                    title="Select Weight"
                    testID={`${testID}-weight`}
                />
            </View>

            {/* Reps Input */}
            <View style={styles.inputWrapper}>
                <WheelInput
                    value={reps}
                    onChange={onRepsChange}
                    items={repsItems}
                    label="REPS"
                    title="Select Reps"
                    testID={`${testID}-reps`}
                />
            </View>

            {/* Completion Checkbox */}
            <Checkbox
                checked={isCompleted}
                onToggle={onToggleComplete}
                testID={`${testID}-checkbox`}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        gap: spacing.xs,
        borderRadius: 12,
        // Default border width 0 to avoid layout shift when active adds border
        borderWidth: 1,
        borderColor: 'transparent',
    },
    completedContainer: {
        opacity: 0.6,
    },
    setIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setNumber: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.semibold,
    },
    previousBest: {
        fontSize: 10,
        fontWeight: typography.fontWeight.normal,
        minWidth: 50,
    },
    inputWrapper: {
        flex: 1,
        // Ensure inputs don't stretch too wide but fill space evenly
        maxWidth: 120,
    },
});

