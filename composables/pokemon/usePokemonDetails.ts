/**
 * Composable for fetching detailed Pokemon information
 *
 * Provides cached access to full Pokemon data including:
 * - Height & Weight
 * - Abilities with descriptions
 * - Species information (flavor text, evolution chain)
 */

import type { Pokemon, PokemonSpecies } from '~/types'

interface PokemonDetailsCache {
  pokemon: Pokemon | null
  species: PokemonSpecies | null
  loading: boolean
  error: Error | null
}

const cache = new Map<number, PokemonDetailsCache>()

export function usePokemonDetails() {
  const api = usePokemonApi()

  /**
   * Fetch full Pokemon data
   */
  async function fetchPokemon(pokemonId: number): Promise<Pokemon | null> {
    try {
      // Check cache first
      const cached = cache.get(pokemonId)
      if (cached?.pokemon) {
        return cached.pokemon
      }

      // Set loading state
      cache.set(pokemonId, {
        pokemon: null,
        species: null,
        loading: true,
        error: null,
      })

      // Fetch from API
      const pokemon = await api.fetchPokemon(pokemonId)

      // Update cache
      const current = cache.get(pokemonId) || { pokemon: null, species: null, loading: false, error: null }
      cache.set(pokemonId, {
        ...current,
        pokemon,
        loading: false,
      })

      return pokemon
    }
    catch (error) {
      console.error(`Failed to fetch Pokemon #${pokemonId}:`, error)
      const current = cache.get(pokemonId) || { pokemon: null, species: null, loading: false, error: null }
      cache.set(pokemonId, {
        ...current,
        loading: false,
        error: error as Error,
      })
      return null
    }
  }

  /**
   * Fetch Pokemon species data (descriptions, evolution chain, etc.)
   */
  async function fetchSpecies(pokemonId: number): Promise<PokemonSpecies | null> {
    try {
      // Check cache first
      const cached = cache.get(pokemonId)
      if (cached?.species) {
        return cached.species
      }

      // Fetch from API
      const species = await api.fetchSpecies(pokemonId)

      // Update cache
      const current = cache.get(pokemonId) || { pokemon: null, species: null, loading: false, error: null }
      cache.set(pokemonId, {
        ...current,
        species,
      })

      return species
    }
    catch (error) {
      console.error(`Failed to fetch Pokemon Species #${pokemonId}:`, error)
      return null
    }
  }

  /**
   * Format height (decimetres to meters/feet)
   */
  function formatHeight(heightInDecimetres: number): { metric: string, imperial: string } {
    const meters = heightInDecimetres / 10
    const totalInches = meters * 39.3701
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)

    return {
      metric: `${meters.toFixed(2)} m`,
      imperial: `${feet}'${inches}"`,
    }
  }

  /**
   * Format weight (hectograms to kg/lbs)
   */
  function formatWeight(weightInHectograms: number): { metric: string, imperial: string } {
    const kg = weightInHectograms / 10
    const lbs = kg * 2.20462

    return {
      metric: `${kg.toFixed(1)} kg`,
      imperial: `${lbs.toFixed(1)} lbs`,
    }
  }

  /**
   * Get cached data (reactive)
   */
  function getCachedData(pokemonId: number) {
    return computed(() => cache.get(pokemonId) || { pokemon: null, species: null, loading: false, error: null })
  }

  /**
   * Clear cache for a specific Pokemon or all
   */
  function clearCache(pokemonId?: number) {
    if (pokemonId) {
      cache.delete(pokemonId)
    }
    else {
      cache.clear()
    }
  }

  return {
    fetchPokemon,
    fetchSpecies,
    formatHeight,
    formatWeight,
    getCachedData,
    clearCache,
  }
}
