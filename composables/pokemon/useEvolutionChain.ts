/**
 * Evolution Chain Composable
 *
 * Processes evolution chain data and provides helper functions
 */

import type { ChainLink, EvolutionDetail, NamedAPIResource } from '~/types'

export interface ProcessedEvolution {
  species: NamedAPIResource
  id: number
  sprite: string
  isBaby: boolean
  evolvesFrom: string | null
  evolutionDetails: EvolutionTrigger[]
}

export interface EvolutionTrigger {
  trigger: string
  minLevel?: number
  item?: string
  itemSprite?: string
  heldItem?: string
  heldItemSprite?: string
  knownMove?: string
  knownMoveType?: string
  location?: string
  minHappiness?: number
  minBeauty?: number
  minAffection?: number
  timeOfDay?: string
  gender?: 'male' | 'female' | null
  needsRain?: boolean
  partySpecies?: string
  partyType?: string
  relativeStats?: 'attack-higher' | 'defense-higher' | 'equal'
  tradeSpecies?: string
  turnUpsideDown?: boolean
}

export function useEvolutionChain() {
  /**
   * Get item sprite URL from PokeAPI sprites repository
   */
  function getItemSpriteUrl(itemName: string): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`
  }

  /**
   * Fetches and processes evolution chain data
   */
  async function getEvolutionChain(evolutionChainUrl: string): Promise<ProcessedEvolution[]> {
    try {
      // Extract chain ID from URL
      const chainId = extractIdFromUrl(evolutionChainUrl)

      // Fetch evolution chain
      const api = usePokemonApi()
      const chain = await api.fetchEvolutionChain(chainId)

      // Process chain into flat array
      return await processChainLink(chain.chain, null)
    }
    catch (error) {
      console.error('Error fetching evolution chain:', error)
      return []
    }
  }

  /**
   * Recursively processes chain links into flat array
   */
  async function processChainLink(
    link: ChainLink,
    evolvesFrom: string | null,
  ): Promise<ProcessedEvolution[]> {
    const evolutions: ProcessedEvolution[] = []

    // Get Pokemon ID from species URL
    const speciesId = extractIdFromUrl(link.species.url)

    // Fetch Pokemon data to get sprite
    const api = usePokemonApi()
    let sprite = ''
    try {
      const pokemon = await api.fetchPokemon(speciesId)
      sprite = pokemon.sprites.other?.['official-artwork']?.front_default
        || pokemon.sprites.front_default
        || ''
    }
    catch (error) {
      console.warn(`Could not fetch sprite for ${link.species.name}`)
    }

    // Process evolution details
    const evolutionDetails = link.evolution_details.map(detail =>
      processEvolutionDetail(detail)
    )

    // Add current Pokemon
    evolutions.push({
      species: link.species,
      id: speciesId,
      sprite,
      isBaby: link.is_baby,
      evolvesFrom,
      evolutionDetails,
    })

    // Process children recursively
    for (const child of link.evolves_to) {
      const childEvolutions = await processChainLink(child, link.species.name)
      evolutions.push(...childEvolutions)
    }

    return evolutions
  }

  /**
   * Processes evolution detail into readable format
   */
  function processEvolutionDetail(detail: EvolutionDetail): EvolutionTrigger {
    const trigger: EvolutionTrigger = {
      trigger: detail.trigger.name,
    }

    // Add all relevant conditions
    if (detail.min_level) trigger.minLevel = detail.min_level
    if (detail.item) {
      trigger.item = formatPokemonName(detail.item.name)
      trigger.itemSprite = getItemSpriteUrl(detail.item.name)
    }
    if (detail.held_item) {
      trigger.heldItem = formatPokemonName(detail.held_item.name)
      trigger.heldItemSprite = getItemSpriteUrl(detail.held_item.name)
    }
    if (detail.known_move) trigger.knownMove = formatPokemonName(detail.known_move.name)
    if (detail.known_move_type) trigger.knownMoveType = formatPokemonName(detail.known_move_type.name)
    if (detail.location) trigger.location = formatPokemonName(detail.location.name)
    if (detail.min_happiness) trigger.minHappiness = detail.min_happiness
    if (detail.min_beauty) trigger.minBeauty = detail.min_beauty
    if (detail.min_affection) trigger.minAffection = detail.min_affection
    if (detail.time_of_day) trigger.timeOfDay = detail.time_of_day
    if (detail.needs_overworld_rain) trigger.needsRain = true
    if (detail.party_species) trigger.partySpecies = formatPokemonName(detail.party_species.name)
    if (detail.party_type) trigger.partyType = formatPokemonName(detail.party_type.name)
    if (detail.trade_species) trigger.tradeSpecies = formatPokemonName(detail.trade_species.name)
    if (detail.turn_upside_down) trigger.turnUpsideDown = true

    // Gender (1 = female, 2 = male)
    if (detail.gender !== null) {
      trigger.gender = detail.gender === 1 ? 'female' : 'male'
    }

    // Relative physical stats (-1 = attack < defense, 0 = equal, 1 = attack > defense)
    if (detail.relative_physical_stats !== null) {
      if (detail.relative_physical_stats === -1) trigger.relativeStats = 'defense-higher'
      else if (detail.relative_physical_stats === 0) trigger.relativeStats = 'equal'
      else if (detail.relative_physical_stats === 1) trigger.relativeStats = 'attack-higher'
    }

    return trigger
  }

  /**
   * Formats evolution trigger into human-readable text
   */
  function formatEvolutionTrigger(trigger: EvolutionTrigger): string {
    const parts: string[] = []

    // Level up
    if (trigger.trigger === 'level-up') {
      if (trigger.minLevel) {
        parts.push(`Level ${trigger.minLevel}`)
      }
      else {
        parts.push('Level Up')
      }

      // Additional conditions
      if (trigger.minHappiness) parts.push(`Happiness ${trigger.minHappiness}+`)
      if (trigger.minAffection) parts.push(`Affection ${trigger.minAffection}+`)
      if (trigger.minBeauty) parts.push(`Beauty ${trigger.minBeauty}+`)
      if (trigger.timeOfDay) parts.push(`(${trigger.timeOfDay})`)
      if (trigger.location) parts.push(`at ${trigger.location}`)
      if (trigger.knownMove) parts.push(`knowing ${trigger.knownMove}`)
      if (trigger.knownMoveType) parts.push(`with ${trigger.knownMoveType}-type move`)
      if (trigger.needsRain) parts.push('(rain)')
      if (trigger.partySpecies) parts.push(`with ${trigger.partySpecies} in party`)
      if (trigger.partyType) parts.push(`with ${trigger.partyType} type in party`)
      if (trigger.gender) parts.push(`(${trigger.gender})`)
      if (trigger.relativeStats === 'attack-higher') parts.push('(Atk > Def)')
      if (trigger.relativeStats === 'defense-higher') parts.push('(Def > Atk)')
      if (trigger.relativeStats === 'equal') parts.push('(Atk = Def)')
      if (trigger.turnUpsideDown) parts.push('(turn console upside-down)')
    }

    // Use item
    else if (trigger.trigger === 'use-item') {
      if (trigger.item) {
        parts.push(`Use ${trigger.item}`)
      }
      else {
        parts.push('Use Item')
      }
    }

    // Trade
    else if (trigger.trigger === 'trade') {
      parts.push('Trade')
      if (trigger.heldItem) parts.push(`holding ${trigger.heldItem}`)
      if (trigger.tradeSpecies) parts.push(`for ${trigger.tradeSpecies}`)
    }

    // Shed (Nincada -> Shedinja)
    else if (trigger.trigger === 'shed') {
      parts.push('Extra Poké Ball + empty party slot')
    }

    // Other/Unknown
    else {
      parts.push(formatPokemonName(trigger.trigger))
    }

    return parts.join(' ')
  }

  return {
    getEvolutionChain,
    formatEvolutionTrigger,
  }
}
