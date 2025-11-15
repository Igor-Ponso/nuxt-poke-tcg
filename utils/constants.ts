/**
 * Application Constants
 *
 * Centralized constants for Pokemon generations, types, and other
 * immutable data used throughout the application.
 */

import type { PokemonType } from '~/types'

// ============================================================================
// POKEMON GENERATIONS
// ============================================================================

export interface Generation {
  id: number
  name: string
  region: string
  color: string
  starterId: number[] // IDs of the 3 starter Pokemon
  range: {
    start: number
    end: number
  }
  releaseYear: number
  games: string[]
}

export const GENERATIONS: Generation[] = [
  {
    id: 1,
    name: 'Generation I',
    region: 'Kanto',
    color: 'gen-kanto',
    starterId: [1, 4, 7], // Bulbasaur, Charmander, Squirtle
    range: { start: 1, end: 151 },
    releaseYear: 1996,
    games: ['Red', 'Blue', 'Yellow'],
  },
  {
    id: 2,
    name: 'Generation II',
    region: 'Johto',
    color: 'gen-johto',
    starterId: [152, 155, 158], // Chikorita, Cyndaquil, Totodile
    range: { start: 152, end: 251 },
    releaseYear: 1999,
    games: ['Gold', 'Silver', 'Crystal'],
  },
  {
    id: 3,
    name: 'Generation III',
    region: 'Hoenn',
    color: 'gen-hoenn',
    starterId: [252, 255, 258], // Treecko, Torchic, Mudkip
    range: { start: 252, end: 386 },
    releaseYear: 2002,
    games: ['Ruby', 'Sapphire', 'Emerald', 'FireRed', 'LeafGreen'],
  },
  {
    id: 4,
    name: 'Generation IV',
    region: 'Sinnoh',
    color: 'gen-sinnoh',
    starterId: [387, 390, 393], // Turtwig, Chimchar, Piplup
    range: { start: 387, end: 493 },
    releaseYear: 2006,
    games: ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver'],
  },
  {
    id: 5,
    name: 'Generation V',
    region: 'Unova',
    color: 'gen-unova',
    starterId: [495, 498, 501], // Snivy, Tepig, Oshawott
    range: { start: 494, end: 649 },
    releaseYear: 2010,
    games: ['Black', 'White', 'Black 2', 'White 2'],
  },
  {
    id: 6,
    name: 'Generation VI',
    region: 'Kalos',
    color: 'gen-kalos',
    starterId: [650, 653, 656], // Chespin, Fennekin, Froakie
    range: { start: 650, end: 721 },
    releaseYear: 2013,
    games: ['X', 'Y', 'Omega Ruby', 'Alpha Sapphire'],
  },
  {
    id: 7,
    name: 'Generation VII',
    region: 'Alola',
    color: 'gen-alola',
    starterId: [722, 725, 728], // Rowlet, Litten, Popplio
    range: { start: 722, end: 809 },
    releaseYear: 2016,
    games: ['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon'],
  },
  {
    id: 8,
    name: 'Generation VIII',
    region: 'Galar',
    color: 'gen-galar',
    starterId: [810, 813, 816], // Grookey, Scorbunny, Sobble
    range: { start: 810, end: 905 },
    releaseYear: 2019,
    games: ['Sword', 'Shield', 'Brilliant Diamond', 'Shining Pearl', 'Legends: Arceus'],
  },
  {
    id: 9,
    name: 'Generation IX',
    region: 'Paldea',
    color: 'gen-paldea',
    starterId: [906, 909, 912], // Sprigatito, Fuecoco, Quaxly
    range: { start: 906, end: 1025 },
    releaseYear: 2022,
    games: ['Scarlet', 'Violet'],
  },
]

// ============================================================================
// POKEMON TYPES
// ============================================================================

export interface TypeInfo {
  name: PokemonType
  displayName: string
  colorLight: string
  colorDark: string
  icon?: string
}

export const POKEMON_TYPES: TypeInfo[] = [
  {
    name: 'normal',
    displayName: 'Normal',
    colorLight: 'poke-normal',
    colorDark: 'poke-normal-dark',
  },
  {
    name: 'fire',
    displayName: 'Fire',
    colorLight: 'poke-fire',
    colorDark: 'poke-fire-dark',
  },
  {
    name: 'water',
    displayName: 'Water',
    colorLight: 'poke-water',
    colorDark: 'poke-water-dark',
  },
  {
    name: 'electric',
    displayName: 'Electric',
    colorLight: 'poke-electric',
    colorDark: 'poke-electric-dark',
  },
  {
    name: 'grass',
    displayName: 'Grass',
    colorLight: 'poke-grass',
    colorDark: 'poke-grass-dark',
  },
  {
    name: 'ice',
    displayName: 'Ice',
    colorLight: 'poke-ice',
    colorDark: 'poke-ice-dark',
  },
  {
    name: 'fighting',
    displayName: 'Fighting',
    colorLight: 'poke-fighting',
    colorDark: 'poke-fighting-dark',
  },
  {
    name: 'poison',
    displayName: 'Poison',
    colorLight: 'poke-poison',
    colorDark: 'poke-poison-dark',
  },
  {
    name: 'ground',
    displayName: 'Ground',
    colorLight: 'poke-ground',
    colorDark: 'poke-ground-dark',
  },
  {
    name: 'flying',
    displayName: 'Flying',
    colorLight: 'poke-flying',
    colorDark: 'poke-flying-dark',
  },
  {
    name: 'psychic',
    displayName: 'Psychic',
    colorLight: 'poke-psychic',
    colorDark: 'poke-psychic-dark',
  },
  {
    name: 'bug',
    displayName: 'Bug',
    colorLight: 'poke-bug',
    colorDark: 'poke-bug-dark',
  },
  {
    name: 'rock',
    displayName: 'Rock',
    colorLight: 'poke-rock',
    colorDark: 'poke-rock-dark',
  },
  {
    name: 'ghost',
    displayName: 'Ghost',
    colorLight: 'poke-ghost',
    colorDark: 'poke-ghost-dark',
  },
  {
    name: 'dragon',
    displayName: 'Dragon',
    colorLight: 'poke-dragon',
    colorDark: 'poke-dragon-dark',
  },
  {
    name: 'dark',
    displayName: 'Dark',
    colorLight: 'poke-dark',
    colorDark: 'poke-dark-dark',
  },
  {
    name: 'steel',
    displayName: 'Steel',
    colorLight: 'poke-steel',
    colorDark: 'poke-steel-dark',
  },
  {
    name: 'fairy',
    displayName: 'Fairy',
    colorLight: 'poke-fairy',
    colorDark: 'poke-fairy-dark',
  },
]

// ============================================================================
// STAT NAMES
// ============================================================================

export const STAT_NAMES = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
} as const

export const STAT_ABBREVIATIONS = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPATK',
  'special-defense': 'SPDEF',
  speed: 'SPD',
} as const

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  pokeapi: {
    baseUrl: 'https://pokeapi.co/api/v2',
    endpoints: {
      pokemon: '/pokemon',
      species: '/pokemon-species',
      type: '/type',
      ability: '/ability',
      move: '/move',
      evolutionChain: '/evolution-chain',
    },
    limits: {
      batchSize: 20, // How many Pokemon to fetch at once
      maxRetries: 3,
      timeout: 10000, // 10 seconds
    },
  },
  tcgapi: {
    baseUrl: 'https://api.pokemontcg.io/v2',
    endpoints: {
      cards: '/cards',
      sets: '/sets',
      types: '/types',
      subtypes: '/subtypes',
      supertypes: '/supertypes',
      rarities: '/rarities',
    },
    limits: {
      pageSize: 20,
      maxRetries: 3,
      timeout: 10000, // 10 seconds
    },
  },
} as const

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  keys: {
    pokemon: 'pokemon_cache',
    species: 'species_cache',
    tcgCards: 'tcg_cards_cache',
    lastFetch: 'last_fetch',
  },
  ttl: {
    pokemon: 1000 * 60 * 60 * 24, // 24 hours
    species: 1000 * 60 * 60 * 24 * 7, // 7 days
    tcgCards: 1000 * 60 * 60 * 24, // 24 hours
  },
} as const

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0.0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  card3D: {
    maxRotate: 15, // degrees
    perspective: 1000, // px
    springConfig: {
      stiffness: 150,
      damping: 15,
      precision: 0.01,
    },
  },
  holographic: {
    gradientSize: 400, // percentage
    shineLayers: 3,
    parallaxStrength: 20, // pixels
  },
} as const

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  grid: {
    minCardWidth: 200, // px
    gap: 16, // px
  },
  card: {
    aspectRatio: 0.718, // TCG card aspect ratio (2.5" x 3.5")
    borderRadius: '4.55% / 3.5%', // TCG card border radius
  },
  search: {
    debounceMs: 300,
    minCharacters: 2,
  },
  pagination: {
    itemsPerPage: 20,
    maxVisiblePages: 5,
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get generation by Pokemon ID
 */
export function getGenerationByPokemonId(id: number): Generation | undefined {
  return GENERATIONS.find(
    gen => id >= gen.range.start && id <= gen.range.end
  )
}

/**
 * Get generation by name
 */
export function getGenerationByName(name: string): Generation | undefined {
  return GENERATIONS.find(
    gen => gen.name.toLowerCase() === name.toLowerCase() ||
           gen.region.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get type info by name
 */
export function getTypeInfo(typeName: PokemonType): TypeInfo | undefined {
  return POKEMON_TYPES.find(t => t.name === typeName)
}

/**
 * Check if a Pokemon ID is a starter
 */
export function isStarter(id: number): boolean {
  return GENERATIONS.some(gen => gen.starterId.includes(id))
}

/**
 * Get all starter Pokemon IDs
 */
export function getAllStarterIds(): number[] {
  return GENERATIONS.flatMap(gen => gen.starterId)
}
