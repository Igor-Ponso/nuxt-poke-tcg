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
const selectedGeneration = ref(1) // Default to Kanto (Gen 1)

// Virtual scrolling with chunks for grid layout
const ITEMS_PER_ROW = 4 // xl:grid-cols-4
const ROW_HEIGHT = 450 // Approximate height of card row in px (card ~380px + gap 24px + margin)
const OVERSCAN_ROWS = 3 // Extra rows to render above/below viewport (3 rows = ~1350px buffer)

const scrollY = ref(0)
const containerHeight = ref(0)

// Calculate visible range based on scroll position
const visibleRange = computed(() => {
  // First visible row (top of viewport)
  const firstVisibleRow = Math.floor(scrollY.value / ROW_HEIGHT)

  // Last visible row (bottom of viewport)
  const lastVisibleRow = Math.ceil((scrollY.value + containerHeight.value) / ROW_HEIGHT)

  // Add overscan: 3 rows before first visible, 3 rows after last visible
  const startRow = Math.max(0, firstVisibleRow - OVERSCAN_ROWS)
  const endRow = lastVisibleRow + OVERSCAN_ROWS

  const startIndex = startRow * ITEMS_PER_ROW
  const endIndex = Math.min(endRow * ITEMS_PER_ROW, pokemonStore.filteredPokemons.length)

  return { startIndex, endIndex, startRow }
})

// Only render visible Pokemon
const visiblePokemons = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  return pokemonStore.filteredPokemons.slice(startIndex, endIndex).map((pokemon, index) => ({
    pokemon,
    actualIndex: startIndex + index,
  }))
})

// Total height needed for the virtual scroll container
const totalHeight = computed(() => {
  const totalRows = Math.ceil(pokemonStore.filteredPokemons.length / ITEMS_PER_ROW)
  return totalRows * ROW_HEIGHT
})

// Offset from top
const offsetY = computed(() => {
  return visibleRange.value.startRow * ROW_HEIGHT
})

// Track scroll position
const { y: scrollYFromUse } = useScroll(typeof window !== 'undefined' ? window : null)
watch(scrollYFromUse, (newY) => {
  scrollY.value = newY
})

// Track viewport height
onMounted(() => {
  const updateHeight = () => {
    containerHeight.value = window.innerHeight
  }
  updateHeight()
  window.addEventListener('resize', updateHeight)
  onUnmounted(() => {
    window.removeEventListener('resize', updateHeight)
  })
})

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
 */
async function loadMore() {
  if (!pokemonStore.hasMore || pokemonStore.loading) return

  // If a generation is selected, load more from that generation
  if (selectedGeneration.value !== 0) {
    await pokemonStore.fetchByGeneration(selectedGeneration.value, pokemonStore.currentPage + 1)
  }
  else {
    await pokemonStore.fetchPokemons(pokemonStore.currentPage + 1)
  }
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
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="animate-pulse"
      >
        <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Virtual scrolling container -->
      <div
        :style="{ height: `${totalHeight}px`, position: 'relative' }"
      >
        <div
          :style="{ transform: `translateY(${offsetY}px)` }"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <PokemonCard
            v-for="{ pokemon, actualIndex } in visiblePokemons"
            :key="`${pokemon.id}-${actualIndex}`"
            :pokemon="pokemon"
            size="md"
            :favorited="pokemonStore.isFavorite(pokemon.id)"
            @click="handlePokemonClick(pokemon)"
            @favorite="pokemonStore.toggleFavorite(pokemon)"
          />
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
