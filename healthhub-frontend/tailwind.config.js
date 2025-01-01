/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'bounce-x': 'bounce-x 1s infinite',
        }
      },
    },
    plugins: [],
  }

  module.exports = {
    mode: 'jit',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: 'class',
    theme: {
      extend: {},
    },
    safelist: [
      'bg-blue-100',
      'bg-teal-100',
      'bg-purple-100',
      'bg-pink-100',
      'text-blue-500',
      'text-teal-500',
      'text-purple-500',
      'text-pink-500',
      'dark:bg-blue-900/30',
      'dark:bg-teal-900/30',
      'dark:bg-purple-900/30',
      'dark:bg-pink-900/30',
      'dark:text-blue-400',
      'dark:text-teal-400',
      'dark:text-purple-400',
      'dark:text-pink-400',
    ],
    plugins: [],
  }
  
  
  