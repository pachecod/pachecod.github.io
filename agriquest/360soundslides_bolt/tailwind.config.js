/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#0088FF',
        'primary-dark': '#0066CC',
        'primary-light': '#66B2FF',
        'overlay': 'rgba(0, 0, 0, 0.7)',
        'caption-bg': 'rgba(255, 255, 255, 0.9)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        pulse: 'hotspotPulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        hotspotPulse: {
          '0%': { opacity: 0.8 },
          '50%': { opacity: 1.0 },
          '100%': { opacity: 0.8 },
        },
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
};