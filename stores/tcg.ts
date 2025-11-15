/**
 * TCG Store (Pinia)
 *
 * Manages Pokemon TCG card data state
 */

import { defineStore } from 'pinia'
import type { TCGCard, TCGSet, SimplifiedTCGCard, TCGRarity } from '~/types'

interface TCGState {
  // Cards
  cards: SimplifiedTCGCard[]
  selectedCard: TCGCard | null
  currentPage: number
  totalCount: number
  hasMore: boolean

  // Sets
  sets: TCGSet[]
  selectedSet: TCGSet | null

  // Filters
  selectedRarity: string | null
  selectedSetId: string | null
  searchQuery: string

  // UI State
  loading: boolean
  error: string | null

  // TCG Mode settings
  tcgMode: boolean
  holographicEnabled: boolean
  holographicType: 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism'
}

export const useTCGStore = defineStore('tcg', {
  state: (): TCGState => ({
    cards: [],
    selectedCard: null,
    currentPage: 1,
    totalCount: 0,
    hasMore: true,

    sets: [],
    selectedSet: null,

    selectedRarity: null,
    selectedSetId: null,
    searchQuery: '',

    loading: false,
    error: null,

    tcgMode: false,
    holographicEnabled: true,
    holographicType: 'standard',
  }),

  getters: {
    /**
     * Filtered cards based on current filters
     */
    filteredCards(state): SimplifiedTCGCard[] {
      let filtered = state.cards

      // Filter by rarity
      if (state.selectedRarity) {
        filtered = filtered.filter(c => c.rarity === state.selectedRarity)
      }

      // Filter by set
      if (state.selectedSetId) {
        filtered = filtered.filter(c => c.setName === state.selectedSetId)
      }

      // Filter by search
      if (state.searchQuery) {
        filtered = filtered.filter(c => matchesSearch(c.name, state.searchQuery))
      }

      return filtered
    },

    /**
     * Check if filters are active
     */
    hasActiveFilters(state): boolean {
      return !!(
        state.selectedRarity
        || state.selectedSetId
        || state.searchQuery
      )
    },

    /**
     * Get card count
     */
    cardCount(state): number {
      return state.cards.length
    },

    /**
     * Get sets grouped by series
     */
    setsBySeries(state): Record<string, TCGSet[]> {
      return state.sets.reduce((acc, set) => {
        const series = set.series || 'Other'
        if (!acc[series]) {
          acc[series] = []
        }
        acc[series].push(set)
        return acc
      }, {} as Record<string, TCGSet[]>)
    },
  },

  actions: {
    /**
     * Fetches all TCG sets
     */
    async fetchSets() {
      this.loading = true
      this.error = null

      try {
        const api = useTCGApi()
        this.sets = await api.fetchSets()
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch sets'
        console.error('Error fetching sets:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Fetches cards by Pokemon name
     */
    async fetchCardsByPokemon(pokemonName: string, page = 1) {
      this.loading = true
      this.error = null

      try {
        const api = useTCGApi()
        const response = await api.fetchCardsByPokemon(pokemonName, page, 20)

        const simplified = response.data.map(card => api.simplifyTCGCard(card))

        // Append or replace based on page
        if (page === 1) {
          this.cards = simplified
        }
        else {
          this.cards.push(...simplified)
        }

        this.currentPage = page
        this.totalCount = response.totalCount || 0
        this.hasMore = this.cards.length < this.totalCount
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch cards'
        console.error('Error fetching cards:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Fetches cards by set
     */
    async fetchCardsBySet(setId: string, page = 1) {
      this.loading = true
      this.error = null
      this.selectedSetId = setId

      try {
        const api = useTCGApi()
        const response = await api.fetchCardsBySet(setId, page, 20)

        const simplified = response.data.map(card => api.simplifyTCGCard(card))

        if (page === 1) {
          this.cards = simplified
        }
        else {
          this.cards.push(...simplified)
        }

        this.currentPage = page
        this.totalCount = response.totalCount || 0
        this.hasMore = this.cards.length < this.totalCount
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch cards'
        console.error('Error fetching cards:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Searches cards
     */
    async searchCards(params: { name?: string; page?: number; pageSize?: number; rarity?: TCGRarity; set?: string } = {}) {
      const { name, page = 1, pageSize = 20, rarity, set } = params

      if (name) {
        this.searchQuery = name
      }
      this.loading = true
      this.error = null

      try {
        const api = useTCGApi()
        const response = await api.searchCards({
          name,
          page,
          pageSize,
          rarity,
          set,
        })

        const simplified = response.data.map(card => api.simplifyTCGCard(card))

        if (page === 1) {
          this.cards = simplified
        }
        else {
          this.cards.push(...simplified)
        }

        this.currentPage = page
        this.totalCount = response.totalCount || 0
        this.hasMore = this.cards.length < this.totalCount
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Search failed'
        console.error('Error searching cards:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Selects a card for detailed view
     */
    async selectCard(id: string) {
      this.loading = true
      this.error = null

      try {
        const api = useTCGApi()
        this.selectedCard = await api.fetchCard(id)

        // Auto-detect holographic type
        if (this.selectedCard) {
          this.holographicType = api.getHolographicType(this.selectedCard)
        }
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load card'
        console.error('Error loading card:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * Clears selected card
     */
    clearSelection() {
      this.selectedCard = null
    },

    /**
     * Toggles TCG mode
     */
    toggleTCGMode() {
      this.tcgMode = !this.tcgMode

      // Save preference
      if (import.meta.client) {
        localStorage.setItem('tcg_mode', String(this.tcgMode))
      }
    },

    /**
     * Enables TCG mode
     */
    enableTCGMode() {
      this.tcgMode = true
      if (import.meta.client) {
        localStorage.setItem('tcg_mode', 'true')
      }
    },

    /**
     * Disables TCG mode
     */
    disableTCGMode() {
      this.tcgMode = false
      if (import.meta.client) {
        localStorage.setItem('tcg_mode', 'false')
      }
    },

    /**
     * Toggles holographic effect
     */
    toggleHolographic() {
      this.holographicEnabled = !this.holographicEnabled

      if (import.meta.client) {
        localStorage.setItem('holographic_enabled', String(this.holographicEnabled))
      }
    },

    /**
     * Sets holographic type
     */
    setHolographicType(type: TCGState['holographicType']) {
      this.holographicType = type

      if (import.meta.client) {
        localStorage.setItem('holographic_type', type)
      }
    },

    /**
     * Sets rarity filter
     */
    setRarityFilter(rarity: string | null) {
      this.selectedRarity = rarity
    },

    /**
     * Sets set filter
     */
    setSetFilter(setId: string | null) {
      this.selectedSetId = setId
    },

    /**
     * Clears all filters
     */
    clearFilters() {
      this.selectedRarity = null
      this.selectedSetId = null
      this.searchQuery = ''
    },

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
      if (import.meta.client) {
        try {
          const tcgMode = localStorage.getItem('tcg_mode')
          if (tcgMode !== null) {
            this.tcgMode = tcgMode === 'true'
          }

          const holoEnabled = localStorage.getItem('holographic_enabled')
          if (holoEnabled !== null) {
            this.holographicEnabled = holoEnabled === 'true'
          }

          const holoType = localStorage.getItem('holographic_type')
          if (holoType) {
            this.holographicType = holoType as any
          }
        }
        catch (error) {
          console.warn('Failed to load preferences:', error)
        }
      }
    },

    /**
     * Initialize store
     */
    async initialize() {
      this.loadPreferences()

      // Load sets if not loaded
      if (this.sets.length === 0) {
        await this.fetchSets()
      }
    },
  },
})
