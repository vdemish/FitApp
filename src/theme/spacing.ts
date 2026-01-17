/**
 * Spacing и размеры для React Native
 * Значения в пикселях
 */
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 28,
    full: 9999,
} as const;

export const sizes = {
    touchTarget: 44,    // Минимальный размер для тача
    iconButton: 40,     // Кнопки с иконками
    iconButtonLg: 48,   // Большие кнопки с иконками
    inputHeight: 48,    // Высота полей ввода
    buttonHeight: 48,   // Высота кнопок
    buttonHeightLg: 64, // Большие кнопки
} as const;
