/**
 * CategoryPill - Кнопка-фильтр для категорий
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
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
    return (
        <Pressable
            testID={testID}
            style={({ pressed }) => [
                styles.container,
                active ? styles.active : styles.inactive,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, active && styles.activeText]}>
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
        backgroundColor: colors.surface.dark,
        borderWidth: 1,
        borderColor: colors.border.dark,
    },
    pressed: {
        transform: [{ scale: 0.95 }],
    },
    text: {
        fontSize: typography.fontSize.bodySm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.secondary.dark,
    },
    activeText: {
        color: colors.background.dark,
    },
});
