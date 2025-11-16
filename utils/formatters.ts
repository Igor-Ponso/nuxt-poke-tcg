/**
 * Formatting Utilities
 *
 * Functions for formatting Pokemon data, numbers, strings, and other
 * display-related transformations.
 */

// ============================================================================
// STRING FORMATTING
// ============================================================================

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Converts kebab-case or snake_case to Title Case
 *
 * @example
 * toTitleCase('pikachu') // 'Pikachu'
 * toTitleCase('mr-mime') // 'Mr. Mime'
 * toTitleCase('farfetchd') // "Farfetch'd"
 * toTitleCase('nidoran-f') // 'Nidoran ♀'
 * toTitleCase('nidoran-m') // 'Nidoran ♂'
 */
export function toTitleCase(str: string): string {
  if (!str) return ''

  // Special cases
  const specialCases: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'farfetchd': 'Farfetch\'d',
    'sirfetchd': 'Sirfetch\'d',
    'porygon-z': 'Porygon-Z',
    'type-null': 'Type: Null',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',
    'ho-oh': 'Ho-Oh',
  }

  const lower = str.toLowerCase()
  if (specialCases[lower]) {
    return specialCases[lower]
  }

  // Handle Nidoran gender symbols
  if (lower.includes('nidoran-f')) {
    return 'Nidoran ♀'
  }
  if (lower.includes('nidoran-m')) {
    return 'Nidoran ♂'
  }

  // Handle mega evolutions
  if (lower.includes('mega-')) {
    const parts = lower.split('-')
    const name = capitalize(parts[1])
    if (parts.length === 3) {
      return `Mega ${name} ${parts[2].toUpperCase()}`
    }
    return `Mega ${name}`
  }

  // Handle gigantamax
  if (lower.includes('gmax')) {
    const name = lower.replace('-gmax', '')
    return `Gigantamax ${capitalize(name)}`
  }

  // Default: split by dash/underscore and capitalize each word
  return str
    .split(/[-_]/)
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Formats a Pokemon name for display
 */
export function formatPokemonName(name: string): string {
  return toTitleCase(name)
}

/**
 * Formats a move or ability name
 */
export function formatAbilityName(name: string): string {
  return toTitleCase(name)
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats a Pokemon ID with leading zeros
 *
 * @example
 * formatPokemonId(1) // '#001'
 * formatPokemonId(25) // '#025'
 * formatPokemonId(151) // '#151'
 */
export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`
}

/**
 * Formats height from decimetres to meters
 *
 * @param decimetres - Height in decimetres (PokeAPI format)
 * @returns Formatted string like "1.2 m"
 */
export function formatHeight(decimetres: number): string {
  const meters = decimetres / 10
  return `${meters.toFixed(1)} m`
}

/**
 * Formats height from decimetres to feet/inches
 *
 * @param decimetres - Height in decimetres (PokeAPI format)
 * @returns Formatted string like "4'3\""
 */
export function formatHeightImperial(decimetres: number): string {
  const totalInches = decimetres * 3.937
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

/**
 * Formats weight from hectograms to kilograms
 *
 * @param hectograms - Weight in hectograms (PokeAPI format)
 * @returns Formatted string like "6.0 kg"
 */
export function formatWeight(hectograms: number): string {
  const kilograms = hectograms / 10
  return `${kilograms.toFixed(1)} kg`
}

/**
 * Formats weight from hectograms to pounds
 *
 * @param hectograms - Weight in hectograms (PokeAPI format)
 * @returns Formatted string like "13.2 lbs"
 */
export function formatWeightImperial(hectograms: number): string {
  const pounds = hectograms * 0.220462
  return `${pounds.toFixed(1)} lbs`
}

/**
 * Formats a price value
 */
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

/**
 * Formats a large number with abbreviations (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ============================================================================
// STAT FORMATTING
// ============================================================================

/**
 * Formats a stat value with color indicator
 */
export function getStatColor(statValue: number): string {
  if (statValue >= 150) return 'text-red-500'
  if (statValue >= 120) return 'text-orange-500'
  if (statValue >= 90) return 'text-yellow-500'
  if (statValue >= 60) return 'text-green-500'
  return 'text-gray-500'
}

/**
 * Gets a stat bar fill percentage
 */
export function getStatBarPercentage(statValue: number, maxStat = 255): number {
  return Math.min(100, (statValue / maxStat) * 100)
}

/**
 * Calculates total base stats
 */
export function calculateTotalStats(stats: {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}): number {
  return (
    stats.hp
    + stats.attack
    + stats.defense
    + stats.specialAttack
    + stats.specialDefense
    + stats.speed
  )
}

/**
 * Gets stat tier description
 */
export function getStatTier(statValue: number): string {
  if (statValue >= 150) return 'Legendary'
  if (statValue >= 120) return 'Excellent'
  if (statValue >= 90) return 'Great'
  if (statValue >= 60) return 'Good'
  if (statValue >= 40) return 'Average'
  return 'Poor'
}

// ============================================================================
// TYPE FORMATTING
// ============================================================================

/**
 * Formats type effectiveness multiplier
 */
export function formatTypeEffectiveness(multiplier: number): string {
  if (multiplier === 0) return 'No Effect'
  if (multiplier === 0.25) return '¼×'
  if (multiplier === 0.5) return '½×'
  if (multiplier === 1) return '1×'
  if (multiplier === 2) return '2×'
  if (multiplier === 4) return '4×'
  return `${multiplier}×`
}

/**
 * Gets type effectiveness color class
 */
export function getTypeEffectivenessColor(multiplier: number): string {
  if (multiplier === 0) return 'text-gray-500'
  if (multiplier < 1) return 'text-red-500'
  if (multiplier === 1) return 'text-gray-300'
  return 'text-green-500'
}

// ============================================================================
// DATE/TIME FORMATTING
// ============================================================================

/**
 * Formats a date string
 */
export function formatDate(dateString: string, locale = 'en-US'): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Formats a relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) {
    return formatDate(dateString)
  }
  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}

// ============================================================================
// DESCRIPTION FORMATTING
// ============================================================================

/**
 * Cleans flavor text from Pokemon descriptions
 * (removes line breaks, special characters, etc.)
 */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/\n/g, ' ')
    .replace(/\f/g, ' ')
    .replace(/\u00ad/g, '')
    .replace(/  +/g, ' ')
    .trim()
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

/**
 * Pluralizes a word based on count
 */
export function pluralize(word: string, count: number): string {
  if (count === 1) return word

  // Special cases
  const irregulars: Record<string, string> = {
    move: 'moves',
    ability: 'abilities',
    species: 'species',
    pokemon: 'pokemon',
  }

  return irregulars[word.toLowerCase()] || `${word}s`
}

// ============================================================================
// SEARCH/FILTER FORMATTING
// ============================================================================

/**
 * Normalizes a search query (lowercase, trim, remove special chars)
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
}

/**
 * Checks if a Pokemon name matches a search query
 */
export function matchesSearch(pokemonName: string, query: string): boolean {
  const normalizedName = normalizeSearchQuery(pokemonName)
  const normalizedQuery = normalizeSearchQuery(query)
  return normalizedName.includes(normalizedQuery)
}

/**
 * Highlights matching text in a string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// ============================================================================
// URL FORMATTING
// ============================================================================

/**
 * Creates a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Extracts ID from a PokeAPI URL
 *
 * @example
 * extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/') // 25
 */
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/$/)
  return match ? Number.parseInt(match[1], 10) : 0
}
