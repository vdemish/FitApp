/**
 * NavItem - Элемент нижней навигации
 * Bottom tab navigation item with active state
 */

import React from 'react';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '@/theme';

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
    return (
        <Pressable
            testID={testID}
            style={styles.container}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                <Text style={[
                    styles.icon,
                    active && styles.iconActive,
                ]}>
                    {icon}
                </Text>
                {active && <View style={styles.activeDot} />}
            </View>
            <Text style={[
                styles.label,
                active && styles.labelActive,
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
        color: colors.text.muted.dark,
    },
    iconActive: {
        color: colors.primary.DEFAULT,
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
        color: colors.text.muted.dark,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
    },
    labelActive: {
        color: colors.primary.DEFAULT,
    },
});
