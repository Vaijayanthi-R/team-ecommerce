/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C63FF', dark: '#5A52D5' },
        accent:  { DEFAULT: '#FF6584', dark: '#E5587A' },
        gray: {
          950: '#000000',
        }
      }
    }
  },
  plugins: []
}
//  