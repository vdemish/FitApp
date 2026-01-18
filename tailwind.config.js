/** @type {import('tailwindcss').Config} */
const { colors } = require('./src/theme/colors.cjs');

module.exports = {
  darkMode: 'class',
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Import all colors from Single Source of Truth
        primary: colors.primary,
        background: colors.background,
        surface: colors.surface,
        accent: colors.accent,
        success: colors.success,
        error: colors.error,
        border: colors.border,
        // Flatten nested text colors for Tailwind utility classes
        'text-primary': colors.text.primary,
        'text-secondary': colors.text.secondary,
        'text-muted': colors.text.muted,
      },
    },
  },
  plugins: [],
};
