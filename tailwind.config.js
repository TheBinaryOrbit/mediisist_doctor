/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors : {
        primary : '#164972',
        secondary : '#1999da1', 
      }
    },
  },
  plugins: [],
}

