<script setup lang="ts">
/**
 * Moves Page
 *
 * Browse all Pokemon moves with search, filters, lazy loading, and infinite scroll
 */

import { Icon } from '@iconify/vue'
import type { Move, PokemonType, SimplifiedMove } from '~/types'

useHead({
  title: 'Moves - PokéTCG',
  meta: [
    { name: 'description', content: 'Browse all Pokémon moves with detailed information' },
  ],
})

const uiStore = useUIStore()
const { fetchAllMoves, fetchMove, simplifyMove, searchMoves, filterByType, filterByCategory, filterByGeneration, sortMoves } = useMoves()

// ============================================================================
// STATE
// ============================================================================

const moves = ref<SimplifiedMove[]>([])
const displayedMoves = ref<SimplifiedMove[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const loadingProgress = ref(0)

// Modal
const selectedMove = ref<Move | null>(null)
const showModal = ref(false)

// Search & Filters
const searchQuery = ref('')
const selectedType = ref<PokemonType | 'all'>('all')
const selectedCategory = ref<'physical' | 'special' | 'status' | 'all'>('all')
const selectedGeneration = ref<string | null>('all')
const sortBy = ref<'name' | 'id' | 'power' | 'accuracy' | 'pp' | 'type'>('id')

// Pagination
const itemsPerPage = 24
const currentPage = ref(1)

// ============================================================================
// POKEMON TYPES (for filter dropdown)
// ============================================================================

const pokemonTypes: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

// ============================================================================
// GENERATIONS
// ============================================================================

const generations = [
  'GEN I', 'GEN II', 'GEN III', 'GEN IV', 'GEN V',
  'GEN VI', 'GEN VII', 'GEN VIII', 'GEN IX',
]

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Apply all filters and search to moves
 */
const filteredMoves = computed(() => {
  let result = moves.value

  // Apply search
  result = searchMoves(result, searchQuery.value)

  // Apply type filter
  result = filterByType(result, selectedType.value)

  // Apply category filter
  result = filterByCategory(result, selectedCategory.value)

  // Apply generation filter
  result = filterByGeneration(result, selectedGeneration.value)

  // Apply sorting
  result = sortMoves(result, sortBy.value)

  return result
})

/**
 * Check if there are more items to load
 */
const hasMore = computed(() => {
  return displayedMoves.value.length < filteredMoves.value.length
})

/**
 * Total moves count
 */
const totalMoves = computed(() => filteredMoves.value.length)

/**
 * Displayed moves count
 */
const displayedCount = computed(() => displayedMoves.value.length)

/**
 * Virtual Grid Setup for Performance
 * Only renders visible move cards + buffer
 */
const {
  virtualItems,
  wrapperProps,
  contentProps,
} = useVirtualGrid(computed(() => displayedMoves.value), {
  itemHeight: 380, // Estimated move card height
  gap: 16, // gap-4 in Tailwind = 16px
  overscan: 2,
  columns: {
    default: 1, // Mobile
    sm: 2, // >= 640px
    lg: 3, // >= 1024px
    xl: 4, // >= 1280px
  },
  debug: false,
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Load all moves with lazy loading strategy
 */
async function loadMoves() {
  try {
    loading.value = true
    loadingProgress.value = 0
    uiStore.setLoading(true, 'Loading moves...')

    // Fetch the list of all moves
    const allMovesResponse = await fetchAllMoves()
    const moveIds = allMovesResponse.results.map((_, index) => index + 1)

    // Load initial batch (48 moves = 2 pages worth)
    const initialBatchSize = 48
    const initialBatch = moveIds.slice(0, initialBatchSize)

    const initialPromises = initialBatch.map(id => fetchMove(id))
    const initialResults = await Promise.all(initialPromises)
    const initialSimplified = initialResults.map(simplifyMove)

    moves.value = initialSimplified
    loadingProgress.value = Math.round((initialBatchSize / moveIds.length) * 100)

    // Display first page
    displayedMoves.value = filteredMoves.value.slice(0, itemsPerPage)

    loading.value = false
    uiStore.setLoading(false)

    // Continue loading rest in background
    const remainingIds = moveIds.slice(initialBatchSize)
    const backgroundBatchSize = 50

    for (let i = 0; i < remainingIds.length; i += backgroundBatchSize) {
      const batch = remainingIds.slice(i, i + backgroundBatchSize)
      const batchPromises = batch.map(id => fetchMove(id))

      try {
        const batchResults = await Promise.all(batchPromises)
        const batchSimplified = batchResults.map(simplifyMove)

        moves.value = [...moves.value, ...batchSimplified]
        loadingProgress.value = Math.round(((initialBatchSize + i + batch.length) / moveIds.length) * 100)
      }
      catch (error) {
        console.error('Error loading batch:', error)
      }

      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    loadingProgress.value = 100
  }
  catch (error) {
    console.error('Error loading moves:', error)
    uiStore.setLoading(false)
    loading.value = false
  }
}

/**
 * Load more items (for pagination)
 */
function loadMore() {
  if (!hasMore.value || loadingMore.value)
    return

  loadingMore.value = true

  // Simulate a small delay for smooth UX
  setTimeout(() => {
    const start = displayedMoves.value.length
    const end = Math.min(start + itemsPerPage, filteredMoves.value.length)
    const newItems = filteredMoves.value.slice(start, end)

    displayedMoves.value.push(...newItems)
    currentPage.value++
    loadingMore.value = false
  }, 300)
}

/**
 * Reset to first page when filters change
 */
function resetPagination() {
  displayedMoves.value = filteredMoves.value.slice(0, itemsPerPage)
  currentPage.value = 1
}

/**
 * Handle infinite scroll
 */
function handleScroll() {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Trigger load more when user is 300px from bottom
  if (!loadingMore.value && hasMore.value) {
    const threshold = 300
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold

    if (isNearBottom) {
      loadMore()
    }
  }
}

/**
 * Open move modal
 */
async function openMoveModal(move: SimplifiedMove) {
  try {
    uiStore.setLoading(true, 'Loading move details...')
    const fullMove = await fetchMove(move.id)
    selectedMove.value = fullMove
    showModal.value = true
  }
  catch (error) {
    console.error('Failed to load move details:', error)
  }
  finally {
    uiStore.setLoading(false)
  }
}

/**
 * Close move modal
 */
function closeMoveModal() {
  showModal.value = false
  selectedMove.value = null
}

// ============================================================================
// WATCHERS
// ============================================================================

// Reset pagination when filters change
watch([searchQuery, selectedType, selectedCategory, selectedGeneration, sortBy], () => {
  resetPagination()
})

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadMoves()

  // Add scroll listener for infinite scroll
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Moves
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Browse all Pokémon moves
          </p>
        </div>

        <!-- Stats Cards (Mobile: below title, Desktop: right side) -->
        <div class="flex gap-4">
          <UiCard
            variant="glass"
            padding="sm"
          >
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ displayedCount }} / {{ totalMoves }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                Showing
              </div>
            </div>
          </UiCard>

          <UiCard
            v-if="loadingProgress < 100"
            variant="glass"
            padding="sm"
          >
            <div class="text-center min-w-[100px]">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ loadingProgress }}%
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                Loading
              </div>
              <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${loadingProgress}%` }"
                />
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <UiCard variant="glass">
      <div class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search moves..."
            class="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
          <Icon
            icon="ph:magnifying-glass-bold"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Type Filter -->
          <select
            v-model="selectedType"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all capitalize"
          >
            <option value="all">
              All Types
            </option>
            <option
              v-for="type in pokemonTypes"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>

          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all capitalize"
          >
            <option value="all">
              All Categories
            </option>
            <option value="physical">
              Physical
            </option>
            <option value="special">
              Special
            </option>
            <option value="status">
              Status
            </option>
          </select>

          <!-- Generation Filter -->
          <select
            v-model="selectedGeneration"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="all">
              All Generations
            </option>
            <option
              v-for="gen in generations"
              :key="gen"
              :value="gen"
            >
              {{ gen }}
            </option>
          </select>

          <!-- Sort By -->
          <select
            v-model="sortBy"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="id">
              Sort by ID
            </option>
            <option value="name">
              Sort by Name
            </option>
            <option value="power">
              Sort by Power
            </option>
            <option value="accuracy">
              Sort by Accuracy
            </option>
            <option value="pp">
              Sort by PP
            </option>
            <option value="type">
              Sort by Type
            </option>
          </select>
        </div>
      </div>
    </UiCard>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center space-y-4">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-gray-600 dark:text-gray-400">
          Loading moves...
        </p>
      </div>
    </div>

    <!-- Moves Grid with Virtual Scrolling -->
    <div
      v-else-if="displayedMoves.length > 0"
      class="space-y-6"
    >
      <div v-bind="wrapperProps">
        <div v-bind="contentProps">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MoveCard
              v-for="item in virtualItems"
              :key="`move-${item.data.id}`"
              :move="item.data"
              @click="openMoveModal"
            />
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div
        v-if="hasMore"
        class="flex justify-center pt-4"
      >
        <button
          type="button"
          class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <Icon
            v-if="loadingMore"
            icon="ph:spinner-bold"
            class="w-5 h-5 animate-spin"
          />
          <Icon
            v-else
            icon="ph:arrow-down-bold"
            class="w-5 h-5"
          />
          <span>
            {{ loadingMore ? 'Loading...' : `Load More (${totalMoves - displayedCount} remaining)` }}
          </span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-20"
    >
      <Icon
        icon="ph:magnifying-glass-bold"
        class="w-16 h-16 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No moves found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Try adjusting your search or filters
      </p>
    </div>

    <!-- Move Modal -->
    <MoveModal
      :move="selectedMove"
      :is-open="showModal"
      @close="closeMoveModal"
    />
  </div>
</template>
