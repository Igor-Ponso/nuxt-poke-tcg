/**
 * Pokemon Forms Composable
 *
 * Provides methods to fetch and manage Pokemon Forms from PokeAPI
 * Supports searching by form types (mega, gmax, alolan, galarian, etc.)
 */

export interface PokemonFormName {
  language: {
    name: string
    url: string
  }
  name: string
}

export interface PokemonForm {
  id: number
  name: string // e.g., "charizard-mega-x"
  form_name: string // e.g., "mega-x"
  form_names: PokemonFormName[] // Translated names
  is_battle_only: boolean
  is_default: boolean
  is_mega: boolean
  order: number
  pokemon: {
    name: string // Base pokemon name
    url: string
  }
  sprites: {
    front_default: string | null
    front_shiny: string | null
    back_default: string | null
    back_shiny: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
  types: Array<{
    slot: number
    type: {
      name: string
      url: string
    }
  }>
  version_group: {
    name: string
    url: string
  }
}

export interface PokemonFormsList {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

export function usePokemonForms() {
  const BASE_URL = 'https://pokeapi.co/api/v2'

  /**
   * Fetches all Pokemon Forms from API (with caching)
   * This is a large dataset, so we cache it for 7 days
   */
  async function fetchAllForms(): Promise<PokemonFormsList> {
    const cache = useCache<PokemonFormsList>('pokemon_forms_list', {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      prefix: 'pokeforms',
    })

    const cached = cache.get()
    if (cached) {
      return cached
    }

    // Fetch all forms (there are ~1400+ forms)
    const response = await $fetch<PokemonFormsList>(`${BASE_URL}/pokemon-form?limit=2000`)
    cache.set(response)
    return response
  }

  /**
   * Fetches a specific Pokemon Form by name
   */
  async function fetchForm(formName: string): Promise<PokemonForm | null> {
    try {
      const form = await $fetch<PokemonForm>(`${BASE_URL}/pokemon-form/${formName}`)
      return form
    }
    catch (error) {
      console.error(`Failed to fetch form ${formName}:`, error)
      return null
    }
  }


  /**
   * Get English form name from form_names array
   */
  function getEnglishFormName(form: PokemonForm): string {
    const englishName = form.form_names.find(fn => fn.language.name === 'en')
    return englishName?.name || form.form_name
  }

  /**
   * Search for Pokemon IDs that have forms matching a keyword
   * Keywords: mega, gmax, alolan, galarian, hisuian, paldean, primal, origin, etc.
   * Returns unique Pokemon IDs
   */
  async function searchPokemonByFormType(keyword: string): Promise<number[]> {
    const allForms = await fetchAllForms()
    const normalizedKeyword = keyword.toLowerCase().trim()

    // Filter forms that match the keyword
    const matchingForms = allForms.results.filter(formResult => {
      const formName = formResult.name.toLowerCase()

      // Extract base Pokemon name (before first hyphen)
      const baseName = formResult.name.split('-')[0]

      // For "mega" keyword, we need to be more specific:
      // INCLUDE: charizard-mega-x, charizard-mega-y (form contains "-mega")
      // EXCLUDE: meganium (base name contains "mega")
      if (normalizedKeyword === 'mega') {
        // Only match if there's a hyphen before "mega" (it's a form, not part of the name)
        return formName.includes('-mega') && !baseName.toLowerCase().includes('mega')
      }

      // Check if form name contains the keyword
      // Examples:
      // - "gmax" matches: charizard-gmax, pikachu-gmax
      // - "alolan" matches: vulpix-alola, ninetales-alola, raichu-alola
      // - "galarian" matches: ponyta-galar, rapidash-galar, slowpoke-galar

      return (
        formName.includes(`-${normalizedKeyword}`) ||
        // Handle variations
        (normalizedKeyword === 'alolan' && formName.includes('-alola')) ||
        (normalizedKeyword === 'galarian' && formName.includes('-galar')) ||
        (normalizedKeyword === 'hisuian' && formName.includes('-hisui')) ||
        (normalizedKeyword === 'paldean' && formName.includes('-paldea')) ||
        (normalizedKeyword === 'gmax' && formName.includes('-gmax')) ||
        (normalizedKeyword === 'gigantamax' && formName.includes('-gmax'))
      )
    })

    // Extract unique base Pokemon names (not IDs yet - we'll resolve them in bulk)
    const basePokemonNames = new Set<string>()

    for (const formResult of matchingForms.slice(0, 50)) {
      // Extract base name from form name: "charizard-mega-x" -> "charizard"
      const baseName = formResult.name.split('-')[0]
      basePokemonNames.add(baseName)
    }

    // Now fetch Pokemon IDs for all unique base names in parallel
    const pokemonIds = new Set<number>()

    const promises = Array.from(basePokemonNames).map(async (baseName) => {
      try {
        // Fetch base Pokemon to get its ID
        const pokemon = await $fetch<{ id: number }>(`${BASE_URL}/pokemon/${baseName}`)
        return pokemon.id
      }
      catch (error) {
        console.error(`Failed to fetch Pokemon ${baseName}:`, error)
        return null
      }
    })

    const ids = await Promise.all(promises)

    // Add all valid IDs to the set
    for (const id of ids) {
      if (id && id > 0 && id <= 1025) {
        pokemonIds.add(id)
      }
    }

    const finalIds = Array.from(pokemonIds).sort((a, b) => a - b)
    console.log(`[Pokemon Forms] Found ${finalIds.length} unique Pokemon with "${keyword}" forms:`, finalIds)
    return finalIds
  }

  /**
   * Check if a form name matches common form keywords
   */
  function isSpecialForm(formName: string): boolean {
    const specialFormKeywords = [
      'mega',
      'gmax',
      'gigantamax',
      'alola',
      'alolan',
      'galar',
      'galarian',
      'hisui',
      'hisuian',
      'paldea',
      'paldean',
      'primal',
      'origin',
    ]

    const normalized = formName.toLowerCase()
    return specialFormKeywords.some(keyword => normalized.includes(keyword))
  }

  /**
   * Get all available forms for a specific Pokemon by ID
   * Returns array of form objects with sprites and metadata
   * Enhanced to fetch official artwork from /pokemon endpoint
   */
  async function getAvailableFormsForPokemon(pokemonId: number): Promise<PokemonForm[]> {
    try {
      const allForms = await fetchAllForms()

      // Get base Pokemon name by fetching it
      const basePokemon = await $fetch<{ name: string }>(`${BASE_URL}/pokemon/${pokemonId}`)
      const baseName = basePokemon.name

      // Find all forms that belong to this Pokemon
      const pokemonForms = allForms.results.filter(formResult => {
        // Extract base name from form name (e.g., "charizard-mega-x" -> "charizard")
        const formBaseName = formResult.name.split('-')[0]
        return formBaseName === baseName
      })

      // Fetch full form data for each form
      const formsData = await Promise.all(
        pokemonForms.map(async (formResult) => {
          try {
            // Fetch form metadata from /pokemon-form endpoint
            const form = await fetchForm(formResult.name)
            if (!form)
              return null

            // For special forms (not base form), fetch official artwork from /pokemon endpoint
            // Extract Pokemon ID from form.pokemon.url (e.g., ".../pokemon/10033/" -> 10033)
            if (form.id >= 10000 || form.is_mega || form.form_name) {
              try {
                // Extract ID from pokemon.url instead of using form.id
                const pokemonIdMatch = form.pokemon.url.match(/\/pokemon\/(\d+)\/$/)
                const pokemonId = pokemonIdMatch ? parseInt(pokemonIdMatch[1], 10) : null

                if (pokemonId) {
                  const pokemonData = await $fetch<any>(`${BASE_URL}/pokemon/${pokemonId}`)
                  // Merge official artwork into form sprites if available
                  if (pokemonData.sprites?.other?.['official-artwork']) {
                    form.sprites.other = pokemonData.sprites.other
                  }
                }
              }
              catch (artworkError) {
                // Fallback to form sprites if pokemon endpoint fails
                console.warn(`Could not fetch official artwork for form ${form.name}`)
              }
            }

            return form
          }
          catch (error) {
            console.error(`Failed to fetch form ${formResult.name}:`, error)
            return null
          }
        }),
      )

      // Filter out null results and return
      return formsData.filter(f => f !== null) as PokemonForm[]
    }
    catch (error) {
      console.error(`Failed to fetch forms for Pokemon #${pokemonId}:`, error)
      return []
    }
  }

  return {
    fetchAllForms,
    fetchForm,
    searchPokemonByFormType,
    isSpecialForm,
    getEnglishFormName,
    getAvailableFormsForPokemon,
  }
}
