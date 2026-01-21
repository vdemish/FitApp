import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { NumericInput } from './NumericInput';
import { TimeInput, formatDuration } from './TimeInput';
import { Checkbox } from './Checkbox';
import { typography, spacing, radius } from '@/theme';
import { useThemeColors, useIsDarkTheme } from '@/hooks';
import { ExerciseTrackingType, getSetInputFields } from '@/types';
import { useSetTimer } from './useSetTimer';

interface SetRowProps {
    /** Set number (1-based) */
    setNumber: number;
    /** Exercise tracking type */
    trackingType: ExerciseTrackingType;
    /** Current weight value */
    weight: number;
    /** Current reps value */
    reps: number;
    /** Current distance value (for cardio) */
    distance?: number;
    /** Current duration in seconds (for timed exercises) */
    durationSeconds?: number;
    /** Whether the set is completed */
    isCompleted: boolean;
    /** Whether this is the current active set */
    isActive?: boolean;
    /** Whether the set inputs are disabled */
    disabled?: boolean;
    /** Callback when weight changes */
    onWeightChange: (value: number) => void;
    /** Callback when reps changes */
    onRepsChange: (value: number) => void;
    /** Callback when weight input is blurred */
    onWeightBlur?: (value: number) => void;
    /** Callback when reps input is blurred */
    onRepsBlur?: (value: number) => void;
    /** Callback when distance changes */
    onDistanceChange?: (value: number) => void;
    /** Callback when duration changes */
    onDurationChange?: (value: number) => void;
    /** Callback when completion is toggled */
    onToggleComplete: () => void;
    /** Previous best (e.g., "50kg × 12") */
    previousBest?: string;
    /** Weight unit label */
    weightUnit?: string;
    /** Distance unit label */
    distanceUnit?: string;
    /** ID for testing */
    testID?: string;
}

export function SetRow({
    setNumber,
    trackingType,
    weight,
    reps,
    distance = 0,
    durationSeconds = 0,
    isCompleted,
    isActive = false,
    disabled = false,
    onWeightChange,
    onRepsChange,
    onWeightBlur,
    onRepsBlur,
    onDistanceChange,
    onDurationChange,
    onToggleComplete,
    previousBest,
    weightUnit = 'kg',
    distanceUnit = 'km',
    testID,
}: SetRowProps) {
    const themeColors = useThemeColors();
    const isDark = useIsDarkTheme();

    // Timer hook integration
    const {
        isActive: isTimerActive,
        elapsed,
        remaining,
        mode,
        toggleTimer,
        finishTimer
    } = useSetTimer({
        initialDuration: durationSeconds,
        onComplete: () => {
            // Auto-complete set when countdown reaches 0
            // We don't trigger finishTimer here as we want the user to consciously finish/save?
            // Or maybe we do? Requirement says: "Mark set as complete. Logged Time = Target Time."
            // Let's rely on the user to see it finished or handle auto-complete logic in upcoming steps if verified.
            // For now, let's keep it manual finish or handle effect below.

            // Actually requirement says: "If the timer reaches 0 naturally: Mark set as complete."
            // So we should trigger completion.
            const finalTime = durationSeconds; // Target time
            if (onDurationChange) onDurationChange(finalTime);
            onToggleComplete();
        }
    });

    // Handle manual finish
    const handleFinishTimer = () => {
        const loggedTime = finishTimer();
        if (onDurationChange) onDurationChange(loggedTime);
        if (!isCompleted) {
            onToggleComplete();
        }
    };

    // Determine weight label based on tracking type
    const weightLabel = trackingType === 'weighted_bodyweight'
        ? `+${weightUnit.toUpperCase()}`
        : weightUnit.toUpperCase();

    const activeStyle = isActive
        ? {
            backgroundColor: `${themeColors.success}33`, // success with 20% opacity (approx) or 33 hex = ~20%
            borderColor: themeColors.success,
            borderWidth: 1,
        }
        : isTimerActive
            ? {
                borderColor: themeColors.success,
                borderWidth: 1,
                // backgroundColor: `${themeColors.success}15`, // optional for timer active
            }
            : {};

    const isTimerType = trackingType === 'duration' || trackingType === 'distance_duration';

    // Render inputs based on tracking type
    const renderInputs = () => {
        if (isTimerActive) {
            // Show active timer display instead of inputs when running
            const displayTime = mode === 'countdown' ? remaining : elapsed;

            return (
                <View style={[styles.timerDisplayContainer, { flex: 1 }]}>
                    <Text style={[styles.timerDisplayText, { color: themeColors.textPrimary }]}>
                        {formatDuration(displayTime)}
                    </Text>
                    {mode === 'countdown' && (
                        <Text style={[styles.timerLabelText, { color: themeColors.textMuted }]}>
                            REMAINING
                        </Text>
                    )}
                </View>
            );
        }

        switch (trackingType) {
            case 'weight_reps':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <NumericInput
                                value={weight}
                                onChange={onWeightChange}
                                onBlur={onWeightBlur}
                                // label={weightLabel}
                                allowDecimals={true}
                                max={500}
                                testID={`${testID}-weight`}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <NumericInput
                                value={reps}
                                onChange={onRepsChange}
                                onBlur={onRepsBlur}
                                // label="REPS"
                                allowDecimals={false}
                                max={999}
                                testID={`${testID}-reps`}
                            />
                        </View>
                    </>
                );

            case 'weighted_bodyweight':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <NumericInput
                                value={weight}
                                onChange={onWeightChange}
                                onBlur={onWeightBlur}
                                // label={weightLabel}
                                allowDecimals={true}
                                max={200}
                                testID={`${testID}-weight`}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <NumericInput
                                value={reps}
                                onChange={onRepsChange}
                                onBlur={onRepsBlur}
                                // label="REPS"
                                allowDecimals={false}
                                max={999}
                                testID={`${testID}-reps`}
                            />
                        </View>
                    </>
                );

            case 'duration':
                return (
                    <View style={styles.inputWrapperWide}>
                        <TimeInput
                            value={durationSeconds}
                            onChange={onDurationChange || (() => { })}
                            label="TIME"
                            title="Select Target Duration"
                            testID={`${testID}-duration`}
                        />
                    </View>
                );

            case 'distance_duration':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <NumericInput
                                value={distance}
                                onChange={onDistanceChange || (() => { })}
                                label={distanceUnit.toUpperCase()}
                                allowDecimals={true}
                                max={1000}
                                testID={`${testID}-distance`}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <TimeInput
                                value={durationSeconds}
                                onChange={onDurationChange || (() => { })}
                                label="TIME"
                                title="Select Target Duration"
                                testID={`${testID}-duration`}
                            />
                        </View>
                    </>
                );

            default:
                return null;
        }
    };

    const renderAction = () => {
        if (!isTimerType) {
            return (
                <Checkbox
                    checked={isCompleted}
                    onToggle={onToggleComplete}
                    testID={`${testID}-checkbox`}
                    disabled={disabled}
                />
            );
        }

        if (isCompleted) {
            // Already completed, allow un-completing (reset?) or just show simple checkbox-like state?
            // Use case says "Finish" acts as completion. If completed, maybe show a "Completed" state or a revert button.
            // For simplicity, let's show a checked checkbox to allow toggling off if mistake.
            return (
                <Checkbox
                    checked={true}
                    onToggle={onToggleComplete} // This will toggle it back to incomplete
                    testID={`${testID}-checkbox-completed`}
                />
            );
        }

        if (isTimerActive) {
            return (
                <TouchableOpacity
                    onPress={handleFinishTimer}
                    style={[styles.timerButton, { backgroundColor: themeColors.primary }]}
                >
                    <Text style={[styles.timerButtonText, { color: '#FFFFFF' }]}>
                        FINISH
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                onPress={() => toggleTimer(durationSeconds)}
                style={[styles.timerButton, { backgroundColor: themeColors.surface, borderColor: themeColors.primary, borderWidth: 1 }]}
            >
                <Text style={[styles.timerButtonText, { color: themeColors.primary }]}>
                    START
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View
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
                        borderColor: (isActive || isTimerActive) ? (isActive || isTimerActive ? themeColors.success : themeColors.primary) : themeColors.border,
                        backgroundColor: (isActive || isTimerActive)
                            ? (isActive ? themeColors.success : `${themeColors.success}15`)
                            : 'transparent',
                    },
                ]}
            >
                <Text
                    style={[
                        styles.setNumber,
                        {
                            color: (isActive || isTimerActive)
                                ? ((isActive && !isTimerActive) ? '#FFFFFF' : themeColors.success)
                                : themeColors.textSecondary,
                        },
                    ]}
                >
                    {setNumber}
                </Text>
            </View>

            {/* Previous Best (optional) */}
            {
                previousBest && (
                    <Text style={[styles.previousBest, { color: themeColors.textMuted }]}>
                        {previousBest}
                    </Text>
                )
            }

            {/* Dynamic Inputs */}
            {renderInputs()}

            {/* Completion Action (Checkbox or Timer Button) */}
            {renderAction()}
        </View >
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
        // Hide on small screens if needed, or adjust spacing
    },
    inputWrapper: {
        flex: 1,
        maxWidth: 120,
    },
    inputWrapperWide: {
        flex: 2,
        maxWidth: 200,
    },
    timerButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    timerButtonText: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
    },
    timerDisplayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerDisplayText: {
        fontSize: typography.fontSize.h2,
        fontWeight: typography.fontWeight.bold,
        fontVariant: ['tabular-nums'],
    },
    timerLabelText: {
        fontSize: 10,
        marginTop: 2,
    },
});
