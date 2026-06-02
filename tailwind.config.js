/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-red':  '#FF4D4D',
        'brand-cyan': '#00CFCF',
        'brand-acid': '#AAFF00',
        coral:  '#FF4D4D',
        cyan:   '#00CFCF',
        acid:   '#AAFF00',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #FF4D4D 0%, #00CFCF 50%, #AAFF00 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
