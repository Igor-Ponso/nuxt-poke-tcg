/**
 * Pokemon Store (Pinia)
 *
 * Manages Pokemon data state, caching, and business logic
 * Follows the approved patterns from Pokedex-vue
 */

import { defineStore } from 'pinia'
import type { SimplifiedPokemon, PokemonCardData, PokemonType } from '~/types'
import { GENERATIONS } from '~/utils/constants'

interface PokemonState {
  // Pokemon list
  pokemons: SimplifiedPokemon[]
  currentPage: number
  totalCount: number
  hasMore: boolean

  // Selected Pokemon
  selectedPokemon: PokemonCardData | null
  selectedPokemonId: number | null

  // Favorites (Team)
  favorites: SimplifiedPokemon[]

  // Filters
  selectedGeneration: number | null
  selectedType: string | null
  searchQuery: string

  // UI State
  loading: boolean
  error: string | null

  // View mode
  viewMode: 'grid' | 'list'
  showingFavorites: boolean

  // Game sprite version (null = official artwork)
  selectedGameVersion: string | null
}

export const usePokemonStore = defineStore('pokemon', {
  state: (): PokemonState => ({
    pokemons: [],
    currentPage: 1,
    totalCount: 1025, // Total Pokemon as of Gen 9
    hasMore: true,

    selectedPokemon: null,
    selectedPokemonId: null,

    favorites: [],

    selectedGeneration: null,
    selectedType: null,
    searchQuery: '',

    loading: false,
    error: null,

    viewMode: 'grid',
    showingFavorites: false,

    selectedGameVersion: null, // null = official artwork
  }),

  getters: {
    /**
     * Filtered Pokemon based on current filters
     */
    filteredPokemons(state): SimplifiedPokemon[] {
      let filtered = state.pokemons

      // Filter by generation
      if (state.selectedGeneration !== null) {
        const gen = GENERATIONS.find(g => g.id === state.selectedGeneration)
        if (gen) {
          filtered = filtered.filter(
            p => p.id >= gen.range.start && p.id <= gen.range.end,
          )
        }
      }

      // Filter by type
      if (state.selectedType) {
        filtered = filtered.filter(p => p.types.includes(state.selectedType as PokemonType))
      }

      // DO NOT filter by searchQuery here!
      // The searchPokemons() action already handles search via API
      // and returns the correct results in state.pokemons
      // Double-filtering would exclude valid results (e.g., "mega" search returns Charizard,
      // but filtering "charizard" by "mega" would remove it)

      return filtered
    },

    /**
     * Check if a Pokemon is favorited
     */
    isFavorite: state => (id: number): boolean => {
      return state.favorites.some(p => p.id === id)
    },

    /**
     * Get favorite count
     */
    favoriteCount(state): number {
      return state.favorites.length
    },

    /**
     * Get Pokemon count
     */
    pokemonCount(state): number {
      return state.pokemons.length
    },

    /**
     * Check if filters are active
     */
    hasActiveFilters(state): boolean {
      return !!(
        state.selectedGeneration
        || state.selectedType
        || state.searchQuery
      )
    },
  },

  actions: {
    /**
     * Fetches Pokemon list (paginated)
     */
    async fetchPokemons(page = 1, limit = 20) {
      this.loading = true
      this.error = null

      try {
        const api = usePokemonApi()
        const offset = (page - 1) * limit

        const list = await api.fetchPokemonList(limit, offset)
        const pokemonData = await Promise.all(
          list.results.map(async (p) => {
            const id = extractIdFromUrl(p.url)
            const pokemon = await api.fetchPokemon(id)
            return api.simplifyPokemon(pokemon)
          }),
        )

        // Append to existing list or replace based on page
        if (page === 1) {
          this.pokemons = pokemonData
        }
        else {
          this.pokemons.push(...pokemonData)
        }

        this.currentPage = page
        this.hasMore = this.pokemons.length < this.totalCount
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch Pokemon'
        console.error('Error fetching Pokemon:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Fetches Pokemon by generation (paginated with infinite scroll)
     */
    async fetchByGeneration(generationId: number, page = 1, limit = 20) {
      const gen = GENERATIONS.find(g => g.id === generationId)
      if (!gen) return

      this.loading = true
      this.error = null
      this.selectedGeneration = generationId

      try {
        const api = usePokemonApi()

        // Calculate offset within this generation
        const offset = (page - 1) * limit
        const totalInGen = gen.range.end - gen.range.start + 1

        // Check if we have more to load
        this.hasMore = (offset + limit) < totalInGen

        // Get the IDs for this page
        const startId = gen.range.start + offset
        const endId = Math.min(startId + limit, gen.range.end + 1)
        const ids = Array.from(
          { length: endId - startId },
          (_, i) => startId + i,
        )

        // Fetch this batch
        const batchData = await api.fetchPokemonBatch(ids)
        const simplified = batchData.map(p => api.simplifyPokemon(p))

        // Append or replace based on page
        if (page === 1) {
          this.pokemons = simplified
        }
        else {
          this.pokemons.push(...simplified)
        }

        this.currentPage = page
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch generation'
        console.error('Error fetching generation:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Searches Pokemon
     */
    async searchPokemons(query: string) {
      this.searchQuery = query

      if (!query) {
        // Reset to initial list
        await this.fetchPokemons(1)
        return
      }

      this.loading = true
      this.error = null

      try {
        const api = usePokemonApi()
        const results = await api.searchPokemon(query, 50)
        this.pokemons = results
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Search failed'
        console.error('Error searching Pokemon:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Selects a Pokemon for detailed view
     */
    async selectPokemon(id: number) {
      this.selectedPokemonId = id
      this.loading = true
      this.error = null

      try {
        const api = usePokemonApi()
        this.selectedPokemon = await api.getPokemonCardData(id)
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load Pokemon details'
        console.error('Error loading Pokemon details:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Clears selected Pokemon
     */
    clearSelection() {
      this.selectedPokemon = null
      this.selectedPokemonId = null
    },

    /**
     * Toggles Pokemon favorite status
     */
    toggleFavorite(pokemon: SimplifiedPokemon) {
      const index = this.favorites.findIndex(p => p.id === pokemon.id)

      if (index >= 0) {
        // Remove from favorites
        this.favorites.splice(index, 1)
      }
      else {
        // Add to favorites (max 6 for a team)
        if (this.favorites.length < 6) {
          this.favorites.push(pokemon)
        }
        else {
          console.warn('Maximum of 6 Pokemon in favorites')
        }
      }

      // Save to localStorage
      this.saveFavoritesToStorage()
    },

    /**
     * Sets type filter
     */
    setTypeFilter(type: string | null) {
      this.selectedType = type
    },

    /**
     * Sets generation filter
     */
    setGenerationFilter(generation: number | null) {
      this.selectedGeneration = generation
    },

    /**
     * Clears all filters
     */
    clearFilters() {
      this.selectedGeneration = null
      this.selectedType = null
      this.searchQuery = ''
    },

    /**
     * Toggles view mode
     */
    setViewMode(mode: 'grid' | 'list') {
      this.viewMode = mode
    },

    /**
     * Toggles showing favorites
     */
    toggleShowingFavorites() {
      this.showingFavorites = !this.showingFavorites
    },

    /**
     * Sets game sprite version
     */
    setGameVersion(version: string | null) {
      this.selectedGameVersion = version
    },

    /**
     * Load favorites from localStorage
     */
    loadFavoritesFromStorage() {
      if (import.meta.client) {
        try {
          const stored = localStorage.getItem('pokemon_favorites')
          if (stored) {
            this.favorites = JSON.parse(stored)
          }
        }
        catch (error) {
          console.warn('Failed to load favorites:', error)
        }
      }
    },

    /**
     * Save favorites to localStorage
     */
    saveFavoritesToStorage() {
      if (import.meta.client) {
        try {
          localStorage.setItem('pokemon_favorites', JSON.stringify(this.favorites))
        }
        catch (error) {
          console.warn('Failed to save favorites:', error)
        }
      }
    },

    /**
     * Initialize store (load from cache/storage)
     */
    async initialize() {
      this.loadFavoritesFromStorage()

      // Load first page if no Pokemon loaded
      if (this.pokemons.length === 0) {
        await this.fetchPokemons(1)
      }
    },
  },
})
