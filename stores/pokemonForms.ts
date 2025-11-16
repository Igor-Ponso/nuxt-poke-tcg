/**
 * Pokemon Forms Store
 *
 * Manages selected forms for each Pokemon across the app
 * Single source of truth for form state (DRY principle)
 */

import { defineStore } from 'pinia'
import type { PokemonForm } from '~/composables/pokemon/usePokemonForms'

interface PokemonFormsState {
  // Map of Pokemon ID to selected form
  selectedForms: Record<number, PokemonForm | null>
}

export const usePokemonFormsStore = defineStore('pokemonForms', {
  state: (): PokemonFormsState => ({
    selectedForms: {},
  }),

  getters: {
    /**
     * Get selected form for a Pokemon
     */
    getSelectedForm: (state) => {
      return (pokemonId: number): PokemonForm | null => {
        return state.selectedForms[pokemonId] ?? null
      }
    },

    /**
     * Check if a Pokemon has a selected form
     */
    hasSelectedForm: (state) => {
      return (pokemonId: number): boolean => {
        return pokemonId in state.selectedForms && state.selectedForms[pokemonId] !== null
      }
    },
  },

  actions: {
    /**
     * Set selected form for a Pokemon
     */
    setSelectedForm(pokemonId: number, form: PokemonForm | null) {
      this.selectedForms[pokemonId] = form
    },

    /**
     * Clear selected form for a Pokemon (reset to regular)
     */
    clearSelectedForm(pokemonId: number) {
      this.selectedForms[pokemonId] = null
    },

    /**
     * Clear all selected forms
     */
    clearAllForms() {
      this.selectedForms = {}
    },
  },
})
