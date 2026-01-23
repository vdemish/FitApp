/**
 * Типографика FitApp для React Native
 * Значения в пикселях (React Native использует dp/sp автоматически)
 */
export const typography = {
    fontSize: {
        display: 48,  // Большие числа
        h1: 30,       // Заголовки страниц
        h2: 24,       // Заголовки секций
        h3: 18,       // Заголовки карточек
        body: 16,     // Основной текст
        bodySm: 14,   // Вторичный текст
        caption: 10,  // Подписи
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    letterSpacing: {
        caption: 0,
    },
    lineHeight: {
        tight: 1.1,
        normal: 1.5,
    },
} as const;
