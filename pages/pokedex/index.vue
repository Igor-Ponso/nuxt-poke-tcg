<script setup lang="ts">
/**
 * Pokédex Page
 *
 * Browse and search all Pokémon with filters
 */

import type { SimplifiedPokemon } from '~/types'

useHead({
  title: 'Pokédex - PokéTCG',
  meta: [{ name: 'description', content: 'Browse all Pokémon from Generation I to IX' }],
})

const pokemonStore = usePokemonStore()
const route = useRoute()
const selectedPokemon = ref<SimplifiedPokemon | null>(null)
const showPokemonModal = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const selectedGeneration = ref(0) // 0 = All generations

// Infinite scroll observer
let observer: IntersectionObserver | null = null

// Initialize store
onMounted(async () => {
  await pokemonStore.initialize()

  // Apply query params if present
  if (route.query.search) {
    await pokemonStore.searchPokemons(route.query.search as string)
  }

  // Setup infinite scroll observer
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && pokemonStore.hasMore && !pokemonStore.loading) {
      loadMore()
    }
  }, {
    threshold: 0.1,
    rootMargin: '100px',
  })

  // Watch for trigger element
  watch(loadMoreTrigger, (newEl, oldEl) => {
    if (oldEl && observer) {
      observer.unobserve(oldEl)
    }
    if (newEl && observer) {
      observer.observe(newEl)
    }
  }, { immediate: true })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

/**
 * Load more Pokemon
 */
async function loadMore() {
  if (!pokemonStore.hasMore || pokemonStore.loading) return
  await pokemonStore.fetchPokemons(pokemonStore.currentPage + 1)
}

/**
 * Handle Pokemon card click
 */
function handlePokemonClick(pokemon: SimplifiedPokemon) {
  selectedPokemon.value = pokemon
  showPokemonModal.value = true
}

/**
 * Close modal
 */
function closeModal() {
  showPokemonModal.value = false
  setTimeout(() => {
    selectedPokemon.value = null
  }, 300)
}

/**
 * Handle navigation in modal
 */
async function handleModalNavigation(pokemon: SimplifiedPokemon) {
  selectedPokemon.value = pokemon

  // Auto-load more if we're near the end and there's more to load
  const currentList = pokemonStore.filteredPokemons
  const currentIndex = currentList.findIndex(p => p.id === pokemon.id)
  const isNearEnd = currentIndex >= currentList.length - 3

  if (isNearEnd && pokemonStore.hasMore && !pokemonStore.loading) {
    await loadMore()
  }
}

/**
 * Handle generation change
 */
function handleGenerationChange(genId: number) {
  selectedGeneration.value = genId
  // 0 means "All generations" = null in store
  pokemonStore.setGenerationFilter(genId === 0 ? null : genId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Pokédex
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Browse all {{ pokemonStore.totalCount }} Pokémon
        </p>
      </div>
    </div>

    <!-- Generation Selector -->
    <GenerationSelector
      v-model="selectedGeneration"
      @update:model-value="handleGenerationChange"
    />

    <!-- Pokemon Grid -->
    <div v-if="pokemonStore.loading && pokemonStore.pokemons.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <PokemonCard
          v-for="pokemon in pokemonStore.filteredPokemons"
          :key="pokemon.id"
          :pokemon="pokemon"
          size="md"
          :favorited="pokemonStore.isFavorite(pokemon.id)"
          @click="handlePokemonClick(pokemon)"
          @favorite="pokemonStore.toggleFavorite(pokemon)"
        />
      </div>

      <!-- Infinite Scroll Trigger -->
      <div
        v-if="pokemonStore.pokemons.length > 0"
        ref="loadMoreTrigger"
        class="py-8 text-center"
      >
        <div v-if="pokemonStore.loading" class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading more Pokémon...</span>
        </div>
        <p v-else-if="!pokemonStore.hasMore" class="text-gray-500 dark:text-gray-400">
          No more Pokémon to load
        </p>
      </div>
    </div>

    <!-- Pokemon Detail Modal -->
    <PokemonModal
      :pokemon="selectedPokemon"
      :show="showPokemonModal"
      :pokemon-list="pokemonStore.filteredPokemons"
      @close="closeModal"
      @navigate="handleModalNavigation"
    />
  </div>
</template>
