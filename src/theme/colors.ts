/**
 * Цветовая палитра FitApp для React Native
 */
export const colors = {
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
        dark: 'rgba(16, 20, 35, 0.7)',
        light: 'rgba(255, 255, 255, 0.4)',
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
            dark: 'rgba(255, 255, 255, 0.6)',
            light: '#64748b',
        },
        muted: {
            dark: 'rgba(255, 255, 255, 0.4)',
            light: '#94a3b8',
        },
    },
    success: '#10b981',
    error: '#ef4444',
    border: {
        dark: 'rgba(255, 255, 255, 0.1)',
        light: 'rgba(226, 232, 240, 1)',
    },
} as const;
