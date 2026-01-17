/**
 * Design System Tokens
 * Central source of truth for all design values
 */

// == COLOR PALETTE ==
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
    border: {
        dark: 'rgba(255, 255, 255, 0.1)',
        light: 'rgba(226, 232, 240, 1)',
    },
} as const;

// == TYPOGRAPHY ==
export const typography = {
    fontFamily: {
        sans: "'Space Grotesk', sans-serif",
        display: "'Space Grotesk', sans-serif",
    },
    fontSize: {
        display: '3rem',      // 48px - Large numbers
        h1: '1.875rem',       // 30px - Page titles
        h2: '1.5rem',         // 24px - Section titles
        h3: '1.125rem',       // 18px - Card titles
        body: '1rem',         // 16px - Body text
        'body-sm': '0.875rem', // 14px - Secondary text
        caption: '0.625rem',  // 10px - Labels
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.1,
        normal: 1.5,
    },
    letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.1em',
        widest: '0.2em',
    },
} as const;

// == SPACING (4px baseline) ==
export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
} as const;

// == BORDER RADIUS ==
export const radius = {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '1.75rem', // 28px
    full: '9999px',
} as const;

// == EFFECTS ==
export const effects = {
    glass: {
        blur: 'blur(20px) saturate(180%)',
    },
    shadow: {
        light: '0 8px 32px rgba(0, 0, 0, 0.05)',
        dark: '0 8px 32px rgba(0, 0, 0, 0.37)',
        primary: '0 0 25px rgba(0, 195, 255, 0.4)',
    },
    transition: {
        fast: '150ms ease',
        normal: '300ms ease',
        slow: '500ms ease',
    },
} as const;

// == COMPONENT SIZES ==
export const sizes = {
    touchTarget: '44px',      // Minimum touch target
    iconButton: '40px',       // Icon-only buttons
    iconButtonLg: '48px',     // Large icon buttons
    inputHeight: '48px',      // Standard input height
    buttonHeight: '48px',     // Standard button height
    buttonHeightLg: '64px',   // Large buttons (workout screen)
} as const;

// == TAILWIND CLASS HELPERS ==
// Use these when you need to compose Tailwind classes dynamically

export const tw = {
    // Glass effect
    glass: 'backdrop-blur-[20px] backdrop-saturate-[180%]',

    // Text colors
    textPrimary: 'text-slate-800 dark:text-white',
    textSecondary: 'text-slate-500 dark:text-white/60',
    textMuted: 'text-slate-400 dark:text-white/40',

    // Background
    bgSurface: 'bg-white/40 dark:bg-[#101423]/70',
    bgMuted: 'bg-slate-100 dark:bg-white/5',

    // Borders
    border: 'border-slate-200 dark:border-white/10',

    // Focus states
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary/30',

    // Interactive states
    interactive: 'active:scale-[0.98] transition-transform',
} as const;
