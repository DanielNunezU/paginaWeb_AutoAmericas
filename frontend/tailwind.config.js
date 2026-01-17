/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8e7',
          100: '#f9ecc3',
          200: '#f3d98a',
          300: '#e8c252',
          400: '#d4a84b',
          500: '#b8860b',
          600: '#9a7209',
          700: '#7c5c07',
          800: '#5e4506',
          900: '#3d2d04',
        },
        gold: {
          light: '#d4af37',
          DEFAULT: '#b8860b',
          dark: '#8b6914',
        },
      },
    },
  },
  plugins: [],
}
