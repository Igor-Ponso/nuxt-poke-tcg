/**
 * PokeAPI Composable
 *
 * Provides methods to fetch Pokemon data from PokeAPI v2
 * Includes caching with localStorage and error handling
 */

import type {
  Pokemon,
  PokemonSpecies,
  EvolutionChain,
  SimplifiedPokemon,
  PokemonCardData,
  NamedAPIResourceList,
} from '~/types'

export function usePokemonApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.pokeApiUrl as string

  /**
   * Fetches a Pokemon by ID or name
   */
  async function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
    const cacheKey = `pokemon_${idOrName}`
    const cached = getFromCache<Pokemon>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/pokemon/${idOrName}`
    const data = await $fetch<Pokemon>(url)

    saveToCache(cacheKey, data)
    return data
  }

  /**
   * Fetches Pokemon species data (for descriptions, evolution, etc.)
   */
  async function fetchSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const cacheKey = `species_${idOrName}`
    const cached = getFromCache<PokemonSpecies>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/pokemon-species/${idOrName}`
    const data = await $fetch<PokemonSpecies>(url)

    saveToCache(cacheKey, data)
    return data
  }

  /**
   * Fetches evolution chain
   */
  async function fetchEvolutionChain(id: number): Promise<EvolutionChain> {
    const cacheKey = `evolution_${id}`
    const cached = getFromCache<EvolutionChain>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/evolution-chain/${id}`
    const data = await $fetch<EvolutionChain>(url)

    saveToCache(cacheKey, data)
    return data
  }

  /**
   * Fetches a list of Pokemon (paginated)
   */
  async function fetchPokemonList(limit = 20, offset = 0): Promise<NamedAPIResourceList> {
    const url = `${baseUrl}/pokemon?limit=${limit}&offset=${offset}`
    return await $fetch<NamedAPIResourceList>(url)
  }

  /**
   * Fetches multiple Pokemon in batch
   * More efficient than individual requests
   */
  async function fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
    const promises = ids.map(id => fetchPokemon(id))
    return await Promise.all(promises)
  }

  /**
   * Fetches complete Pokemon data with species info
   */
  async function fetchPokemonWithSpecies(idOrName: string | number): Promise<{
    pokemon: Pokemon
    species: PokemonSpecies
  }> {
    const pokemon = await fetchPokemon(idOrName)
    const speciesId = extractIdFromUrl(pokemon.species.url)
    const species = await fetchSpecies(speciesId)

    return { pokemon, species }
  }

  /**
   * Converts full Pokemon data to simplified format
   */
  function simplifyPokemon(pokemon: Pokemon): SimplifiedPokemon {
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map(t => t.type.name as any),
      sprite: pokemon.sprites.other?.['official-artwork'].front_default || pokemon.sprites.front_default || '',
      shinySprite: pokemon.sprites.other?.['official-artwork'].front_shiny || pokemon.sprites.front_shiny || '',
      stats: {
        hp: pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
        attack: pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
        defense: pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
        specialAttack: pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
        specialDefense: pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
        speed: pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
      },
    }
  }

  /**
   * Converts Pokemon data to card format (with description and moves)
   */
  async function getPokemonCardData(idOrName: string | number): Promise<PokemonCardData> {
    const { pokemon, species } = await fetchPokemonWithSpecies(idOrName)
    const simplified = simplifyPokemon(pokemon)

    // Get English description
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    )
    const description = englishEntry ? cleanFlavorText(englishEntry.flavor_text) : ''

    // Get top 4 moves by power
    const topMoves = pokemon.moves
      .slice(0, 50) // Consider first 50 moves
      .map((m) => {
        // In a real implementation, we'd fetch move details
        // For now, return placeholder data
        return {
          name: formatPokemonName(m.move.name),
          power: null,
          type: simplified.types[0], // Use primary type as placeholder
        }
      })
      .slice(0, 4)

    return {
      ...simplified,
      species: formatPokemonName(species.name),
      description,
      abilities: pokemon.abilities.map(a => formatAbilityName(a.ability.name)),
      topMoves,
    }
  }

  /**
   * Search Pokemon by name (client-side filtering)
   */
  async function searchPokemon(query: string, limit = 20): Promise<SimplifiedPokemon[]> {
    // In a real implementation, we'd use a more sophisticated search
    // For now, fetch first 151 Pokemon and filter
    const list = await fetchPokemonList(151, 0)
    const filtered = list.results.filter(p => matchesSearch(p.name, query))

    const pokemon = await Promise.all(
      filtered.slice(0, limit).map(async (p) => {
        const id = extractIdFromUrl(p.url)
        const data = await fetchPokemon(id)
        return simplifyPokemon(data)
      })
    )

    return pokemon
  }

  return {
    fetchPokemon,
    fetchSpecies,
    fetchEvolutionChain,
    fetchPokemonList,
    fetchPokemonBatch,
    fetchPokemonWithSpecies,
    getPokemonCardData,
    simplifyPokemon,
    searchPokemon,
  }
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

function getFromCache<T>(key: string): T | null {
  if (import.meta.client) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp

      // Cache for 24 hours
      if (age < 24 * 60 * 60 * 1000) {
        return data as T
      }

      // Expired, remove from cache
      localStorage.removeItem(key)
    }
    catch (error) {
      console.warn('Cache read error:', error)
    }
  }

  return null
}

function saveToCache<T>(key: string, data: T): void {
  if (import.meta.client) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    }
    catch (error) {
      console.warn('Cache write error:', error)
    }
  }
}
