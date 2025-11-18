/**
 * Pokemon Forms Cache Composable
 *
 * Centralized cache for Pokemon forms to avoid duplicate API requests
 * Significantly improves performance when rendering multiple cards
 */

import type { PokemonForm } from './usePokemonForms'

interface FormsCacheEntry {
  forms: PokemonForm[]
  timestamp: number
}

// Global cache shared across all components
const formsCache = new Map<number, FormsCacheEntry>()
const pendingRequests = new Map<number, Promise<PokemonForm[]>>()

// Cache TTL: 30 minutes
const CACHE_TTL = 30 * 60 * 1000

export function usePokemonFormsCache() {
  const { getAvailableFormsForPokemon } = usePokemonForms()

  /**
   * Get forms for a Pokemon with caching
   * If forms are already being fetched, returns the same promise
   * If forms are cached and not expired, returns cached data
   */
  async function getFormsWithCache(pokemonId: number): Promise<PokemonForm[]> {
    // Check cache first
    const cached = formsCache.get(pokemonId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.forms
    }

    // Check if request is already in progress
    const pending = pendingRequests.get(pokemonId)
    if (pending) {
      return pending
    }

    // Create new request
    const promise = getAvailableFormsForPokemon(pokemonId)
      .then((forms) => {
        // Cache the result
        formsCache.set(pokemonId, {
          forms,
          timestamp: Date.now(),
        })
        // Remove from pending
        pendingRequests.delete(pokemonId)
        return forms
      })
      .catch((error) => {
        // Remove from pending on error
        pendingRequests.delete(pokemonId)
        throw error
      })

    // Add to pending
    pendingRequests.set(pokemonId, promise)

    return promise
  }

  /**
   * Clear cache for a specific Pokemon
   */
  function clearCache(pokemonId: number) {
    formsCache.delete(pokemonId)
  }

  /**
   * Clear all cached forms
   */
  function clearAllCache() {
    formsCache.clear()
  }

  /**
   * Get cache size
   */
  function getCacheSize() {
    return formsCache.size
  }

  return {
    getFormsWithCache,
    clearCache,
    clearAllCache,
    getCacheSize,
  }
}
