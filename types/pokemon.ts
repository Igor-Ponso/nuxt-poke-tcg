/**
 * Pokemon Types - PokeAPI v2 Interfaces
 * https://pokeapi.co/docs/v2
 */

// ============================================================================
// POKEMON TYPE SYSTEM
// ============================================================================

export type PokemonType
  = | 'normal'
    | 'fire'
    | 'water'
    | 'electric'
    | 'grass'
    | 'ice'
    | 'fighting'
    | 'poison'
    | 'ground'
    | 'flying'
    | 'psychic'
    | 'bug'
    | 'rock'
    | 'ghost'
    | 'dragon'
    | 'dark'
    | 'steel'
    | 'fairy'

// ============================================================================
// NAMED API RESOURCE
// ============================================================================

export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

// ============================================================================
// POKEMON BASE
// ============================================================================

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number // decimetres
  weight: number // hectograms
  is_default: boolean
  order: number
  abilities: PokemonAbility[]
  forms: NamedAPIResource[]
  game_indices: GameIndex[]
  held_items: PokemonHeldItem[]
  location_area_encounters: string
  moves: PokemonMove[]
  species: NamedAPIResource
  sprites: PokemonSprites
  stats: PokemonStat[]
  types: PokemonTypeSlot[]
  past_types: PokemonPastType[]
}

// ============================================================================
// POKEMON ABILITIES
// ============================================================================

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface Ability {
  id: number
  name: string
  is_main_series: boolean
  generation: NamedAPIResource
  names: Name[]
  effect_entries: VerboseEffect[]
  effect_changes: AbilityEffectChange[]
  flavor_text_entries: AbilityFlavorText[]
  pokemon: AbilityPokemon[]
}

export interface AbilityEffectChange {
  effect_entries: Effect[]
  version_group: NamedAPIResource
}

export interface AbilityPokemon {
  is_hidden: boolean
  slot: number
  pokemon: NamedAPIResource
}

export interface AbilityFlavorText {
  flavor_text: string
  language: NamedAPIResource
  version_group: NamedAPIResource
}

// ============================================================================
// POKEMON STATS
// ============================================================================

export interface PokemonStat {
  stat: NamedAPIResource
  effort: number
  base_stat: number
}

export interface Stat {
  id: number
  name: string
  game_index: number
  is_battle_only: boolean
  affecting_moves: MoveStatAffectSets
  affecting_natures: NatureStatAffectSets
  characteristics: APIResource[]
  move_damage_class: NamedAPIResource | null
  names: Name[]
}

export interface MoveStatAffectSets {
  increase: MoveStatAffect[]
  decrease: MoveStatAffect[]
}

export interface MoveStatAffect {
  change: number
  move: NamedAPIResource
}

export interface NatureStatAffectSets {
  increase: NamedAPIResource[]
  decrease: NamedAPIResource[]
}

// ============================================================================
// POKEMON TYPES
// ============================================================================

export interface PokemonTypeSlot {
  slot: number
  type: NamedAPIResource
}

export interface PokemonPastType {
  generation: NamedAPIResource
  types: PokemonTypeSlot[]
}

export interface Type {
  id: number
  name: string
  damage_relations: TypeRelations
  past_damage_relations: TypeRelationsPast[]
  game_indices: GenerationGameIndex[]
  generation: NamedAPIResource
  move_damage_class: NamedAPIResource | null
  names: Name[]
  pokemon: TypePokemon[]
  moves: NamedAPIResource[]
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  double_damage_from: NamedAPIResource[]
}

export interface TypeRelationsPast {
  generation: NamedAPIResource
  damage_relations: TypeRelations
}

export interface TypePokemon {
  slot: number
  pokemon: NamedAPIResource
}

// ============================================================================
// POKEMON SPRITES
// ============================================================================

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  front_female: string | null
  front_shiny_female: string | null
  back_default: string | null
  back_shiny: string | null
  back_female: string | null
  back_shiny_female: string | null
  other?: OtherPokemonSprites
  versions?: PokemonSpritesVersions
}

export interface OtherPokemonSprites {
  'dream_world': DreamWorld
  'home': Home
  'official-artwork': OfficialArtwork
  'showdown'?: Showdown
}

export interface DreamWorld {
  front_default: string | null
  front_female: string | null
}

export interface Home {
  front_default: string | null
  front_female: string | null
  front_shiny: string | null
  front_shiny_female: string | null
}

export interface OfficialArtwork {
  front_default: string | null
  front_shiny: string | null
}

export interface Showdown {
  front_default: string | null
  front_female: string | null
  front_shiny: string | null
  front_shiny_female: string | null
  back_default: string | null
  back_female: string | null
  back_shiny: string | null
  back_shiny_female: string | null
}

export interface PokemonSpritesVersions {
  [generation: string]: {
    [game: string]: {
      front_default: string | null
      front_shiny?: string | null
      front_female?: string | null
      front_shiny_female?: string | null
      back_default?: string | null
      back_shiny?: string | null
      back_female?: string | null
      back_shiny_female?: string | null
    }
  }
}

// ============================================================================
// POKEMON MOVES
// ============================================================================

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: PokemonMoveVersion[]
}

export interface PokemonMoveVersion {
  move_learn_method: NamedAPIResource
  version_group: NamedAPIResource
  level_learned_at: number
}

export interface Move {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  contest_combos: ContestComboSets | null
  contest_type: NamedAPIResource | null
  contest_effect: APIResource | null
  damage_class: NamedAPIResource
  effect_entries: VerboseEffect[]
  effect_changes: AbilityEffectChange[]
  learned_by_pokemon: NamedAPIResource[]
  flavor_text_entries: MoveFlavorText[]
  generation: NamedAPIResource
  machines: MachineVersionDetail[]
  meta: MoveMetaData | null
  names: Name[]
  past_values: PastMoveStatValues[]
  stat_changes: MoveStatChange[]
  super_contest_effect: APIResource | null
  target: NamedAPIResource
  type: NamedAPIResource
}

export interface ContestComboSets {
  normal: ContestComboDetail
  super: ContestComboDetail
}

export interface ContestComboDetail {
  use_before: NamedAPIResource[] | null
  use_after: NamedAPIResource[] | null
}

export interface MoveFlavorText {
  flavor_text: string
  language: NamedAPIResource
  version_group: NamedAPIResource
}

export interface MoveMetaData {
  ailment: NamedAPIResource
  category: NamedAPIResource
  min_hits: number | null
  max_hits: number | null
  min_turns: number | null
  max_turns: number | null
  drain: number
  healing: number
  crit_rate: number
  ailment_chance: number
  flinch_chance: number
  stat_chance: number
}

export interface MoveStatChange {
  change: number
  stat: NamedAPIResource
}

export interface PastMoveStatValues {
  accuracy: number | null
  effect_chance: number | null
  power: number | null
  pp: number | null
  effect_entries: VerboseEffect[]
  type: NamedAPIResource | null
  version_group: NamedAPIResource
}

// ============================================================================
// POKEMON SPECIES
// ============================================================================

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: NamedAPIResource
  pokedex_numbers: PokemonSpeciesDexEntry[]
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  shape: NamedAPIResource
  evolves_from_species: NamedAPIResource | null
  evolution_chain: APIResource
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  names: Name[]
  pal_park_encounters: PalParkEncounterArea[]
  flavor_text_entries: FlavorText[]
  form_descriptions: Description[]
  genera: Genus[]
  varieties: PokemonSpeciesVariety[]
}

export interface PokemonSpeciesDexEntry {
  entry_number: number
  pokedex: NamedAPIResource
}

export interface PalParkEncounterArea {
  base_score: number
  rate: number
  area: NamedAPIResource
}

export interface Genus {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpeciesVariety {
  is_default: boolean
  pokemon: NamedAPIResource
}

// ============================================================================
// EVOLUTION
// ============================================================================

export interface EvolutionChain {
  id: number
  baby_trigger_item: NamedAPIResource | null
  chain: ChainLink
}

export interface ChainLink {
  is_baby: boolean
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionDetail {
  item: NamedAPIResource | null
  trigger: NamedAPIResource
  gender: number | null
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  min_level: number | null
  min_happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedAPIResource | null
  turn_upside_down: boolean
}

// ============================================================================
// COMMON STRUCTURES
// ============================================================================

export interface Name {
  name: string
  language: NamedAPIResource
}

export interface Effect {
  effect: string
  language: NamedAPIResource
}

export interface VerboseEffect {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface FlavorText {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface Description {
  description: string
  language: NamedAPIResource
}

export interface GameIndex {
  game_index: number
  version: NamedAPIResource
}

export interface GenerationGameIndex {
  game_index: number
  generation: NamedAPIResource
}

export interface PokemonHeldItem {
  item: NamedAPIResource
  version_details: PokemonHeldItemVersion[]
}

export interface PokemonHeldItemVersion {
  version: NamedAPIResource
  rarity: number
}

export interface MachineVersionDetail {
  machine: APIResource
  version_group: NamedAPIResource
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type NamedAPIResourceList = PaginatedResponse<NamedAPIResource>

// ============================================================================
// CUSTOM APP TYPES (for our use)
// ============================================================================

export interface SimplifiedPokemon {
  id: number
  name: string
  types: PokemonType[]
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
}

export interface PokemonCardData extends SimplifiedPokemon {
  species: string
  description: string
  abilities: string[]
  topMoves: {
    name: string
    power: number | null
    type: PokemonType
  }[]
}

export interface SimplifiedAbility {
  id: number
  name: string
  description: string
  shortEffect: string
  generation: string
  pokemonCount: number
  isMainSeries: boolean
}

export interface SimplifiedMove {
  id: number
  name: string
  type: PokemonType
  category: 'physical' | 'special' | 'status'
  power: number | null
  accuracy: number | null
  pp: number
  description: string
  shortEffect: string
  generation: string
  learnedByCount: number
}
