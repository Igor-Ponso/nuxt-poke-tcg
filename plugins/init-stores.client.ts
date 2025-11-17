/**
 * Initialize Stores Plugin
 *
 * Loads persisted data from localStorage on app initialization
 */

export default defineNuxtPlugin(() => {
  const pokemonStore = usePokemonStore()

  // Load favorites from localStorage
  pokemonStore.loadFavoritesFromStorage()
})
