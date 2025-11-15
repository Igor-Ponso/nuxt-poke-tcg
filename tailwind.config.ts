import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
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
        // Pokemon Types - Light (background)
        'poke-normal': '#dcdcdc',
        'poke-fire': '#ffb971',
        'poke-water': '#8cc4e2',
        'poke-electric': '#ffe662',
        'poke-grass': '#78dd81',
        'poke-ice': '#8cf5e4',
        'poke-fighting': '#da7589',
        'poke-poison': '#d881ef',
        'poke-ground': '#e69a74',
        'poke-flying': '#99ccff',
        'poke-psychic': '#f57ec3',
        'poke-bug': '#bfe760',
        'poke-rock': '#c9bb8a',
        'poke-ghost': '#8291e0',
        'poke-dragon': '#88a2e8',
        'poke-dark': '#8e8c94',
        'poke-steel': '#9fb8b9',
        'poke-fairy': '#fdb9e9',

        // Pokemon Types - Dark (accent/badge)
        'poke-normal-dark': '#a0a29f',
        'poke-fire-dark': '#dc872f',
        'poke-water-dark': '#539ddf',
        'poke-electric-dark': '#d9b803',
        'poke-grass-dark': '#59b153',
        'poke-ice-dark': '#75d0c1',
        'poke-fighting-dark': '#d3425f',
        'poke-poison-dark': '#b763cf',
        'poke-ground-dark': '#da7c4d',
        'poke-flying-dark': '#80a0dd',
        'poke-psychic-dark': '#db1d8c',
        'poke-bug-dark': '#92bc2c',
        'poke-rock-dark': '#a38c21',
        'poke-ghost-dark': '#5f6dbc',
        'poke-dragon-dark': '#0c69c8',
        'poke-dark-dark': '#595761',
        'poke-steel-dark': '#5695a3',
        'poke-fairy-dark': '#ee90e6',

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
        'card': '0.718', // Pokemon card ratio
      },
      screens: {
        'xs': '475px',
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
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
