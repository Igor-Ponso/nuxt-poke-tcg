<script setup lang="ts">
/**
 * Pokédex Page
 *
 * Browse and search all Pokémon with filters
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

// Group Pokemon by generation with dividers
const pokemonsByGeneration = computed(() => {
  const pokemons = pokemonStore.filteredPokemons
  const groups: Array<{ type: 'group', generation: typeof GENERATIONS[number], pokemonList: SimplifiedPokemon[] }> = []

  let currentGeneration = -1
  let currentGroup: SimplifiedPokemon[] = []

  pokemons.forEach((pokemon) => {
    // Determine which generation this Pokemon belongs to
    const gen = GENERATIONS.find(g => pokemon.id >= g.range.start && pokemon.id <= g.range.end)

    if (gen && gen.id !== currentGeneration) {
      // Save previous group if it exists
      if (currentGroup.length > 0 && currentGeneration !== -1) {
        const prevGen = GENERATIONS.find(g => g.id === currentGeneration)
        if (prevGen) {
          groups.push({
            type: 'group',
            generation: prevGen,
            pokemonList: currentGroup,
          })
        }
      }

      // Start new group
      currentGeneration = gen.id
      currentGroup = [pokemon]
    }
    else {
      currentGroup.push(pokemon)
    }
  })

  // Add last group
  if (currentGroup.length > 0 && currentGeneration !== -1) {
    const gen = GENERATIONS.find(g => g.id === currentGeneration)
    if (gen) {
      groups.push({
        type: 'group',
        generation: gen,
        pokemonList: currentGroup,
      })
    }
  }

  return groups
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
      <!-- Pokemon Grid grouped by generation -->
      <div class="space-y-8">
        <div
          v-for="(group, groupIndex) in pokemonsByGeneration"
          :key="`gen-${group.generation.id}`"
          class="space-y-6"
        >
          <!-- Generation Divider (skip for first generation if it's the selected one) -->
          <div
            v-if="groupIndex > 0 || selectedGeneration !== group.generation.id"
            class="relative py-4"
          >
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t-2 border-gray-300 dark:border-gray-700" />
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white dark:bg-gray-900 px-6 py-3 text-xl font-bold text-gray-900 dark:text-white rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-lg">
                {{ group.generation.name }} - {{ group.generation.region }}
              </span>
            </div>
          </div>

          <!-- Pokemon Grid for this generation -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <PokemonCard
              v-for="pokemon in group.pokemonList"
              :key="`${pokemon.id}`"
              :pokemon="pokemon"
              size="md"
              :favorited="pokemonStore.isFavorite(pokemon.id)"
              @click="handlePokemonClick(pokemon)"
              @favorite="pokemonStore.toggleFavorite(pokemon)"
            />
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
