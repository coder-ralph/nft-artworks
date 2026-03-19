/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        dark: {
          bg:      '#080b12',
          bg2:     '#0d1220',
          bg3:     '#121929',
          surface: '#161f30',
          surface2:'#1e2a3f',
          border:  '#1f2d47',
          border2: '#2a3d5c',
        },
        accent: {
          DEFAULT: '#3d7eff',
          light:   '#6b9fff',
          glow:    'rgba(61,126,255,0.25)',
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulse2:  'pulse2 2s infinite',
        spin2:   'spin 1s linear infinite',
        fadeIn:  'fadeIn 0.2s ease',
        slideUp: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulse2: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.4 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px) scale(0.96)' },
          to:   { opacity: 1, transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}
