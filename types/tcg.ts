/**
 * Pokemon TCG API Types
 * https://docs.pokemontcg.io/
 */

// ============================================================================
// TCG CARD BASE
// ============================================================================

export interface TCGCard {
  id: string
  name: string
  supertype: TCGSupertype
  subtypes: string[]
  level?: string
  hp?: string
  types?: string[]
  evolvesFrom?: string
  evolvesTo?: string[]
  rules?: string[]
  ancientTrait?: TCGAncientTrait
  abilities?: TCGAbility[]
  attacks?: TCGAttack[]
  weaknesses?: TCGWeakness[]
  resistances?: TCGResistance[]
  retreatCost?: string[]
  convertedRetreatCost?: number
  set: TCGSet
  number: string
  artist?: string
  rarity?: string
  flavorText?: string
  nationalPokedexNumbers?: number[]
  legalities: TCGLegalities
  regulationMark?: string
  images: TCGImages
  tcgplayer?: TCGPlayerData
  cardmarket?: CardMarketData
}

export type TCGSupertype = 'Pokémon' | 'Trainer' | 'Energy'

// ============================================================================
// TCG ABILITIES
// ============================================================================

export interface TCGAncientTrait {
  name: string
  text: string
}

export interface TCGAbility {
  name: string
  text: string
  type: string
}

// ============================================================================
// TCG ATTACKS
// ============================================================================

export interface TCGAttack {
  name: string
  cost: string[]
  convertedEnergyCost: number
  damage: string
  text: string
}

// ============================================================================
// TCG WEAKNESSES & RESISTANCES
// ============================================================================

export interface TCGWeakness {
  type: string
  value: string
}

export interface TCGResistance {
  type: string
  value: string
}

// ============================================================================
// TCG SET
// ============================================================================

export interface TCGSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities: TCGLegalities
  ptcgoCode?: string
  releaseDate: string
  updatedAt: string
  images: TCGSetImages
}

export interface TCGSetImages {
  symbol: string
  logo: string
}

// ============================================================================
// TCG LEGALITIES
// ============================================================================

export interface TCGLegalities {
  unlimited?: TCGLegality
  standard?: TCGLegality
  expanded?: TCGLegality
}

export type TCGLegality = 'Legal' | 'Banned'

// ============================================================================
// TCG IMAGES
// ============================================================================

export interface TCGImages {
  small: string
  large: string
}

// ============================================================================
// TCG PLAYER DATA (PRICING)
// ============================================================================

export interface TCGPlayerData {
  url: string
  updatedAt: string
  prices?: TCGPlayerPrices
}

export interface TCGPlayerPrices {
  'normal'?: TCGPrice
  'holofoil'?: TCGPrice
  'reverseHolofoil'?: TCGPrice
  '1stEditionHolofoil'?: TCGPrice
  '1stEditionNormal'?: TCGPrice
}

export interface TCGPrice {
  low: number | null
  mid: number | null
  high: number | null
  market: number | null
  directLow: number | null
}

// ============================================================================
// CARDMARKET DATA (PRICING)
// ============================================================================

export interface CardMarketData {
  url: string
  updatedAt: string
  prices?: CardMarketPrices
}

export interface CardMarketPrices {
  averageSellPrice: number | null
  lowPrice: number | null
  trendPrice: number | null
  germanProLow: number | null
  suggestedPrice: number | null
  reverseHoloSell: number | null
  reverseHoloLow: number | null
  reverseHoloTrend: number | null
  lowPriceExPlus: number | null
  avg1: number | null
  avg7: number | null
  avg30: number | null
  reverseHoloAvg1: number | null
  reverseHoloAvg7: number | null
  reverseHoloAvg30: number | null
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface TCGResponse<T> {
  data: T
  page?: number
  pageSize?: number
  count?: number
  totalCount?: number
}

export type TCGCardResponse = TCGResponse<TCGCard>
export type TCGCardsResponse = TCGResponse<TCGCard[]>
export type TCGSetResponse = TCGResponse<TCGSet>
export type TCGSetsResponse = TCGResponse<TCGSet[]>

// ============================================================================
// TCG RARITIES (for filtering/display)
// ============================================================================

export type TCGRarity
  = | 'Common'
    | 'Uncommon'
    | 'Rare'
    | 'Rare Holo'
    | 'Rare Holo EX'
    | 'Rare Holo GX'
    | 'Rare Holo V'
    | 'Rare Holo VMAX'
    | 'Rare Holo VSTAR'
    | 'Rare Ultra'
    | 'Rare Secret'
    | 'Rare Rainbow'
    | 'Rare Shiny'
    | 'Rare Shiny GX'
    | 'Amazing Rare'
    | 'Promo'
    | 'Radiant Rare'
    | 'Illustration Rare'
    | 'Special Illustration Rare'
    | 'Hyper Rare'
    | 'Ultra Rare'
    | 'Double Rare'
    | 'ACE SPEC Rare'

// ============================================================================
// TCG TYPES (for energy/cards)
// ============================================================================

export type TCGType
  = | 'Colorless'
    | 'Darkness'
    | 'Dragon'
    | 'Fairy'
    | 'Fighting'
    | 'Fire'
    | 'Grass'
    | 'Lightning'
    | 'Metal'
    | 'Psychic'
    | 'Water'

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface TCGQueryParams {
  q?: string // Search query (e.g., "name:charizard")
  page?: number
  pageSize?: number
  orderBy?: string
  select?: string
}

export interface TCGCardQueryParams extends TCGQueryParams {
  name?: string
  supertype?: TCGSupertype
  subtypes?: string
  types?: string
  hp?: string
  rarity?: TCGRarity
  set?: string
  nationalPokedexNumbers?: number
  artist?: string
  regulationMark?: string
}

export interface TCGSetQueryParams extends TCGQueryParams {
  name?: string
  series?: string
}

// ============================================================================
// CUSTOM APP TYPES (for our use)
// ============================================================================

/**
 * Simplified card data for list display
 */
export interface SimplifiedTCGCard {
  id: string
  name: string
  imageUrl: string
  rarity?: string
  setName: string
  number: string
  types?: string[]
}

/**
 * Combined Pokemon + TCG data for detailed view
 */
export interface EnhancedPokemonCard {
  // From PokeAPI
  pokemonId: number
  pokemonName: string
  pokemonTypes: string[]
  sprite: string
  shinySprite: string
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }

  // From TCG API
  tcgCards: SimplifiedTCGCard[]
}

/**
 * Card display mode configuration
 */
export interface CardDisplayMode {
  mode: 'pokedex' | 'tcg'
  showShiny: boolean
  show3D: boolean
  showHolographic: boolean
}

/**
 * Holographic effect configuration
 */
export interface HolographicConfig {
  enabled: boolean | import('vue').Ref<boolean>
  intensity: number // 0-1
  speed: number // animation speed multiplier
  type: 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism'
}
