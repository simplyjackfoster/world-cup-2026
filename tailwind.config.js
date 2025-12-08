/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#f8fafc',
        pitch: '#ffffff',
        accent: '#2563eb',
        gold: '#0f172a',
        border: '#e5e7eb',
        muted: '#475569',
      },
    },
  },
  plugins: [],
};
