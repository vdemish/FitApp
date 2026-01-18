/**
 * Button - Кнопка с вариантами стилей
 * Variants: primary, secondary, ghost, icon
 */

import React, { useMemo } from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '@/hooks';
import { colors, typography, radius } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: React.ReactNode;
    /** Вариант стиля */
    variant?: ButtonVariant;
    /** Размер кнопки */
    size?: ButtonSize;
    /** Свечение вокруг кнопки */
    glow?: boolean;
    /** Растянуть на всю ширину */
    fullWidth?: boolean;
    /** Состояние недоступности */
    disabled?: boolean;
    /** Состояние загрузки */
    loading?: boolean;
    /** Обработчик нажатия */
    onPress?: () => void;
    /** Дополнительные стили контейнера */
    style?: ViewStyle;
    /** ID для тестирования */
    testID?: string;
}

// Размеры кнопок
const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
    sm: { height: 40, paddingHorizontal: 16, fontSize: 12, borderRadius: radius.lg },
    md: { height: 48, paddingHorizontal: 24, fontSize: 14, borderRadius: radius.xl },
    lg: { height: 56, paddingHorizontal: 32, fontSize: 16, borderRadius: radius.xl },
};

// Размеры для icon варианта
const iconSizeStyles: Record<ButtonSize, { size: number; borderRadius: number }> = {
    sm: { size: 40, borderRadius: radius.lg },
    md: { size: 48, borderRadius: radius.xl },
    lg: { size: 56, borderRadius: radius.xl },
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    glow = false,
    fullWidth = false,
    disabled = false,
    loading = false,
    onPress,
    style,
    testID,
}: ButtonProps) {
    const themeColors = useThemeColors();
    const isIcon = variant === 'icon';
    const sizeConfig = isIcon ? iconSizeStyles[size] : sizeStyles[size];

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        secondary: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        icon: {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
        },
        secondaryText: {
            color: themeColors.textSecondary,
        },
        ghostText: {
            color: themeColors.textSecondary,
        },
        iconText: {
            color: themeColors.textSecondary,
        },
    }), [themeColors]);

    // Get dynamic variant style
    const getDynamicVariantStyle = (): ViewStyle => {
        if (variant === 'secondary') return dynamicStyles.secondary;
        if (variant === 'icon') return dynamicStyles.icon;
        return {};
    };

    // Стили контейнера
    const containerStyles: ViewStyle[] = [
        styles.base,
        styles[variant],
        getDynamicVariantStyle(),
        isIcon
            ? { width: (sizeConfig as typeof iconSizeStyles.md).size, height: (sizeConfig as typeof iconSizeStyles.md).size, borderRadius: sizeConfig.borderRadius }
            : { height: (sizeConfig as typeof sizeStyles.md).height, paddingHorizontal: (sizeConfig as typeof sizeStyles.md).paddingHorizontal, borderRadius: sizeConfig.borderRadius },
        fullWidth ? styles.fullWidth : {},
        glow && variant === 'primary' ? styles.glow : {},
        disabled ? styles.disabled : {},
        style || {},
    ];

    // Get dynamic text style
    const getDynamicTextStyle = (): TextStyle => {
        if (variant === 'secondary') return dynamicStyles.secondaryText;
        if (variant === 'ghost') return dynamicStyles.ghostText;
        if (variant === 'icon') return dynamicStyles.iconText;
        return {};
    };

    // Стили текста
    const textStyles: TextStyle[] = [
        styles.text,
        styles[`${variant}Text` as keyof typeof styles] as TextStyle,
        getDynamicTextStyle(),
        !isIcon ? { fontSize: (sizeConfig as typeof sizeStyles.md).fontSize } : {},
    ].filter(Boolean) as TextStyle[];

    return (
        <Pressable
            testID={testID}
            style={({ pressed }) => [
                ...containerStyles,
                pressed && !disabled && styles.pressed,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? themeColors.background : colors.primary.DEFAULT}
                    size="small"
                />
            ) : (
                typeof children === 'string' ? (
                    <Text style={textStyles}>{children}</Text>
                ) : (
                    children
                )
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },

    // Варианты
    primary: {
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
    secondary: {
        // backgroundColor and borderColor are set dynamically
        borderWidth: 1,
    },
    ghost: {
        backgroundColor: colors.transparent,
    },
    icon: {
        // backgroundColor and borderColor are set dynamically
        borderWidth: 1,
    },

    // Свечение
    glow: {
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.DEFAULT,
                shadowOpacity: 0.5,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    // Текст
    text: {
        fontWeight: typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    primaryText: {
        color: colors.background.dark,
    },
    secondaryText: {
        // color is set dynamically
    },
    ghostText: {
        // color is set dynamically
    },
    iconText: {
        // color is set dynamically
    },
});
