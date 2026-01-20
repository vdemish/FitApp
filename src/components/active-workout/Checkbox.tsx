/**
 * Checkbox - Large, gym-friendly checkbox component
 * For marking sets as completed in workout tracking
 */

import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { colors, sizes } from '@/theme';
import { useThemeColors } from '@/hooks';
import { triggerSelection } from '@/utils/haptics';

interface CheckboxProps {
    /** Whether the checkbox is checked */
    checked: boolean;
    /** Whether the checkbox is disabled */
    disabled?: boolean;
    /** Callback when checkbox is toggled */
    onToggle: () => void;
    /** ID for testing */
    testID?: string;
}

export function Checkbox({ checked, onToggle, testID, disabled = false }: CheckboxProps) {
    const themeColors = useThemeColors();

    return (
        <Pressable
            testID={testID}
            onPress={disabled ? undefined : () => {
                triggerSelection();
                onToggle();
            }}
            style={({ pressed }) => [
                styles.container,
                { borderColor: checked ? colors.primary.DEFAULT : themeColors.border },
                checked && styles.checked,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled }}
        >
            {checked && (
                <View style={styles.checkmarkContainer}>
                    <View style={styles.checkmarkStem} />
                    <View style={styles.checkmarkKick} />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 32, // Reduced from sizes.touchTarget (usually 44-48)
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checked: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
        // Removed heavy shadow for cleaner look
    },
    disabled: {
        opacity: 0.4,
    },
    pressed: {
        transform: [{ scale: 0.92 }],
        opacity: 0.8,
    },
    checkmarkContainer: {
        width: 14, // Scaled down
        height: 14,
        position: 'relative',
    },
    // Checkmark stem (the longer part)
    checkmarkStem: {
        position: 'absolute',
        width: 2.5,
        height: 10,
        backgroundColor: colors.white,
        borderRadius: 1.5,
        left: 8,
        top: 1,
        transform: [{ rotate: '45deg' }],
    },
    // Checkmark kick (the shorter part)
    checkmarkKick: {
        position: 'absolute',
        width: 2.5,
        height: 5,
        backgroundColor: colors.white,
        borderRadius: 1.5,
        left: 2,
        top: 6,
        transform: [{ rotate: '-45deg' }],
    },
});
