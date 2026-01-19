/**
 * IncrementDecrementInput - Числовой ввод с большими +/- кнопками
 * Для WorkoutScreen (вес, повторения)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

interface IncrementDecrementInputProps {
    /** Текущее значение */
    value: number;
    /** Обработчик изменения */
    onChange: (value: number) => void;
    /** Шаг изменения */
    step?: number;
    /** Минимальное значение */
    min?: number;
    /** Максимальное значение */
    max?: number;
    /** Метка над значением */
    label: string;
    /** Показывать десятичные */
    decimals?: number;
    /** ID для тестирования */
    testID?: string;
}

export function IncrementDecrementInput({
    value,
    onChange,
    step = 1,
    min = 0,
    max = 999,
    label,
    decimals = 0,
    testID,
}: IncrementDecrementInputProps) {
    const handleDecrement = () => {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
    };

    const handleIncrement = () => {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
    };

    const formattedValue = decimals > 0 ? value.toFixed(decimals) : String(value);

    // Using theme colors directly instead of hardcoded styles
    // This component is now designed to be very compact (~32px height)

    return (
        <View style={styles.container} testID={testID}>
            {/* Value & Label */}
            <View style={styles.valueGroup}>
                <Text style={styles.value}>{formattedValue}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <Pressable
                    testID={`${testID}-decrement`}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleDecrement}
                    hitSlop={8}
                >
                    <Text style={styles.buttonIcon}>−</Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    testID={`${testID}-increment`}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleIncrement}
                    hitSlop={8}
                >
                    <Text style={styles.buttonIcon}>+</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 32,
    },
    valueGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: typography.fontSize.h3,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.light, // Will be overridden by theme in parent or usually correct
        fontVariant: ['tabular-nums'],
    },
    label: {
        fontSize: 10,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.muted.light,
        textTransform: 'uppercase',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(120, 120, 128, 0.12)', // Subtle background
        borderRadius: 8,
        height: 28,
    },
    button: {
        width: 32,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.5,
    },
    buttonIcon: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary.light, // Should ideally use theme context, but let's stick to simple for now or use colors.text.primary
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(120, 120, 128, 0.2)',
    },
});
