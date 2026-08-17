/**
 * TCG Store (Pinia)
 *
 * Manages Pokemon TCG card data state
 */

import { defineStore } from 'pinia'
import type { TCGCard, TCGSet, SimplifiedTCGCard, TCGRarity, TCGSupertype } from '~/types'

/** Everything that narrows a card query. The API does the filtering, not the client. */
export interface TCGCardFilters {
  name?: string
  rarity?: TCGRarity
  set?: string
  supertype?: TCGSupertype
}

/** The gallery opens here: 102 cards, one per Pokémon, and the Charizard everyone knows. */
export const DEFAULT_SET_ID = 'base1'

const PAGE_SIZE = 20

interface TCGState {
  // Cards
  cards: SimplifiedTCGCard[]
  selectedCard: TCGCard | null
  currentPage: number
  totalCount: number
  hasMore: boolean

  // Sets
  sets: TCGSet[]

  // Active query — mirrors what was last sent to the API
  filters: TCGCardFilters

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

    filters: { set: DEFAULT_SET_ID },

    loading: false,
    error: null,

    tcgMode: false,
    holographicEnabled: true,
    holographicType: 'standard',
  }),

  getters: {
    /**
     * Get card count
     */
    cardCount(state): number {
      return state.cards.length
    },

    /**
     * Sets grouped by series, newest series first and newest set first within each.
     * Feeds the Series → Collection pickers in TCGFilters.
     */
    setsBySeries(state): Record<string, TCGSet[]> {
      const grouped = state.sets.reduce((acc, set) => {
        const series = set.series || 'Other'
        ;(acc[series] ||= []).push(set)
        return acc
      }, {} as Record<string, TCGSet[]>)

      for (const sets of Object.values(grouped)) {
        sets.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
      }

      // Object key order drives the <optgroup> order in the picker
      return Object.fromEntries(
        Object.entries(grouped).sort(
          ([, a], [, b]) => (b[0]?.releaseDate || '').localeCompare(a[0]?.releaseDate || ''),
        ),
      )
    },

    /**
     * The set currently being browsed, if any
     */
    currentSet(state): TCGSet | null {
      return state.sets.find(s => s.id === state.filters.set) || null
    },

    /**
     * How many filters beyond the free-text search are narrowing the view
     */
    activeFilterCount(state): number {
      return [state.filters.rarity, state.filters.set, state.filters.supertype].filter(Boolean).length
    },
  },

  actions: {
    /**
     * Fetches all TCG sets
     */
    async fetchSets() {
      // Deliberately does not touch `loading`: that flag drives the card grid, and this
      // runs in parallel with the first card query. A failed set list only costs the
      // pickers their options, so it must not blank the gallery either.
      try {
        const api = useTCGApi()
        this.sets = await api.fetchSets()
      }
      catch (error) {
        console.error('Error fetching sets:', error)
      }
    },

    /**
     * Runs a card query. Page 1 replaces the grid, later pages append to it.
     *
     * The API does all the filtering and ordering — results are never filtered again
     * client-side, which is what used to strand the grid on a stale search term.
     */
    async searchCards(filters?: TCGCardFilters, page = 1) {
      this.filters = { ...(filters ?? this.filters) }
      this.loading = true
      this.error = null

      try {
        const api = useTCGApi()
        const response = await api.searchCards({ ...this.filters, page, pageSize: PAGE_SIZE })
        const simplified = response.data.map(card => api.simplifyTCGCard(card))

        this.cards = page === 1 ? simplified : [...this.cards, ...simplified]
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
     * Loads the next page of the current query
     */
    async loadMore() {
      if (this.loading || !this.hasMore) return
      await this.searchCards(this.filters, this.currentPage + 1)
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
     * Drops every filter and goes back to the default collection
     */
    resetFilters() {
      return this.searchCards({ set: DEFAULT_SET_ID })
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
            this.holographicType = holoType as 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism'
          }
        }
        catch (error) {
          console.warn('Failed to load preferences:', error)
        }
      }
    },

    /**
     * Initialize store: preferences, the set list that feeds the pickers, and the
     * opening collection. Sets and cards are independent, so they load together.
     */
    async initialize() {
      this.loadPreferences()

      await Promise.all([
        this.sets.length === 0 ? this.fetchSets() : Promise.resolve(),
        this.cards.length === 0 ? this.searchCards() : Promise.resolve(),
      ])
    },
  },
})
