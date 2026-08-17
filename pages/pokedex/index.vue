<script setup lang="ts">
/**
 * Pokédex Page
 *
 * Browse and search all Pokémon with filters
 * WITH VIRTUAL SCROLLING for optimal performance
 */

import type { SimplifiedPokemon } from '~/types'
import { GENERATIONS } from '~/utils/constants'

useHead({
  title: 'Pokédex - PokéTCG',
  meta: [{ name: 'description', content: 'Browse all Pokémon from Generation I to IX' }],
})

const pokemonStore = usePokemonStore()
const route = useRoute()
const selectedPokemon = ref<SimplifiedPokemon | null>(null)
const showPokemonModal = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const selectedGeneration = ref(1) // Default to Kanto (Gen 1)

/**
 * Flatten all pokemons for virtual scrolling
 * We'll handle generation dividers differently
 */
const flatPokemons = computed(() => pokemonStore.filteredPokemons)

/**
 * Virtual Grid Setup for Performance
 * Only renders visible Pokemon cards + buffer
 * Reduces DOM nodes from 1000+ to ~50-80
 */
const {
  virtualItems,
  wrapperProps,
  contentProps,
} = useVirtualGrid(flatPokemons, {
  itemHeight: 480, // Estimated card height (includes padding)
  gap: 24, // gap-6 in Tailwind = 24px
  overscan: 2, // Render 2 extra rows above/below for smooth scrolling
  columns: {
    default: 1, // Mobile
    sm: 2, // >= 640px
    lg: 3, // >= 1024px
    xl: 4, // >= 1280px
  },
  debug: false, // Set to true to see virtualization logs
})

/**
 * Get generation for a Pokemon (for virtual grid)
 */
function getPokemonGeneration(pokemon: SimplifiedPokemon) {
  return GENERATIONS.find(g => pokemon.id >= g.range.start && pokemon.id <= g.range.end)
}

/**
 * Check if we should show generation divider before this Pokemon
 */
function shouldShowDivider(pokemon: SimplifiedPokemon, index: number) {
  if (index === 0) return false

  const currentGen = getPokemonGeneration(pokemon)
  const prevPokemon = flatPokemons.value[index - 1]
  const prevGen = prevPokemon ? getPokemonGeneration(prevPokemon) : null

  return currentGen && prevGen && currentGen.id !== prevGen.id
}

// Infinite scroll observer
let observer: IntersectionObserver | null = null

// Initialize store
onMounted(async () => {
  await pokemonStore.initialize()

  // Load Kanto (Gen 1) by default on first load
  await pokemonStore.fetchByGeneration(1)

  // Apply query params if present
  if (route.query.search) {
    await pokemonStore.searchPokemons(route.query.search as string)
  }

  // Setup infinite scroll observer
  observer = new IntersectionObserver((entries) => {
    const first = entries[0]
    if (first?.isIntersecting && pokemonStore.hasMore && !pokemonStore.loading) {
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

// Debounced search function to avoid multiple API calls while typing (500ms delay)
const debouncedSearch = useDebounceFn(async (searchQuery: string) => {
  if (searchQuery) {
    await pokemonStore.searchPokemons(searchQuery)
  }
  else {
    // Clear search and reset to full list
    pokemonStore.searchQuery = ''
    await pokemonStore.fetchPokemons(1)
  }
}, 500)

// Watch for route query changes to handle search updates
watch(
  () => route.query.search,
  (newSearch) => {
    debouncedSearch((newSearch as string) || '')
  },
)

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

/**
 * Load more Pokemon
 * Always loads the next batch sequentially, regardless of selected generation
 */
async function loadMore() {
  if (!pokemonStore.hasMore || pokemonStore.loading) return

  // Load next batch (continues sequentially after current Pokemon)
  await pokemonStore.loadNextBatch(20)
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
async function handleGenerationChange(genId: number) {
  selectedGeneration.value = genId

  if (genId === 0) {
    // Show all generations - reset to initial state
    pokemonStore.clearFilters()
    await pokemonStore.fetchPokemons(1)
  }
  else {
    // Fetch specific generation
    await pokemonStore.fetchByGeneration(genId)
  }
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

    <!-- Game Sprite Selector -->
    <GameSpriteSelector
      v-model="pokemonStore.selectedGameVersion"
      @update:model-value="pokemonStore.setGameVersion"
    />

    <!-- Pokemon Grid -->
    <div
      v-if="pokemonStore.loading && pokemonStore.pokemons.length === 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="animate-pulse"
      >
        <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    <!-- Virtual Scrolling Grid -->
    <div
      v-else-if="flatPokemons.length > 0"
      class="space-y-6"
    >
      <!-- Virtual Grid Container -->
      <div v-bind="wrapperProps">
        <div v-bind="contentProps">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            <template
              v-for="item in virtualItems"
              :key="`pokemon-${item.data.id}`"
            >
              <!-- Generation Divider (only for first item in new generation) -->
              <div
                v-if="shouldShowDivider(item.data, item.index)"
                class="col-span-full relative py-4"
              >
                <div
                  class="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div class="w-full border-t-2 border-gray-300 dark:border-gray-700" />
                </div>
                <div class="relative flex justify-center">
                  <span class="bg-white dark:bg-gray-900 px-6 py-3 text-xl font-bold text-gray-900 dark:text-white rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-lg">
                    {{ getPokemonGeneration(item.data)?.name }} - {{ getPokemonGeneration(item.data)?.region }}
                  </span>
                </div>
              </div>

              <!-- Pokemon Card -->
              <PokemonCard
                :pokemon="item.data"
                size="md"
                :favorited="pokemonStore.isFavorite(item.data.id)"
                @click="handlePokemonClick(item.data)"
                @favorite="pokemonStore.toggleFavorite(item.data)"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Infinite Scroll Trigger -->
      <div
        v-if="pokemonStore.pokemons.length > 0"
        ref="loadMoreTrigger"
        class="py-8 text-center"
      >
        <div
          v-if="pokemonStore.loading"
          class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <svg
            class="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading more Pokémon...</span>
        </div>
        <p
          v-else-if="!pokemonStore.hasMore"
          class="text-gray-500 dark:text-gray-400"
        >
          No more Pokémon to load
        </p>
      </div>

      <!-- Debug Info (remove in production) -->
      <!-- <div class="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono">
        <div>Total: {{ flatPokemons.length }}</div>
        <div>Rendered: {{ virtualItems.length }}</div>
        <div>Columns: {{ currentColumns }}</div>
        <div>Height: {{ totalHeight }}px</div>
      </div> -->
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
