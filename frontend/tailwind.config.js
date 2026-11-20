/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5e0d0',
          300: '#9bcab0',
          400: '#6cae8d',
          500: '#489370',
          600: '#347659',
          700: '#2c5f48',
          800: '#254c3b',
          900: '#1b372b',
          950: '#0e1f18'
        },
        agricultural: {
          50: '#f6faee',
          100: '#e9f5d6',
          200: '#d5ebb2',
          300: '#b8dc84',
          400: '#99c95a',
          500: '#7cb03a',
          600: '#608c2a',
          700: '#496c23',
          800: '#3c5620',
          900: '#33481e'
        },
        cream: {
          50: '#fefdfa',
          100: '#fbf9f0',
          200: '#f5f0db',
          300: '#ebe1be',
          400: '#decd9a',
          500: '#cfb575'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
