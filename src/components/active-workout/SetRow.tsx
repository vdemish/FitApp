import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WheelInput } from './WheelInput';
import { Checkbox } from './Checkbox';
import { colors, typography, spacing } from '@/theme';
import { useThemeColors } from '@/hooks';
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

    // Memoize picker items to avoid regenerating on every render
    const weightItems = useMemo(() => getWeightItems(), []);
    const repsItems = useMemo(() => getRepsItems(), []);

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
        </View>
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

