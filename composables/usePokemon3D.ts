/**
 * Pokemon 3D Models Composable
 *
 * Provides methods to fetch and manage Pokemon 3D models from Pokemon3D API
 * Models are in GLB format, optimized for web viewing
 */

export interface Pokemon3DModel {
  name: string
  model: string
  formName: 'regular' | 'shiny' | 'mega' | 'alolan' | 'galarian' | 'hisuian'
}

export interface Pokemon3DData {
  id: number
  forms: Pokemon3DModel[]
}

export interface Pokemon3DResponse {
  pokemon: Pokemon3DData[]
}

export function usePokemon3D() {
  const BASE_URL = 'https://pokemon-3d-api.onrender.com/v1'
  const CDN_BASE = 'https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D-api/main/models/opt'

  /**
   * Fetches all Pokemon 3D data from API
   */
  async function fetchAllPokemon3D(): Promise<Pokemon3DResponse> {
    const cacheKey = 'pokemon_3d_all'
    const cached = getFromCache<Pokemon3DResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await $fetch<Pokemon3DResponse>(`${BASE_URL}/pokemon`)
    saveToCache(cacheKey, response)
    return response
  }

  /**
   * Gets 3D model URL for a specific Pokemon by ID
   */
  function getModelUrl(pokemonId: number, form: 'regular' | 'shiny' = 'regular'): string {
    return `${CDN_BASE}/${form}/${pokemonId}.glb`
  }

  /**
   * Fetches 3D model data for a specific Pokemon
   */
  async function fetchPokemon3D(pokemonId: number): Promise<Pokemon3DData | null> {
    try {
      const allData = await fetchAllPokemon3D()
      const pokemon = allData.pokemon.find(p => p.id === pokemonId)
      return pokemon || null
    }
    catch (error) {
      console.error(`Failed to fetch 3D model for Pokemon #${pokemonId}:`, error)
      return null
    }
  }

  /**
   * Checks if a Pokemon has a 3D model available
   */
  async function hasModel(pokemonId: number): Promise<boolean> {
    const pokemon = await fetchPokemon3D(pokemonId)
    return pokemon !== null && pokemon.forms.length > 0
  }

  /**
   * Gets available forms for a Pokemon
   */
  async function getAvailableForms(pokemonId: number): Promise<string[]> {
    const pokemon = await fetchPokemon3D(pokemonId)
    if (!pokemon) return []
    return pokemon.forms.map(f => f.formName)
  }

  /**
   * Preloads a model to improve loading times
   */
  async function preloadModel(url: string): Promise<void> {
    try {
      await $fetch(url, { method: 'HEAD' })
    }
    catch (error) {
      console.warn('Failed to preload model:', url)
    }
  }

  return {
    fetchAllPokemon3D,
    fetchPokemon3D,
    getModelUrl,
    hasModel,
    getAvailableForms,
    preloadModel,
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

      // Cache for 7 days (3D data changes rarely)
      if (age < 7 * 24 * 60 * 60 * 1000) {
        return data as T
      }

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
