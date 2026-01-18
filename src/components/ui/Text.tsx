/**
 * Text - Типографические компоненты
 * Heading, Text, Label для единообразия
 */

import React, { useMemo } from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { colors, typography } from '@/theme';
import { useThemeColors } from '@/hooks';

// ==========================================
// HEADING
// ==========================================

interface HeadingProps extends RNTextProps {
    /** Уровень заголовка */
    level?: 1 | 2 | 3;
    /** Акцентный цвет (primary) */
    accent?: boolean;
    children: React.ReactNode;
}

const headingStyles: Record<1 | 2 | 3, TextStyle> = {
    1: { fontSize: typography.fontSize.h1, fontWeight: typography.fontWeight.bold, letterSpacing: -0.5 },
    2: { fontSize: typography.fontSize.h2, fontWeight: typography.fontWeight.bold, letterSpacing: -0.3 },
    3: { fontSize: typography.fontSize.h3, fontWeight: typography.fontWeight.semibold },
};

export function Heading({
    level = 1,
    accent = false,
    style,
    children,
    ...props
}: HeadingProps) {
    const themeColors = useThemeColors();

    return (
        <RNText
            style={[
                headingStyles[level],
                { color: accent ? themeColors.primary : themeColors.textPrimary },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}

// ==========================================
// TEXT
// ==========================================

type TextVariant = 'display' | 'body' | 'body-sm' | 'caption';

interface TextComponentProps extends RNTextProps {
    /** Вариант текста */
    variant?: TextVariant;
    /** Приглушённый цвет */
    muted?: boolean;
    /** Акцентный цвет (primary) */
    accent?: boolean;
    /** Uppercase трансформация */
    uppercase?: boolean;
    children: React.ReactNode;
}

const textVariantStyles: Record<TextVariant, TextStyle> = {
    display: { fontSize: typography.fontSize.display, fontWeight: typography.fontWeight.bold },
    body: { fontSize: typography.fontSize.body },
    'body-sm': { fontSize: typography.fontSize.bodySm },
    caption: { fontSize: typography.fontSize.caption, fontWeight: typography.fontWeight.bold, letterSpacing: 2 },
};

export function Text({
    variant = 'body',
    muted = false,
    accent = false,
    uppercase = false,
    style,
    children,
    ...props
}: TextComponentProps) {
    const themeColors = useThemeColors();

    const textColor = useMemo((): string => {
        if (accent) return themeColors.primary;
        if (muted) return themeColors.textMuted;
        return themeColors.textSecondary;
    }, [accent, muted, themeColors]);

    return (
        <RNText
            style={[
                textVariantStyles[variant],
                { color: textColor },
                uppercase && styles.uppercase,
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}

// ==========================================
// LABEL
// ==========================================

interface LabelProps extends RNTextProps {
    children: React.ReactNode;
}

export function Label({ style, children, ...props }: LabelProps) {
    const themeColors = useThemeColors();

    return (
        <RNText
            style={[
                styles.label,
                { color: themeColors.textMuted },
                style
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}

const styles = StyleSheet.create({
    uppercase: {
        textTransform: 'uppercase',
    },
    label: {
        fontSize: typography.fontSize.caption,
        fontWeight: typography.fontWeight.bold,
        // color is set dynamically via themeColors.textMuted
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
