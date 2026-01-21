/**
 * NumericInput - Text input with select-all-on-focus behavior
 * Designed for fast data entry during workouts
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks';
import { typography, spacing, radius } from '@/theme';

interface NumericInputProps {
    /** Current value */
    value: number;
    /** Callback when value changes */
    onChange: (value: number) => void;
    /** Label displayed below the value (e.g., "KG", "REPS") */
    label?: string;
    /** Whether to allow decimals */
    allowDecimals?: boolean;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** ID for testing */
    testID?: string;
}

export function NumericInput({
    value,
    onChange,
    label,
    allowDecimals = false,
    min = 0,
    max = 9999,
    testID,
}: NumericInputProps) {
    const themeColors = useThemeColors();
    const inputRef = useRef<TextInput>(null);

    // Local string state for text input
    const [inputValue, setInputValue] = useState(
        allowDecimals ? value.toFixed(1) : value.toString()
    );
    const [isFocused, setIsFocused] = useState(false);

    // Handle focus - select all text
    const handleFocus = () => {
        setIsFocused(true);
        // Update input value to current value on focus
        setInputValue(allowDecimals ? value.toFixed(1) : value.toString());
        // Select all text after a brief delay (allows the input to render)
        setTimeout(() => {
            inputRef.current?.setSelection(0, inputValue.length + 10);
        }, 50);
    };

    // Handle blur - validate and commit value
    const handleBlur = () => {
        setIsFocused(false);
        let numValue = allowDecimals
            ? parseFloat(inputValue)
            : parseInt(inputValue, 10);

        // Handle NaN or invalid
        if (isNaN(numValue)) {
            numValue = 0;
        }

        // Clamp to min/max
        numValue = Math.max(min, Math.min(max, numValue));

        // Update parent
        onChange(numValue);

        // Update local state with formatted value
        setInputValue(allowDecimals ? numValue.toFixed(1) : numValue.toString());
    };

    // Handle text change
    const handleChangeText = (text: string) => {
        // Replace comma with period for locales that use comma as decimal separator
        const normalizedText = text.replace(',', '.');

        // Allow only numbers and optionally decimal point
        const regex = allowDecimals ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
        if (regex.test(normalizedText) || normalizedText === '') {
            setInputValue(normalizedText);
        }
    };

    // Sync with external value changes when not focused
    React.useEffect(() => {
        if (!isFocused) {
            setInputValue(allowDecimals ? value.toFixed(1) : value.toString());
        }
    }, [value, allowDecimals, isFocused]);

    return (
        <View style={styles.container}>
            <TextInput
                ref={inputRef}
                testID={testID}
                style={[
                    styles.input,
                    {
                        color: themeColors.textPrimary,
                        backgroundColor: isFocused
                            ? `${themeColors.primary}15`
                            : 'transparent',
                        borderColor: isFocused
                            ? themeColors.primary
                            : 'transparent',
                    },
                ]}
                value={inputValue}
                onChangeText={handleChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
                selectTextOnFocus={true}
                returnKeyType="done"
                maxLength={allowDecimals ? 6 : 4}
            />
            {label && (
                <Text style={[styles.label, { color: themeColors.textMuted }]}>
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        fontSize: typography.fontSize.h2,
        fontWeight: typography.fontWeight.bold,
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        minWidth: 60,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    label: {
        fontSize: 10,
        textTransform: 'uppercase',
        marginTop: 2,
    },
});
