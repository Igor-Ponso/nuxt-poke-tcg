/**
 * Pokemon 3D Models Composable
 *
 * Provides methods to fetch and manage Pokemon 3D models from Pokemon3D API
 * Models are in GLB format, optimized for web viewing
 */

export type Pokemon3DFormName =
  | 'regular'
  | 'shiny'
  | 'mega'
  | 'megaShiny'
  | 'xy' // Mega X/Y
  | 'sxy' // Shiny Mega X/Y
  | 'gmax' // Gigantamax
  | 'gmaxShiny' // Shiny Gigantamax
  | 'alolan'
  | 'galarian'
  | 'hisuian'
  | 'paldean'
  | 'primal'
  | 'origin'

export interface Pokemon3DModel {
  name: string
  model: string
  formName: Pokemon3DFormName
}

export interface Pokemon3DData {
  id: number
  forms: Pokemon3DModel[]
}

// API returns an array directly, not wrapped in an object
export type Pokemon3DResponse = Pokemon3DData[]

export function usePokemon3D() {
  const BASE_URL = 'https://pokemon-3d-api.onrender.com/v1'
  const CDN_BASE = 'https://raw.githubusercontent.com/Sudhanshu-Ambastha/Pokemon-3D-api/main/models/opt'

  /**
   * Fetches all Pokemon 3D data from API
   */
  async function fetchAllPokemon3D(): Promise<Pokemon3DResponse> {
    const cache = useCache<Pokemon3DResponse>('pokemon_3d_all', {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days (3D data changes rarely)
      prefix: 'pokemon3d',
    })

    const cached = cache.get()
    if (cached) {
      return cached
    }

    const response = await $fetch<Pokemon3DResponse>(`${BASE_URL}/pokemon`)
    cache.set(response)
    return response
  }

  /**
   * Gets 3D model URL for a specific Pokemon by ID and form
   * Now supports direct model URL from API response
   */
  function getModelUrl(pokemonId: number, form: Pokemon3DFormName = 'regular'): string {
    // Fallback to CDN path construction for backward compatibility
    return `${CDN_BASE}/${form}/${pokemonId}.glb`
  }

  /**
   * Gets the correct model URL from the forms array
   * Preferred method as it uses the actual API data
   */
  async function getModelUrlByForm(pokemonId: number, formName: Pokemon3DFormName): Promise<string | null> {
    const pokemon = await fetchPokemon3D(pokemonId)
    if (!pokemon) return null

    const form = pokemon.forms.find(f => f.formName === formName)
    return form?.model || null
  }

  /**
   * Fetches 3D model data for a specific Pokemon
   */
  async function fetchPokemon3D(pokemonId: number): Promise<Pokemon3DData | null> {
    try {
      const allData = await fetchAllPokemon3D()
      const pokemon = allData.find(p => p.id === pokemonId)
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
   * Returns array of form names
   */
  async function getAvailableForms(pokemonId: number): Promise<Pokemon3DFormName[]> {
    const pokemon = await fetchPokemon3D(pokemonId)
    if (!pokemon) return []
    return pokemon.forms.map(f => f.formName)
  }

  /**
   * Gets all form data for a Pokemon
   * Returns complete form objects with names and model URLs
   */
  async function getAllForms(pokemonId: number): Promise<Pokemon3DModel[]> {
    console.log(`[usePokemon3D] getAllForms called for Pokemon #${pokemonId}`)
    const pokemon = await fetchPokemon3D(pokemonId)
    console.log(`[usePokemon3D] fetchPokemon3D result:`, pokemon)
    if (!pokemon) {
      console.warn(`[usePokemon3D] No 3D model found for Pokemon #${pokemonId}`)
      return []
    }
    console.log(`[usePokemon3D] Returning ${pokemon.forms.length} forms:`, pokemon.forms)
    return pokemon.forms
  }

  /**
   * Format form name for display
   */
  function formatFormName(formName: Pokemon3DFormName): string {
    const formattedNames: Record<Pokemon3DFormName, string> = {
      regular: 'Regular',
      shiny: 'Shiny',
      mega: 'Mega',
      megaShiny: 'Shiny Mega',
      xy: 'Mega X/Y',
      sxy: 'Shiny Mega X/Y',
      gmax: 'Gigantamax',
      gmaxShiny: 'Shiny Gigantamax',
      alolan: 'Alolan',
      galarian: 'Galarian',
      hisuian: 'Hisuian',
      paldean: 'Paldean',
      primal: 'Primal',
      origin: 'Origin',
    }
    return formattedNames[formName] || formName
  }

  /**
   * Get icon for form type
   */
  function getFormIcon(formName: Pokemon3DFormName): string {
    const formIcons: Record<Pokemon3DFormName, string> = {
      regular: 'ph:circle',
      shiny: 'ph:sparkle-fill',
      mega: 'ph:lightning-fill',
      megaShiny: 'ph:lightning-fill',
      xy: 'ph:lightning-fill',
      sxy: 'ph:lightning-fill',
      gmax: 'ph:arrow-up-bold',
      gmaxShiny: 'ph:arrow-up-bold',
      alolan: 'ph:sun-bold',
      galarian: 'ph:shield-fill',
      hisuian: 'ph:mountains-fill',
      paldean: 'ph:star-fill',
      primal: 'ph:fire-fill',
      origin: 'ph:atom-bold',
    }
    return formIcons[formName] || 'ph:circle'
  }

  /**
   * Preloads a model to improve loading times
   */
  async function preloadModel(url: string): Promise<void> {
    try {
      await $fetch(url, { method: 'HEAD' })
    }
    catch {
      console.warn('Failed to preload model:', url)
    }
  }

  return {
    fetchAllPokemon3D,
    fetchPokemon3D,
    getModelUrl,
    getModelUrlByForm,
    hasModel,
    getAvailableForms,
    getAllForms,
    formatFormName,
    getFormIcon,
    preloadModel,
  }
}
