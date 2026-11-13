/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#080B11',
          card: '#101522',
          surface: '#151C2C',
          hover: '#1B2438',
          border: '#232D42',
          subtle: '#2A364F',
          orange: {
            DEFAULT: '#F97316',
            hover: '#EA580C',
            light: '#FB923C',
            dark: '#C2410C',
            glow: 'rgba(249, 115, 22, 0.25)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-subtle': '0 0 15px -3px rgba(249, 115, 22, 0.15)',
        'premium-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

