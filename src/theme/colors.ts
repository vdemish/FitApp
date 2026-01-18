/**
 * Цветовая палитра FitApp для React Native
 */
export const colors = {
    // Core
    transparent: '#00000000',
    black: '#000000',
    white: '#FFFFFF',

    primary: {
        DEFAULT: '#00c3ff',
        dark: '#0099cc',
        light: '#4F46E5',
    },
    background: {
        dark: '#090b1b',
        light: '#F0F4FF',
    },
    surface: {
        dark: '#101423B3',      // rgba(16, 20, 35, 0.7)
        light: '#FFFFFF66',     // rgba(255, 255, 255, 0.4)
    },
    accent: {
        purple: '#a855f7',
        pink: '#F472B6',
    },
    text: {
        primary: {
            dark: '#ffffff',
            light: '#1e293b',
        },
        secondary: {
            dark: '#FFFFFF99',  // rgba(255, 255, 255, 0.6)
            light: '#64748b',
        },
        muted: {
            dark: '#FFFFFF66',  // rgba(255, 255, 255, 0.4)
            light: '#94a3b8',
        },
        placeholder: '#FFFFFF4D', // rgba(255, 255, 255, 0.3)
    },
    success: '#10b981',
    error: '#ef4444',
    border: {
        dark: '#FFFFFF1A',      // rgba(255, 255, 255, 0.1)
        light: '#E2E8F0',       // rgba(226, 232, 240, 1)
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
        inactive: '#FFFFFF66',      // rgba(255, 255, 255, 0.4)
        background: '#101423F2',    // rgba(16, 20, 35, 0.95)
        border: '#FFFFFF0D',        // rgba(255, 255, 255, 0.05)
    },
    input: {
        track: {
            false: '#1a1a2e',
            true: '#00c3ff',
        },
        thumb: '#FFFFFF',
    }
} as const;
