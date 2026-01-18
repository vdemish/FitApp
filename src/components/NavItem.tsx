/**
 * NavItem - Элемент нижней навигации
 * Bottom tab navigation item with active state
 */

import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { useThemeColors } from '@/hooks';

interface NavItemProps {
    /** Имя иконки (emoji или Material Symbol) */
    icon: string;
    /** Метка под иконкой */
    label: string;
    /** Активное состояние */
    active?: boolean;
    /** Обработчик нажатия */
    onPress?: () => void;
    /** ID для тестирования */
    testID?: string;
}

export function NavItem({
    icon,
    label,
    active = false,
    onPress,
    testID,
}: NavItemProps) {
    const themeColors = useThemeColors();

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        icon: {
            color: themeColors.textMuted,
        },
        iconActive: {
            color: themeColors.primary,
        },
        label: {
            color: themeColors.textMuted,
        },
        labelActive: {
            color: themeColors.primary,
        },
    }), [themeColors]);

    return (
        <Pressable
            testID={testID}
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                <Text style={[
                    styles.icon,
                    dynamicStyles.icon,
                    active && [styles.iconActive, dynamicStyles.iconActive],
                ]}>
                    {icon}
                </Text>
                {active && <View style={styles.activeDot} />}
            </View>
            <Text style={[
                styles.label,
                dynamicStyles.label,
                active && dynamicStyles.labelActive,
            ]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
    },
    iconContainer: {
        position: 'relative',
    },
    icon: {
        fontSize: 28,
    },
    iconActive: {
        transform: [{ scale: 1.1 }],
    },
    activeDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary.DEFAULT,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    label: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
    },
});
