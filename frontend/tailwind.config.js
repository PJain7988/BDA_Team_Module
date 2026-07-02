// frontend/tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1f2937',
        accent: '#10b981',
        blue: {
          650: '#2563eb',
          705: '#1d4ed8',
          655: '#1e40af',
          850: '#172554',
        },
        slate: {
          750: '#1e293b',
        },
        gray: {
          250: '#e5e7eb',
          405: '#9ca3af',
          450: '#9ca3af',
          505: '#6b7280',
          850: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
