/**
 * Цветовая палитра FitApp
 * CommonJS version for Tailwind config compatibility
 * This is the Single Source of Truth for all colors
 */

const colors = {
    // Core
    transparent: '#00000000',
    black: '#000000',
    white: '#FFFFFF',

    primary: {
        DEFAULT: '#00c3ff', // Cyan для темной темы
        dark: '#0099cc',
        light: '#4f46e5',   // Indigo для светлой темы
    },
    background: {
        dark: '#090b1b',
        light: '#F3F7FF',   // Уточненный светлый фон
    },
    surface: {
        dark: '#111827',    // Более плотный цвет для карточек в Dark Mode
        light: '#FFFFFF',   // Чистый белый для Light Mode
    },
    accent: {
        purple: '#a855f7',
        pink: '#F472B6',
        successLight: '#d1fae5', // Фон для бейджа +12%
    },
    text: {
        primary: {
            dark: '#ffffff',
            light: '#1e293b',
        },
        secondary: {
            dark: '#FFFFFF99',
            light: '#64748b',
        },
        muted: {
            dark: '#FFFFFF66',
            light: '#94a3b8',
        },
        placeholder: '#FFFFFF4D',
    },
    success: '#10b981',
    error: '#ef4444',
    border: {
        dark: '#FFFFFF1A',
        light: '#E2E8F0',
    },

    // Feature Specific
    subscription: {
        highlight: '#F59E0B1A',       // rgba(245, 158, 11, 0.1)
        highlightBorder: '#F59E0B4D', // rgba(245, 158, 11, 0.3)
        card: '#FFFFFF0D',            // rgba(255, 255, 255, 0.05)
        cardBorder: '#FFFFFF1A',      // rgba(255, 255, 255, 0.1)
        text: '#FFFFFF4D',            // rgba(255, 255, 255, 0.3)
    },
    tabBar: {
        inactive: {
            dark: '#FFFFFF66',
            light: '#94a3b8',
        },
        background: {
            dark: '#101423F2',
            light: '#FFFFFF',
        },
        border: {
            dark: '#FFFFFF0D',
            light: '#E2E8F0',
        }
    },
    input: {
        track: {
            false: '#1a1a2e',
            true: '#00c3ff',
        },
        thumb: '#FFFFFF',
    }
};

module.exports = { colors };
