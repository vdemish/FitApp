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

    return (
        <View style={styles.container} testID={testID}>
            {/* Левая часть: метка и значение */}
            <View style={styles.valueContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{formattedValue}</Text>
            </View>

            {/* Правая часть: кнопки */}
            <View style={styles.buttonsContainer}>
                <Pressable
                    testID={`${testID}-decrement`}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleDecrement}
                >
                    <Text style={styles.buttonIcon}>−</Text>
                </Pressable>
                <Pressable
                    testID={`${testID}-increment`}
                    style={({ pressed }) => [
                        styles.button,
                        styles.incrementButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleIncrement}
                >
                    <Text style={[styles.buttonIcon, styles.incrementIcon]}>+</Text>
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
    },
    valueContainer: {
        flexDirection: 'column',
    },
    label: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.muted.dark,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    value: {
        fontSize: typography.fontSize.display,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary.dark,
        marginTop: 4,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface.dark,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border.dark,
        padding: 4,
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surface.dark,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    incrementButton: {
        borderWidth: 1,
        borderColor: `${colors.primary.DEFAULT}4D`, // 30% opacity
    },
    buttonPressed: {
        transform: [{ scale: 0.9 }],
    },
    buttonIcon: {
        fontSize: 32,
        fontWeight: '300',
        color: colors.text.muted.dark,
    },
    incrementIcon: {
        color: colors.primary.DEFAULT,
    },
});
