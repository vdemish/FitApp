/**
 * GlassCard - Glassmorphism container component
 * Стеклянный контейнер с размытием и тенью
 */

import React, { useMemo } from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { colors, spacing, radius } from '@/theme';
import { useThemeColors, useIsDarkTheme } from '@/hooks';

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
    const themeColors = useThemeColors();
    const isDark = useIsDarkTheme();
    const accentColor = accentColors[accent];

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => {
        // iOS shadow - explicitly reset to 0 in light mode
        const shadowStyle = Platform.OS === 'ios' ? (isDark ? {
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.37,
            shadowRadius: 16,
        } : {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
        }) : {};

        // Android elevation
        const elevationStyle = Platform.OS === 'android' ? {
            elevation: isDark ? 8 : 0,
        } : {};

        return {
            container: {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                ...shadowStyle,
                ...elevationStyle,
            },
        };
    }, [themeColors, isDark]);

    const containerStyles: ViewStyle[] = [
        styles.container,
        dynamicStyles.container,
        glow && (isDark ? styles.glowDark : styles.glowLight),
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
        borderRadius: radius.xl,
        borderWidth: 1,
    },
    glowDark: {
        borderColor: `${colors.primary.DEFAULT}33`,
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
    glowLight: {
        borderColor: `${colors.primary.DEFAULT}33`,
        // No shadow in light mode, just border glow
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
});
