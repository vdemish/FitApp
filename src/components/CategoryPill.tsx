/**
 * CategoryPill - Кнопка-фильтр для категорий
 */

import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks';
import { colors, typography, radius } from '@/theme';

interface CategoryPillProps {
    /** Текст категории */
    label: string;
    /** Активное состояние */
    active?: boolean;
    /** Обработчик нажатия */
    onPress?: () => void;
    /** ID для тестирования */
    testID?: string;
}

export function CategoryPill({
    label,
    active = false,
    onPress,
    testID,
}: CategoryPillProps) {
    const themeColors = useThemeColors();

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        inactive: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        text: {
            color: themeColors.textSecondary,
        },
        activeText: {
            color: themeColors.background,
        },
    }), [themeColors]);

    return (
        <Pressable
            testID={testID}
            style={({ pressed }) => [
                styles.container,
                active ? styles.active : [styles.inactive, dynamicStyles.inactive],
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.text,
                dynamicStyles.text,
                active && dynamicStyles.activeText
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: radius.full,
    },
    active: {
        backgroundColor: colors.primary.DEFAULT,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    inactive: {
        borderWidth: 1,
        // backgroundColor and borderColor are set dynamically via dynamicStyles.inactive
    },
    pressed: {
        transform: [{ scale: 0.95 }],
    },
    text: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        // color is set dynamically via dynamicStyles.text
    },
});
