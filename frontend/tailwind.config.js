/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sport: {
          blue: '#1d4ed8',
          'blue-light': '#3b82f6',
          'blue-electric': '#2563eb',
          orange: '#ea580c',
          'orange-glow': '#f97316',
          amber: '#f59e0b',
          emerald: '#10b981',
          teal: '#0d9488',
          slate: '#0f172a',
          ice: '#f8fafc',
          card: '#ffffff'
        }
      },
      fontFamily: {
        sport: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sport-glow': '0 0 20px -3px rgba(37, 99, 235, 0.25)',
        'orange-glow': '0 0 20px -3px rgba(234, 88, 12, 0.35)',
        'athletic': '0 4px 20px -2px rgba(15, 23, 42, 0.08)'
      }
    },
  },
  plugins: [],
}
