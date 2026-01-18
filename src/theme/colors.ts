/**
 * Цветовая палитра FitApp для React Native
 * TypeScript re-export from Single Source of Truth (colors.cjs)
 */

// Import from CommonJS source
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorsModule = require('./colors.cjs');

/**
 * Type definition for the colors object
 */
export interface ColorsType {
    readonly transparent: string;
    readonly black: string;
    readonly white: string;
    readonly primary: {
        readonly DEFAULT: string;
        readonly dark: string;
        readonly light: string;
    };
    readonly background: {
        readonly dark: string;
        readonly light: string;
    };
    readonly surface: {
        readonly dark: string;
        readonly light: string;
    };
    readonly accent: {
        readonly purple: string;
        readonly pink: string;
        readonly successLight: string;
    };
    readonly text: {
        readonly primary: {
            readonly dark: string;
            readonly light: string;
        };
        readonly secondary: {
            readonly dark: string;
            readonly light: string;
        };
        readonly muted: {
            readonly dark: string;
            readonly light: string;
        };
        readonly placeholder: string;
    };
    readonly success: string;
    readonly error: string;
    readonly border: {
        readonly dark: string;
        readonly light: string;
    };
    readonly subscription: {
        readonly highlight: string;
        readonly highlightBorder: string;
        readonly card: string;
        readonly cardBorder: string;
        readonly text: string;
    };
    readonly tabBar: {
        readonly inactive: {
            readonly dark: string;
            readonly light: string;
        };
        readonly background: {
            readonly dark: string;
            readonly light: string;
        };
        readonly border: {
            readonly dark: string;
            readonly light: string;
        };
    };
    readonly input: {
        readonly track: {
            readonly false: string;
            readonly true: string;
        };
        readonly thumb: string;
    };
}

/**
 * Export typed colors from Single Source of Truth
 */
export const colors: ColorsType = colorsModule.colors;
