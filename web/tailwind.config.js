/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0E2A47', dark: '#0A1F36', light: '#1B3A5C' },
        gold: { DEFAULT: '#F5A623', dark: '#D98E12', light: '#FFBE55' },
        paper: '#FAF7F1',
        ink: '#1A2332',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
