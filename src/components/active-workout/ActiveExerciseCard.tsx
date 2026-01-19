/**
 * ActiveExerciseCard - Card container for exercise sets during active workout
 * Displays exercise name, list of sets, and add set button
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { SetRow } from './SetRow';
import { colors, typography, spacing } from '@/theme';
import { useThemeColors } from '@/hooks';

/** Data structure for a single set */
export interface SetData {
    id: string;
    weight: number;
    reps: number;
    isCompleted: boolean;
    previousBest?: string;
}

interface ActiveExerciseCardProps {
    /** Name of the exercise */
    exerciseName: string;
    /** Array of sets */
    sets: SetData[];
    /** Callback to add a new set */
    onAddSet: () => void;
    /** Callback to remove a set */
    onRemoveSet?: (setId: string) => void;
    /** Callback when set values change */
    onSetChange?: (setId: string, field: 'weight' | 'reps', value: number) => void;
    /** Callback when set completion is toggled */
    onToggleComplete?: (setId: string) => void;
    /** Callback for menu button press */
    onMenuPress?: () => void;
    /** Weight unit label */
    weightUnit?: string;
    /** ID for testing */
    testID?: string;
}

export function ActiveExerciseCard({
    exerciseName,
    sets,
    onAddSet,
    onRemoveSet,
    onSetChange,
    onToggleComplete,
    onMenuPress,
    weightUnit = 'kg',
    testID,
}: ActiveExerciseCardProps) {
    const themeColors = useThemeColors();

    return (
        <GlassCard testID={testID} style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text
                    style={[styles.exerciseName, { color: themeColors.textPrimary }]}
                    numberOfLines={2}
                >
                    {exerciseName}
                </Text>
                <Pressable
                    testID={`${testID}-menu`}
                    onPress={onMenuPress}
                    style={({ pressed }) => [
                        styles.menuButton,
                        { backgroundColor: themeColors.surface },
                        pressed && styles.menuPressed,
                    ]}
                    accessibilityLabel="Exercise options"
                    accessibilityRole="button"
                >
                    <View style={styles.menuDotsContainer}>
                        <View style={[styles.menuDot, { backgroundColor: themeColors.textMuted }]} />
                        <View style={[styles.menuDot, { backgroundColor: themeColors.textMuted }]} />
                        <View style={[styles.menuDot, { backgroundColor: themeColors.textMuted }]} />
                    </View>
                </Pressable>
            </View>

            {/* Column Headers */}
            <View style={styles.columnHeaders}>
                <Text style={[styles.columnLabel, { color: themeColors.textMuted }]}>SET</Text>
                <Text style={[styles.columnLabel, { color: themeColors.textMuted }]}>PREVIOUS</Text>
                <Text style={[styles.columnLabel, styles.columnLabelFlex, { color: themeColors.textMuted }]}>
                    {weightUnit.toUpperCase()}
                </Text>
                <Text style={[styles.columnLabel, styles.columnLabelFlex, { color: themeColors.textMuted }]}>
                    REPS
                </Text>
                <Text style={[styles.columnLabel, { color: themeColors.textMuted }]}>✓</Text>
            </View>

            {/* Sets List */}
            <View style={styles.setsList}>
                {sets.map((set, index) => (
                    <SetRow
                        key={set.id}
                        setNumber={index + 1}
                        weight={set.weight}
                        reps={set.reps}
                        isCompleted={set.isCompleted}
                        previousBest={set.previousBest}
                        weightUnit={weightUnit}
                        onWeightChange={(value) => onSetChange?.(set.id, 'weight', value)}
                        onRepsChange={(value) => onSetChange?.(set.id, 'reps', value)}
                        onToggleComplete={() => onToggleComplete?.(set.id)}
                        testID={`${testID}-set-${index + 1}`}
                    />
                ))}
            </View>

            {/* Add Set Button */}
            <Pressable
                testID={`${testID}-add-set`}
                onPress={onAddSet}
                style={({ pressed }) => [
                    styles.addSetButton,
                    { borderColor: themeColors.border },
                    pressed && styles.addSetPressed,
                ]}
            >
                <Text style={[styles.addSetText, { color: colors.primary.DEFAULT }]}>
                    + Add Set
                </Text>
            </Pressable>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    exerciseName: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        flex: 1,
        marginRight: spacing.sm,
    },
    menuButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    menuDotsContainer: {
        gap: 3,
    },
    menuDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    columnHeaders: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
    },
    columnLabel: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 1,
        minWidth: 32,
        textAlign: 'center',
    },
    columnLabelFlex: {
        flex: 1,
    },
    setsList: {
        gap: spacing.xs,
    },
    addSetButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addSetPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    addSetText: {
        fontSize: typography.fontSize.body,
        fontWeight: typography.fontWeight.semibold,
    },
});
