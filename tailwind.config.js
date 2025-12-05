/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0b1021',
        pitch: '#0f172a',
        accent: '#0ea5e9',
        gold: '#fbbf24',
      },
      boxShadow: {
        card: '0 12px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
