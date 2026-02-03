/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: '#ff0033',
        'blood-dark': '#cc0029',
        'blood-light': '#ff3366',
        dark: '#050505',
        darker: '#0a0a0a',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch-anim 5s infinite linear alternate-reverse',
        'float-rune': 'float-rune 8s ease-in-out infinite',
        'pulse-rune': 'pulse-rune 4s ease-in-out infinite',
        'slide-left': 'slide-from-left 0.8s ease-out forwards',
        'slide-right': 'slide-from-right 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
