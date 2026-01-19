/**
 * Checkbox - Large, gym-friendly checkbox component
 * For marking sets as completed in workout tracking
 */

import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { colors, sizes } from '@/theme';
import { useThemeColors } from '@/hooks';

interface CheckboxProps {
    /** Whether the checkbox is checked */
    checked: boolean;
    /** Callback when checkbox is toggled */
    onToggle: () => void;
    /** ID for testing */
    testID?: string;
}

export function Checkbox({ checked, onToggle, testID }: CheckboxProps) {
    const themeColors = useThemeColors();

    return (
        <Pressable
            testID={testID}
            onPress={onToggle}
            style={({ pressed }) => [
                styles.container,
                { borderColor: checked ? colors.primary.DEFAULT : themeColors.border },
                checked && styles.checked,
                pressed && styles.pressed,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
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
        width: sizes.touchTarget,
        height: sizes.touchTarget,
        borderRadius: sizes.touchTarget / 2,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checked: {
        backgroundColor: colors.primary.DEFAULT,
        borderColor: colors.primary.DEFAULT,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    pressed: {
        transform: [{ scale: 0.92 }],
        opacity: 0.8,
    },
    checkmarkContainer: {
        width: 18,
        height: 18,
        position: 'relative',
    },
    // Checkmark stem (the longer part)
    checkmarkStem: {
        position: 'absolute',
        width: 3,
        height: 12,
        backgroundColor: colors.white,
        borderRadius: 1.5,
        left: 10,
        top: 2,
        transform: [{ rotate: '45deg' }],
    },
    // Checkmark kick (the shorter part)
    checkmarkKick: {
        position: 'absolute',
        width: 3,
        height: 6,
        backgroundColor: colors.white,
        borderRadius: 1.5,
        left: 3,
        top: 8,
        transform: [{ rotate: '-45deg' }],
    },
});
