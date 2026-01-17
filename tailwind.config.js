/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00c3ff',
          dark: '#0099cc',
          light: '#4F46E5',
        },
        background: {
          dark: '#090b1b',
          light: '#F0F4FF',
        },
        accent: {
          purple: '#a855f7',
          pink: '#F472B6',
        },
      },
    },
  },
  plugins: [],
};
