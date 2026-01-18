/**
 * GlassCard - Glassmorphism container component
 * Стеклянный контейнер с размытием и тенью
 */

import React from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { colors, spacing, radius } from '@/theme';

// Типы акцентной полосы
type AccentType = 'primary' | 'success' | 'purple' | 'none';

interface GlassCardProps {
    children: React.ReactNode;
    /** Добавляет свечение вокруг карточки */
    glow?: boolean;
    /** Цветная полоса слева */
    accent?: AccentType;
    /** Дополнительные стили */
    style?: ViewStyle;
    /** Обработчик нажатия */
    onPress?: () => void;
    /** ID для тестирования */
    testID?: string;
}

// Цвета акцентной полосы
const accentColors: Record<AccentType, string | null> = {
    primary: colors.primary.DEFAULT,
    success: colors.success,
    purple: colors.accent.purple,
    none: null,
};

export function GlassCard({
    children,
    glow = false,
    accent = 'none',
    style,
    onPress,
    testID,
}: GlassCardProps) {
    const accentColor = accentColors[accent];

    const containerStyles: ViewStyle[] = [
        styles.container,
        glow && styles.glow,
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
        style,
    ].filter(Boolean) as ViewStyle[];

    // Если есть onPress, используем Pressable
    if (onPress) {
        return (
            <Pressable
                testID={testID}
                style={({ pressed }) => [
                    ...containerStyles,
                    pressed && styles.pressed,
                ]}
                onPress={onPress}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <View testID={testID} style={containerStyles}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface.dark,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.dark,
        // Эмуляция стекла через тень на iOS
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.37,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    glow: {
        borderColor: `${colors.primary.DEFAULT}33`, // 20% opacity
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOpacity: 0.4,
                shadowRadius: 25,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
});
