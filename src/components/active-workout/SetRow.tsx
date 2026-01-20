import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WheelInput } from './WheelInput';
import { TimeInput } from './TimeInput';
import { Checkbox } from './Checkbox';
import { typography, spacing } from '@/theme';
import { useThemeColors, useIsDarkTheme } from '@/hooks';
import { getWeightItems, getRepsItems, getDistanceItems } from './pickerData';
import { ExerciseTrackingType, getSetInputFields } from '@/types';

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

    // Get input field configuration based on tracking type
    const inputFields = getSetInputFields(trackingType);

    // Animation value for the pulse effect
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Memoize picker items to avoid regenerating on every render
    const weightItems = useMemo(() => getWeightItems(), []);
    const repsItems = useMemo(() => getRepsItems(), []);
    const distanceItems = useMemo(() => getDistanceItems(), []);

    // Determine weight label based on tracking type
    const weightLabel = trackingType === 'weighted_bodyweight'
        ? `+${weightUnit.toUpperCase()}`
        : weightUnit.toUpperCase();

    // Setup pulse animation
    useEffect(() => {
        if (isActive) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
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
            themeColors.surface,
            themeColors.primary,
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
            elevation: 4,
            borderWidth: 1,
        }
        : {};

    // Render inputs based on tracking type
    const renderInputs = () => {
        switch (trackingType) {
            case 'weight_reps':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <WheelInput
                                value={weight}
                                onChange={onWeightChange}
                                items={weightItems}
                                label={weightLabel}
                                title="Select Weight"
                                testID={`${testID}-weight`}
                            />
                        </View>
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
                    </>
                );

            case 'weighted_bodyweight':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <WheelInput
                                value={weight}
                                onChange={onWeightChange}
                                items={weightItems}
                                label={weightLabel}
                                title="Added Weight"
                                testID={`${testID}-weight`}
                            />
                        </View>
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
                    </>
                );

            case 'duration':
                return (
                    <View style={styles.inputWrapperWide}>
                        <TimeInput
                            value={durationSeconds}
                            onChange={onDurationChange || (() => { })}
                            label="TIME"
                            title="Select Duration"
                            testID={`${testID}-duration`}
                        />
                    </View>
                );

            case 'distance_duration':
                return (
                    <>
                        <View style={styles.inputWrapper}>
                            <WheelInput
                                value={distance}
                                onChange={onDistanceChange || (() => { })}
                                items={distanceItems}
                                label={distanceUnit.toUpperCase()}
                                title="Select Distance"
                                testID={`${testID}-distance`}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <TimeInput
                                value={durationSeconds}
                                onChange={onDurationChange || (() => { })}
                                label="TIME"
                                title="Select Duration"
                                testID={`${testID}-duration`}
                            />
                        </View>
                    </>
                );

            default:
                return null;
        }
    };

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

            {/* Dynamic Inputs */}
            {renderInputs()}

            {/* Completion Checkbox */}
            <Checkbox
                checked={isCompleted}
                onToggle={onToggleComplete}
                testID={`${testID}-checkbox`}
                disabled={disabled}
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
        maxWidth: 120,
    },
    inputWrapperWide: {
        flex: 2,
        maxWidth: 200,
    },
});
