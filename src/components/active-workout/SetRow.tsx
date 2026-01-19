/**
 * SetRow - Horizontal row for a single workout set
 * Displays set number, previous best, weight/reps inputs, and completion checkbox
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IncrementDecrementInput } from '../IncrementDecrementInput';
import { Checkbox } from './Checkbox';
import { colors, typography, spacing } from '@/theme';
import { useThemeColors } from '@/hooks';

interface SetRowProps {
    /** Set number (1-based) */
    setNumber: number;
    /** Current weight value */
    weight: number;
    /** Current reps value */
    reps: number;
    /** Whether the set is completed */
    isCompleted: boolean;
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
    onWeightChange,
    onRepsChange,
    onToggleComplete,
    previousBest,
    weightUnit = 'kg',
    testID,
}: SetRowProps) {
    const themeColors = useThemeColors();

    return (
        <View
            testID={testID}
            style={[
                styles.container,
                { backgroundColor: themeColors.surface },
                isCompleted && styles.completedContainer,
            ]}
        >
            {/* Set Number Indicator */}
            <View style={[styles.setIndicator, { borderColor: themeColors.border }]}>
                <Text style={[styles.setNumber, { color: themeColors.textSecondary }]}>
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
                <IncrementDecrementInput
                    value={weight}
                    onChange={onWeightChange}
                    label={weightUnit.toUpperCase()}
                    step={2.5}
                    min={0}
                    max={500}
                    decimals={1}
                    testID={`${testID}-weight`}
                />
            </View>

            {/* Reps Input */}
            <View style={styles.inputWrapper}>
                <IncrementDecrementInput
                    value={reps}
                    onChange={onRepsChange}
                    label="REPS"
                    step={1}
                    min={0}
                    max={100}
                    testID={`${testID}-reps`}
                />
            </View>

            {/* Completion Checkbox */}
            <Checkbox
                checked={isCompleted}
                onToggle={onToggleComplete}
                testID={`${testID}-checkbox`}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        gap: spacing.sm,
        borderRadius: 12,
    },
    completedContainer: {
        opacity: 0.6,
    },
    setIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setNumber: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.semibold,
    },
    previousBest: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.normal,
        minWidth: 60,
    },
    inputWrapper: {
        flex: 1,
    },
});
