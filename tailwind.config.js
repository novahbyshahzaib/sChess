/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--app-bg)',
        panel: 'var(--panel-bg)',
        border: 'var(--border-color)',
        accent: 'var(--accent)',
        'accent-30': 'color-mix(in srgb, var(--accent) 30%, transparent)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      transitionTimingFunction: {
        'piece-out': 'ease-out',
      }
    },
  },
  plugins: [],
}
