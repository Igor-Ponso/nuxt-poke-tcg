/**
 * Color System Utilities
 *
 * Implements the dual-color gradient system for Pokemon types:
 * - Single type: gradient from light to dark of the same type
 * - Dual type: gradient from light of type 1 to light of type 2
 */

import type { PokemonType } from '~/types'
import { POKEMON_TYPES } from './constants'

// ============================================================================
// TYPE COLOR MAPPING
// ============================================================================

/**
 * Raw hex color values for each Pokemon type (light and dark variants)
 */
export const TYPE_COLORS: Record<PokemonType, { light: string; dark: string }> = {
  normal: { light: '#dcdcdc', dark: '#a0a29f' },
  fire: { light: '#ffb971', dark: '#dc872f' },
  water: { light: '#85c8ff', dark: '#5090d6' },
  electric: { light: '#ffe066', dark: '#f4d03f' },
  grass: { light: '#a8e890', dark: '#5fbd58' },
  ice: { light: '#b8e8f5', dark: '#7ad1c2' },
  fighting: { light: '#ffa791', dark: '#e0306a' },
  poison: { light: '#d6a2d6', dark: '#b567ce' },
  ground: { light: '#eba972', dark: '#da7943' },
  flying: { light: '#c4b7f5', dark: '#92aade' },
  psychic: { light: '#ff97b8', dark: '#fa6f8f' },
  bug: { light: '#c3d320', dark: '#a1c211' },
  rock: { light: '#d4c294', dark: '#c9bb8a' },
  ghost: { light: '#a292bc', dark: '#6f6e85' },
  dragon: { light: '#a27dfa', dark: '#0b6dc3' },
  dark: { light: '#a29288', dark: '#6f6e85' },
  steel: { light: '#c4c2db', dark: '#5a8ea2' },
  fairy: { light: '#fdb9e9', dark: '#ec8fe6' },
}

// ============================================================================
// TAILWIND CLASS MAPPING
// ============================================================================

/**
 * Maps Pokemon types to Tailwind CSS classes
 */
export const TYPE_TAILWIND_CLASSES: Record<PokemonType, { light: string; dark: string }> = {
  normal: { light: 'bg-poke-normal', dark: 'bg-poke-normal-dark' },
  fire: { light: 'bg-poke-fire', dark: 'bg-poke-fire-dark' },
  water: { light: 'bg-poke-water', dark: 'bg-poke-water-dark' },
  electric: { light: 'bg-poke-electric', dark: 'bg-poke-electric-dark' },
  grass: { light: 'bg-poke-grass', dark: 'bg-poke-grass-dark' },
  ice: { light: 'bg-poke-ice', dark: 'bg-poke-ice-dark' },
  fighting: { light: 'bg-poke-fighting', dark: 'bg-poke-fighting-dark' },
  poison: { light: 'bg-poke-poison', dark: 'bg-poke-poison-dark' },
  ground: { light: 'bg-poke-ground', dark: 'bg-poke-ground-dark' },
  flying: { light: 'bg-poke-flying', dark: 'bg-poke-flying-dark' },
  psychic: { light: 'bg-poke-psychic', dark: 'bg-poke-psychic-dark' },
  bug: { light: 'bg-poke-bug', dark: 'bg-poke-bug-dark' },
  rock: { light: 'bg-poke-rock', dark: 'bg-poke-rock-dark' },
  ghost: { light: 'bg-poke-ghost', dark: 'bg-poke-ghost-dark' },
  dragon: { light: 'bg-poke-dragon', dark: 'bg-poke-dragon-dark' },
  dark: { light: 'bg-poke-dark', dark: 'bg-poke-dark-dark' },
  steel: { light: 'bg-poke-steel', dark: 'bg-poke-steel-dark' },
  fairy: { light: 'bg-poke-fairy', dark: 'bg-poke-fairy-dark' },
}

// ============================================================================
// GRADIENT GENERATION
// ============================================================================

export interface GradientConfig {
  direction?: string // e.g., 'to right', 'to bottom', '135deg'
  stops?: number[] // Custom gradient stops (0-100)
}

/**
 * Generates a CSS gradient string for Pokemon types
 *
 * @param types - Array of 1 or 2 Pokemon types
 * @param config - Optional gradient configuration
 * @returns CSS gradient string
 *
 * @example
 * // Single type: light to dark of same type
 * getTypeGradient(['fire']) // 'linear-gradient(135deg, #ffb971, #dc872f)'
 *
 * // Dual type: light of type1 to light of type2
 * getTypeGradient(['fire', 'flying']) // 'linear-gradient(135deg, #ffb971, #c4b7f5)'
 */
export function getTypeGradient(
  types: PokemonType[],
  config: GradientConfig = {}
): string {
  const { direction = '135deg', stops } = config

  if (types.length === 0) {
    return 'linear-gradient(135deg, #dcdcdc, #a0a29f)' // Default to normal type
  }

  if (types.length === 1) {
    // Single type: gradient from light to dark
    const colors = TYPE_COLORS[types[0]]
    const stopStr = stops ? ` ${stops[0]}%, ${colors.dark} ${stops[1]}%` : ''
    return `linear-gradient(${direction}, ${colors.light}${stopStr ? stopStr : `, ${colors.dark}`})`
  }

  // Dual type: gradient from light of type1 to light of type2
  const color1 = TYPE_COLORS[types[0]].light
  const color2 = TYPE_COLORS[types[1]].light
  const stopStr = stops ? ` ${stops[0]}%, ${color2} ${stops[1]}%` : ''
  return `linear-gradient(${direction}, ${color1}${stopStr ? stopStr : `, ${color2}`})`
}

/**
 * Generates Tailwind CSS gradient classes for Pokemon types
 * Note: This returns a style object since Tailwind doesn't support
 * dynamic gradient composition with arbitrary values
 *
 * @param types - Array of 1 or 2 Pokemon types
 * @param direction - Gradient direction
 * @returns Object with backgroundImage style
 */
export function getTypeGradientStyle(
  types: PokemonType[],
  direction = '135deg'
): { backgroundImage: string } {
  return {
    backgroundImage: getTypeGradient(types, { direction }),
  }
}

/**
 * Gets Tailwind classes for a single type background
 *
 * @param type - Pokemon type
 * @param variant - 'light' or 'dark'
 * @returns Tailwind background class
 */
export function getTypeTailwindClass(
  type: PokemonType,
  variant: 'light' | 'dark' = 'light'
): string {
  return TYPE_TAILWIND_CLASSES[type][variant]
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

/**
 * Converts RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Gets the luminance of a color (for contrast calculations)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Determines if white or black text should be used on a given background color
 */
export function getContrastColor(backgroundColor: string): 'white' | 'black' {
  const luminance = getLuminance(backgroundColor)
  return luminance > 0.5 ? 'black' : 'white'
}

/**
 * Gets the best text color for a Pokemon type
 */
export function getTypeTextColor(type: PokemonType, variant: 'light' | 'dark' = 'light'): string {
  const color = TYPE_COLORS[type][variant]
  return getContrastColor(color)
}

/**
 * Lightens a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)))
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)))
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)))

  return rgbToHex(r, g, b)
}

/**
 * Darkens a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.max(0, Math.floor(rgb.r - rgb.r * (percent / 100)))
  const g = Math.max(0, Math.floor(rgb.g - rgb.g * (percent / 100)))
  const b = Math.max(0, Math.floor(rgb.b - rgb.b * (percent / 100)))

  return rgbToHex(r, g, b)
}

// ============================================================================
// HOLOGRAPHIC COLORS
// ============================================================================

/**
 * Generates holographic gradient for TCG cards
 * This creates the rainbow effect seen on holographic cards
 */
export function getHolographicGradient(
  rotation = 0,
  intensity = 1
): string {
  const hue1 = (rotation + 0) % 360
  const hue2 = (rotation + 60) % 360
  const hue3 = (rotation + 120) % 360
  const hue4 = (rotation + 180) % 360

  const alpha = Math.min(1, Math.max(0, intensity))

  return `linear-gradient(
    115deg,
    hsla(${hue1}, 100%, 50%, ${alpha * 0.3}) 0%,
    hsla(${hue2}, 100%, 50%, ${alpha * 0.5}) 25%,
    hsla(${hue3}, 100%, 50%, ${alpha * 0.5}) 50%,
    hsla(${hue4}, 100%, 50%, ${alpha * 0.3}) 75%,
    hsla(${hue1}, 100%, 50%, ${alpha * 0.1}) 100%
  )`
}

/**
 * Generates sparkle effect colors for holographic cards
 */
export function getSparkleColors(rotation = 0): string[] {
  return [
    `hsl(${(rotation + 0) % 360}, 100%, 90%)`,
    `hsl(${(rotation + 60) % 360}, 100%, 90%)`,
    `hsl(${(rotation + 120) % 360}, 100%, 90%)`,
    `hsl(${(rotation + 180) % 360}, 100%, 90%)`,
    `hsl(${(rotation + 240) % 360}, 100%, 90%)`,
    `hsl(${(rotation + 300) % 360}, 100%, 90%)`,
  ]
}
