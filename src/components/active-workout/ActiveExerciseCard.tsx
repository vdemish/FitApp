/**
 * ActiveExerciseCard - Card container for exercise sets during active workout
 * Displays exercise name, list of sets, and add set button
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { SetRow } from './SetRow';
import { typography, spacing } from '@/theme';
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

    // Dynamic styles
    const dynamicStyles = {
        exerciseName: { color: themeColors.textPrimary },
        menuButton: { backgroundColor: themeColors.surface },
        menuDot: { backgroundColor: themeColors.textMuted },
        columnLabel: { color: themeColors.textMuted },
        addSetButton: { borderColor: themeColors.border },
        addSetText: { color: themeColors.primary },
    };

    return (
        <GlassCard testID={testID} style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text
                    style={[styles.exerciseName, dynamicStyles.exerciseName]}
                    numberOfLines={2}
                >
                    {exerciseName}
                </Text>
                <Pressable
                    testID={`${testID}-menu`}
                    onPress={onMenuPress}
                    style={({ pressed }) => [
                        styles.menuButton,
                        dynamicStyles.menuButton,
                        pressed && styles.menuPressed,
                    ]}
                    accessibilityLabel="Exercise options"
                    accessibilityRole="button"
                >
                    <View style={styles.menuDotsContainer}>
                        <View style={[styles.menuDot, dynamicStyles.menuDot]} />
                        <View style={[styles.menuDot, dynamicStyles.menuDot]} />
                        <View style={[styles.menuDot, dynamicStyles.menuDot]} />
                    </View>
                </Pressable>
            </View>

            {/* Column Headers */}
            <View style={styles.columnHeaders}>
                <Text style={[styles.columnLabel, dynamicStyles.columnLabel]}>SET</Text>
                <Text style={[styles.columnLabel, dynamicStyles.columnLabel]}>PREVIOUS</Text>
                <Text style={[styles.columnLabel, styles.columnLabelFlex, dynamicStyles.columnLabel]}>
                    {weightUnit.toUpperCase()}
                </Text>
                <Text style={[styles.columnLabel, styles.columnLabelFlex, dynamicStyles.columnLabel]}>
                    REPS
                </Text>
                <Text style={[styles.columnLabel, dynamicStyles.columnLabel]}>✓</Text>
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
                    dynamicStyles.addSetButton,
                    pressed && styles.addSetPressed,
                ]}
            >
                <Text style={[styles.addSetText, dynamicStyles.addSetText]}>
                    + Add Set
                </Text>
            </Pressable>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.md, // Reduced from lg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing.sm, // Reduced from md
    },
    exerciseName: {
        fontSize: typography.fontSize.body, // Reduced from h3
        fontWeight: typography.fontWeight.bold,
        flex: 1,
        marginRight: spacing.sm,
    },
    menuButton: {
        width: 32, // Reduced from 36
        height: 32, // Reduced from 36
        borderRadius: 16,
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
        marginBottom: spacing.xs,
    },
    columnLabel: {
        fontSize: typography.fontSize.caption, // 12
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 0.5,
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
        paddingVertical: spacing.sm, // Reduced from md
        borderRadius: 8, // Reduced from 12
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
        fontSize: typography.fontSize.caption, // Reduced from body
        fontWeight: typography.fontWeight.semibold,
    },
});
