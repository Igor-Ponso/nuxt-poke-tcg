/**
 * Centralized Type Exports
 *
 * This file serves as the single entry point for all type definitions
 * in the application. Import types from here rather than individual files.
 *
 * @example
 * import type { Pokemon, TCGCard, PokemonType } from '~/types'
 */

// ============================================================================
// POKEMON TYPES (PokeAPI)
// ============================================================================

export type {
  // Type System
  PokemonType,

  // API Resources
  NamedAPIResource,
  APIResource,

  // Pokemon Base
  Pokemon,

  // Abilities
  PokemonAbility,
  Ability,
  AbilityEffectChange,
  AbilityPokemon,
  AbilityFlavorText,

  // Stats
  PokemonStat,
  Stat,
  MoveStatAffectSets,
  MoveStatAffect,
  NatureStatAffectSets,

  // Types
  PokemonTypeSlot,
  PokemonPastType,
  Type,
  TypeRelations,
  TypeRelationsPast,
  TypePokemon,

  // Sprites
  PokemonSprites,
  OtherPokemonSprites,
  DreamWorld,
  Home,
  OfficialArtwork,
  Showdown,
  PokemonSpritesVersions,

  // Moves
  PokemonMove,
  PokemonMoveVersion,
  Move,
  ContestComboSets,
  ContestComboDetail,
  MoveFlavorText,
  MoveMetaData,
  MoveStatChange,
  PastMoveStatValues,

  // Species
  PokemonSpecies,
  PokemonSpeciesDexEntry,
  PalParkEncounterArea,
  Genus,
  PokemonSpeciesVariety,

  // Evolution
  EvolutionChain,
  ChainLink,
  EvolutionDetail,

  // Common Structures
  Name,
  Effect,
  VerboseEffect,
  FlavorText,
  Description,
  GameIndex,
  GenerationGameIndex,
  PokemonHeldItem,
  PokemonHeldItemVersion,
  MachineVersionDetail,

  // API Response Wrappers
  PaginatedResponse,
  NamedAPIResourceList,

  // Custom App Types
  SimplifiedPokemon,
  PokemonCardData,
} from './pokemon'

// ============================================================================
// TCG TYPES (Pokemon TCG API)
// ============================================================================

export type {
  // Card Base
  TCGCard,
  TCGSupertype,

  // Abilities
  TCGAncientTrait,
  TCGAbility,

  // Attacks
  TCGAttack,

  // Weaknesses & Resistances
  TCGWeakness,
  TCGResistance,

  // Set
  TCGSet,
  TCGSetImages,

  // Legalities
  TCGLegalities,
  TCGLegality,

  // Images
  TCGImages,

  // Pricing - TCGPlayer
  TCGPlayerData,
  TCGPlayerPrices,
  TCGPrice,

  // Pricing - CardMarket
  CardMarketData,
  CardMarketPrices,

  // API Response Wrappers
  TCGResponse,
  TCGCardResponse,
  TCGCardsResponse,
  TCGSetResponse,
  TCGSetsResponse,

  // Rarities & Types
  TCGRarity,
  TCGType,

  // Query Parameters
  TCGQueryParams,
  TCGCardQueryParams,
  TCGSetQueryParams,

  // Custom App Types
  SimplifiedTCGCard,
  EnhancedPokemonCard,
  CardDisplayMode,
  HolographicConfig,
} from './tcg'

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export everything from individual modules
// This allows both:
// import type { Pokemon } from '~/types'
// import type { Pokemon } from '~/types/pokemon'

export * from './pokemon'
export * from './tcg'
