import type { Config } from 'tailwindcss'
import { TYPE_COLORS } from './utils/colors'

// Generate Tailwind color config from TYPE_COLORS (single source of truth)
const pokemonTypeColors = Object.entries(TYPE_COLORS).reduce(
  (acc, [type, colors]) => {
    acc[`poke-${type}`] = colors.light
    acc[`poke-${type}-dark`] = colors.dark
    return acc
  },
  {} as Record<string, string>,
)

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Pokemon Types - Generated from utils/colors.ts (single source of truth)
        ...pokemonTypeColors,

        // Generation Colors
        'gen-kanto': '#FF6B6B',
        'gen-johto': '#4ECDC4',
        'gen-hoenn': '#45B7D1',
        'gen-sinnoh': '#96CEB4',
        'gen-unova': '#FFEAA7',
        'gen-kalos': '#DFE6E9',
        'gen-alola': '#74B9FF',
        'gen-galar': '#A29BFE',
        'gen-paldea': '#FD79A8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      aspectRatio: {
        card: '0.718', // Pokemon card ratio
      },
      screens: {
        xs: '475px',
      },
      boxShadow: {
        'glow': '0 0 20px var(--glow-color, rgba(0, 0, 0, 0.3))',
        'glow-sm': '0 0 10px var(--glow-color, rgba(0, 0, 0, 0.2))',
        'glow-lg': '0 0 30px var(--glow-color, rgba(0, 0, 0, 0.4))',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
