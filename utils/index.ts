/**
 * Centralized Utils Exports
 *
 * This file serves as the single entry point for all utility functions.
 * Import utils from here rather than individual files.
 *
 * @example
 * import { getTypeGradient, formatPokemonName, GENERATIONS } from '~/utils'
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  GENERATIONS,
  POKEMON_TYPES,
  STAT_NAMES,
  STAT_ABBREVIATIONS,
  API_CONFIG,
  CACHE_CONFIG,
  ANIMATION_CONFIG,
  UI_CONFIG,
  getGenerationByPokemonId,
  getGenerationByName,
  getTypeInfo,
  isStarter,
  getAllStarterIds,
} from './constants'

export type { Generation, TypeInfo } from './constants'

// ============================================================================
// COLORS
// ============================================================================

export {
  TYPE_COLORS,
  TYPE_TAILWIND_CLASSES,
  getTypeGradient,
  getTypeGradientStyle,
  getTypeTailwindClass,
  hexToRgb,
  rgbToHex,
  getLuminance,
  getContrastColor,
  getTypeTextColor,
  lightenColor,
  darkenColor,
  getHolographicGradient,
  getSparkleColors,
} from './colors'

export type { GradientConfig } from './colors'

// ============================================================================
// FORMATTERS
// ============================================================================

export {
  capitalize,
  toTitleCase,
  formatPokemonName,
  formatAbilityName,
  formatPokemonId,
  formatHeight,
  formatHeightImperial,
  formatWeight,
  formatWeightImperial,
  formatPrice,
  formatLargeNumber,
  formatPercentage,
  getStatColor,
  getStatBarPercentage,
  calculateTotalStats,
  getStatTier,
  formatTypeEffectiveness,
  getTypeEffectivenessColor,
  formatDate,
  formatRelativeTime,
  cleanFlavorText,
  truncateText,
  pluralize,
  normalizeSearchQuery,
  matchesSearch,
  highlightMatch,
  slugify,
  extractIdFromUrl,
} from './formatters'
