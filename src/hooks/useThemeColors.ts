/**
 * useThemeColors - Hook для получения цветов в зависимости от текущей темы
 */

import { useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { colors } from '@/theme/colors';

export interface ThemedColors {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryDark: string;
    success: string;
    error: string;
    accentPurple: string;
    accentPink: string;
}

/**
 * Returns colors based on current active theme (dark/light)
 */
export function useThemeColors(): ThemedColors {
    const { activeTheme } = useSettings();

    return useMemo(() => ({
        background: activeTheme === 'dark' ? colors.background.dark : colors.background.light,
        surface: activeTheme === 'dark' ? colors.surface.dark : colors.surface.light,
        textPrimary: activeTheme === 'dark' ? colors.text.primary.dark : colors.text.primary.light,
        textSecondary: activeTheme === 'dark' ? colors.text.secondary.dark : colors.text.secondary.light,
        textMuted: activeTheme === 'dark' ? colors.text.muted.dark : colors.text.muted.light,
        border: activeTheme === 'dark' ? colors.border.dark : colors.border.light,
        primary: colors.primary.DEFAULT,
        primaryDark: colors.primary.dark,
        success: colors.success,
        error: colors.error,
        accentPurple: colors.accent.purple,
        accentPink: colors.accent.pink,
    }), [activeTheme]);
}

/**
 * Hook to check if current theme is dark
 */
export function useIsDarkTheme(): boolean {
    const { activeTheme } = useSettings();
    return activeTheme === 'dark';
}
