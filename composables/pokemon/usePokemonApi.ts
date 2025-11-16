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
    const cache = useCache<Pokemon>(`pokemon_${idOrName}`, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      prefix: 'pokeapi',
    })

    const cached = cache.get()
    if (cached) {
      return cached
    }

    const url = `${baseUrl}/pokemon/${idOrName}`
    const data = await $fetch<Pokemon>(url)

    cache.set(data)
    return data
  }

  /**
   * Fetches Pokemon species data (for descriptions, evolution, etc.)
   */
  async function fetchSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    const cache = useCache<PokemonSpecies>(`species_${idOrName}`, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days (species data rarely changes)
      prefix: 'pokeapi',
    })

    const cached = cache.get()
    if (cached) {
      return cached
    }

    const url = `${baseUrl}/pokemon-species/${idOrName}`
    const data = await $fetch<PokemonSpecies>(url)

    cache.set(data)
    return data
  }

  /**
   * Fetches evolution chain
   */
  async function fetchEvolutionChain(id: number): Promise<EvolutionChain> {
    const cache = useCache<EvolutionChain>(`evolution_${id}`, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      prefix: 'pokeapi',
    })

    const cached = cache.get()
    if (cached) {
      return cached
    }

    const url = `${baseUrl}/evolution-chain/${id}`
    const data = await $fetch<EvolutionChain>(url)

    cache.set(data)
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
   * Searches across more Pokemon for better results
   * Now supports form-based search (mega, gmax, alolan, etc.)
   */
  async function searchPokemon(query: string, limit = 20): Promise<SimplifiedPokemon[]> {
    const normalizedQuery = query.toLowerCase().trim()

    // Check if this is a form-based search
    const formKeywords = ['mega', 'gmax', 'gigantamax', 'alolan', 'galarian', 'hisuian', 'paldean', 'primal', 'origin']
    const isFormSearch = formKeywords.some(keyword => normalizedQuery.includes(keyword))

    if (isFormSearch) {
      // Use Pokemon Forms API to search
      const { searchPokemonByFormType } = usePokemonForms()
      const pokemonIds = await searchPokemonByFormType(normalizedQuery)

      console.log(`[Form Search] Found ${pokemonIds.length} Pokemon IDs:`, pokemonIds.slice(0, 10))

      // If no results, return empty array
      if (pokemonIds.length === 0) {
        console.log('[Form Search] No Pokemon found with this form')
        return []
      }

      // Fetch Pokemon data for these IDs
      const pokemon = await Promise.all(
        pokemonIds.slice(0, limit).map(async (id) => {
          try {
            const data = await fetchPokemon(id)
            return simplifyPokemon(data)
          }
          catch (error) {
            console.error(`[Form Search] Failed to fetch Pokemon #${id}:`, error)
            return null
          }
        }),
      )

      // Filter out null results
      const validPokemon = pokemon.filter(p => p !== null) as SimplifiedPokemon[]
      console.log(`[Form Search] Successfully fetched ${validPokemon.length} Pokemon`)

      return validPokemon
    }

    // Regular name-based search
    // Search across first 500 Pokemon for better coverage (Gen 1-4)
    // This includes most popular Pokemon that users will search for
    const list = await fetchPokemonList(500, 0)
    const filtered = list.results.filter(p => matchesSearch(p.name, query))

    // Limit results but process them in parallel
    const pokemon = await Promise.all(
      filtered.slice(0, limit).map(async (p) => {
        const id = extractIdFromUrl(p.url)
        const data = await fetchPokemon(id)
        return simplifyPokemon(data)
      }),
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
// HELPER FUNCTIONS
// ============================================================================
