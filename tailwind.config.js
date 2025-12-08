/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        surfaceHover: '#f8fafc',
        border: '#e5e7eb',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        accent: '#2563eb',
        night: '#ffffff',
        pitch: '#f8fafc',
        gold: '#0f172a',
        muted: '#475569',
      },
    },
  },
  plugins: [],
};
