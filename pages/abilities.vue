<script setup lang="ts">
/**
 * Abilities Page
 *
 * Browse and search Pokemon abilities
 */

import { Icon } from '@iconify/vue'
import type { Ability, SimplifiedAbility } from '~/types'

useHead({
  title: 'Abilities - PokéTCG',
  meta: [{ name: 'description', content: 'Browse all Pokemon abilities' }],
})

const { fetchAllAbilities, fetchAbility, simplifyAbility, searchAbilities, filterByGeneration, sortAbilities } = useAbilities()
const uiStore = useUIStore()

// State
const abilities = ref<SimplifiedAbility[]>([])
const displayedAbilities = ref<SimplifiedAbility[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const searchQuery = ref('')
const selectedGeneration = ref<string>('all')
const sortBy = ref<'name' | 'id' | 'pokemon-count' | 'generation'>('name')
const selectedAbility = ref<Ability | null>(null)
const showModal = ref(false)
const totalAbilities = ref(0)

// Pagination
const itemsPerPage = 24
const currentPage = ref(1)

// Generations for filter
const generations = [
  { value: 'all', label: 'All Generations' },
  { value: 'GEN I', label: 'Generation I' },
  { value: 'GEN II', label: 'Generation II' },
  { value: 'GEN III', label: 'Generation III' },
  { value: 'GEN IV', label: 'Generation IV' },
  { value: 'GEN V', label: 'Generation V' },
  { value: 'GEN VI', label: 'Generation VI' },
  { value: 'GEN VII', label: 'Generation VII' },
  { value: 'GEN VIII', label: 'Generation VIII' },
  { value: 'GEN IX', label: 'Generation IX' },
]

// Sort options
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)', icon: 'ph:sort-ascending' },
  { value: 'id', label: 'ID Number', icon: 'ph:hash' },
  { value: 'pokemon-count', label: 'Pokémon Count', icon: 'ph:pokemon-logo-fill' },
  { value: 'generation', label: 'Generation', icon: 'ph:calendar' },
]

/**
 * Filtered and sorted abilities
 */
const filteredAbilities = computed(() => {
  let result = abilities.value

  // Search
  result = searchAbilities(result, searchQuery.value)

  // Filter by generation
  result = filterByGeneration(result, selectedGeneration.value)

  // Sort
  result = sortAbilities(result, sortBy.value)

  return result
})

/**
 * Has more items to load
 */
const hasMore = computed(() => {
  return displayedAbilities.value.length < filteredAbilities.value.length
})

/**
 * Load more items
 */
function loadMore() {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true

  // Simulate a small delay for smooth UX
  setTimeout(() => {
    const start = displayedAbilities.value.length
    const end = Math.min(start + itemsPerPage, filteredAbilities.value.length)
    const newItems = filteredAbilities.value.slice(start, end)

    displayedAbilities.value.push(...newItems)
    currentPage.value++
    loadingMore.value = false
  }, 300)
}

/**
 * Reset displayed items when filters change
 */
watch([searchQuery, selectedGeneration, sortBy], () => {
  currentPage.value = 1
  displayedAbilities.value = filteredAbilities.value.slice(0, itemsPerPage)
})

/**
 * Update displayed items when filtered abilities change initially
 */
watch(filteredAbilities, (newFiltered) => {
  if (displayedAbilities.value.length === 0) {
    displayedAbilities.value = newFiltered.slice(0, itemsPerPage)
  }
}, { immediate: true })

/**
 * Stats
 */
const stats = computed(() => {
  return {
    total: abilities.value.length,
    filtered: filteredAbilities.value.length,
    mainSeries: abilities.value.filter(a => a.isMainSeries).length,
  }
})

/**
 * Load abilities (with lazy loading)
 */
async function loadAbilities() {
  try {
    loading.value = true
    uiStore.setLoading(true, 'Loading abilities...')

    // Fetch ability list
    const response = await fetchAllAbilities(500)
    totalAbilities.value = response.count

    // Extract IDs from URLs
    const abilityIds = response.results.map((result) => {
      const id = result.url.split('/').filter(Boolean).pop()
      return parseInt(id || '0')
    }).filter(id => id > 0)

    // Load abilities in smaller batches for faster initial display
    const initialBatchSize = 48 // Load first 48 for initial display (2 pages worth)
    const backgroundBatchSize = 50 // Continue loading rest in background

    // Load initial batch
    const initialBatch = abilityIds.slice(0, initialBatchSize)
    const initialPromises = initialBatch.map(id => fetchAbility(id))
    const initialResults = await Promise.all(initialPromises)
    const initialSimplified = initialResults.map(simplifyAbility)

    abilities.value = initialSimplified
    loading.value = false
    uiStore.setLoading(false)

    // Continue loading rest in background
    const remainingIds = abilityIds.slice(initialBatchSize)

    for (let i = 0; i < remainingIds.length; i += backgroundBatchSize) {
      const batch = remainingIds.slice(i, i + backgroundBatchSize)
      const promises = batch.map(id => fetchAbility(id))
      const results = await Promise.all(promises)
      const simplified = results.map(simplifyAbility)

      // Add to abilities array
      abilities.value.push(...simplified)

      // Small delay to not overwhelm the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  catch (error) {
    console.error('Failed to load abilities:', error)
    loading.value = false
    uiStore.setLoading(false)
  }
}

/**
 * Open ability modal
 */
async function openAbilityModal(ability: SimplifiedAbility) {
  try {
    uiStore.setLoading(true, 'Loading ability details...')
    const fullAbility = await fetchAbility(ability.id)
    selectedAbility.value = fullAbility
    showModal.value = true
  }
  catch (error) {
    console.error('Failed to load ability details:', error)
  }
  finally {
    uiStore.setLoading(false)
  }
}

/**
 * Close ability modal
 */
function closeAbilityModal() {
  showModal.value = false
  selectedAbility.value = null
}

/**
 * Clear all filters
 */
function clearFilters() {
  searchQuery.value = ''
  selectedGeneration.value = 'all'
  sortBy.value = 'name'
}

/**
 * Infinite scroll handler
 */
function handleScroll() {
  if (loadingMore.value || !hasMore.value) return

  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Trigger when user is 300px from bottom
  const threshold = 300
  const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold

  if (isNearBottom) {
    loadMore()
  }
}

// Setup and cleanup
onMounted(() => {
  loadAbilities()

  // Add scroll listener for infinite scroll
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  // Remove scroll listener
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Pokémon Abilities
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Browse and discover special abilities that Pokemon can have
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UiCard
        variant="glass"
        padding="md"
      >
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ abilities.length }}
            <span
              v-if="abilities.length < totalAbilities"
              class="text-lg text-gray-500"
            >
              / {{ totalAbilities }}
            </span>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Loaded Abilities
          </div>
          <div
            v-if="abilities.length < totalAbilities"
            class="mt-2"
          >
            <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 transition-all duration-500"
                :style="{ width: `${(abilities.length / totalAbilities) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </UiCard>

      <UiCard
        variant="glass"
        padding="md"
      >
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">
            {{ displayedAbilities.length }}
            <span class="text-lg text-gray-500">
              / {{ stats.filtered }}
            </span>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Showing Results
          </div>
        </div>
      </UiCard>

      <UiCard
        variant="glass"
        padding="md"
      >
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ stats.mainSeries }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Main Series
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Search and Filters -->
    <UiCard
      variant="glass"
      padding="lg"
    >
      <div class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              icon="ph:magnifying-glass-bold"
              class="w-5 h-5 text-gray-400"
            />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search abilities by name or description..."
            class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Generation Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon
                icon="ph:calendar"
                class="w-4 h-4 inline mr-1"
              />
              Generation
            </label>
            <select
              v-model="selectedGeneration"
              class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="gen in generations"
                :key="gen.value"
                :value="gen.value"
              >
                {{ gen.label }}
              </option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Icon
                icon="ph:sort-ascending"
                class="w-4 h-4 inline mr-1"
              />
              Sort By
            </label>
            <select
              v-model="sortBy"
              class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <UiButton
              variant="secondary"
              class="w-full"
              @click="clearFilters"
            >
              <Icon
                icon="ph:x-circle"
                class="w-4 h-4 mr-2"
              />
              Clear Filters
            </UiButton>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Results -->
    <div
      v-if="loading"
      class="text-center py-20"
    >
      <UiLoading
        type="pokeball"
        size="lg"
        message="Loading abilities..."
      />
    </div>

    <div
      v-else-if="filteredAbilities.length === 0"
      class="text-center py-20"
    >
      <Icon
        icon="ph:empty"
        class="w-20 h-20 mx-auto text-gray-400 mb-4"
      />
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No abilities found
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Try adjusting your search or filters
      </p>
      <UiButton
        variant="primary"
        @click="clearFilters"
      >
        Clear All Filters
      </UiButton>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Abilities Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AbilityCard
          v-for="ability in displayedAbilities"
          :key="ability.id"
          :ability="ability"
          @click="openAbilityModal"
        />
      </div>

      <!-- Loading More Indicator (for infinite scroll) -->
      <div
        v-if="loadingMore"
        class="flex justify-center py-8"
      >
        <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Icon
            icon="ph:circle-notch"
            class="w-6 h-6 animate-spin"
          />
          <span>Loading more abilities...</span>
        </div>
      </div>

      <!-- Load More Button (optional manual trigger) -->
      <div
        v-else-if="hasMore"
        class="flex justify-center pt-4"
      >
        <UiButton
          variant="secondary"
          size="lg"
          @click="loadMore"
        >
          <Icon
            icon="ph:arrow-down"
            class="w-5 h-5 mr-2"
          />
          Load More ({{ displayedAbilities.length }}/{{ filteredAbilities.length }})
        </UiButton>
      </div>

      <!-- All Loaded Message -->
      <div
        v-else-if="displayedAbilities.length > 0"
        class="text-center py-4"
      >
        <p class="text-gray-600 dark:text-gray-400">
          All {{ displayedAbilities.length }} abilities loaded
        </p>
      </div>
    </div>

    <!-- Ability Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal && selectedAbility"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeAbilityModal"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform scale-95"
            enter-to-class="opacity-100 transform scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 transform scale-100"
            leave-to-class="opacity-0 transform scale-95"
          >
            <UiCard
              v-if="selectedAbility"
              variant="glass"
              padding="lg"
              class="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <!-- Close Button -->
              <button
                class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                @click="closeAbilityModal"
              >
                <Icon
                  icon="ph:x-bold"
                  class="w-6 h-6 text-gray-600 dark:text-gray-400"
                />
              </button>

              <div class="space-y-6">
                <!-- Header -->
                <div>
                  <h2 class="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                    {{ selectedAbility.name.replace(/-/g, ' ') }}
                  </h2>
                  <p class="text-gray-500 dark:text-gray-400 mt-1">
                    #{{ selectedAbility.id.toString().padStart(4, '0') }}
                  </p>
                </div>

                <!-- Meta Info -->
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {{ selectedAbility.generation.name.replace('generation-', 'Generation ').toUpperCase() }}
                  </span>
                  <span
                    v-if="selectedAbility.is_main_series"
                    class="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                  >
                    <Icon
                      icon="ph:star-fill"
                      class="w-4 h-4 inline mr-1"
                    />
                    Main Series
                  </span>
                </div>

                <!-- Effect -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Effect
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ selectedAbility.effect_entries.find(e => e.language.name === 'en')?.effect || 'No description available' }}
                  </p>
                </div>

                <!-- Short Effect -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Short Effect
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ selectedAbility.effect_entries.find(e => e.language.name === 'en')?.short_effect || 'No description available' }}
                  </p>
                </div>

                <!-- Pokemon with this ability -->
                <div v-if="selectedAbility.pokemon.length > 0">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Pokémon with this ability ({{ selectedAbility.pokemon.length }})
                  </h3>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    <div
                      v-for="poke in selectedAbility.pokemon.slice(0, 30)"
                      :key="poke.pokemon.name"
                      class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm capitalize flex items-center justify-between"
                    >
                      <span>{{ poke.pokemon.name.replace(/-/g, ' ') }}</span>
                      <Icon
                        v-if="poke.is_hidden"
                        icon="ph:eye-slash-fill"
                        class="w-4 h-4 text-purple-500"
                        title="Hidden Ability"
                      />
                    </div>
                  </div>
                  <p
                    v-if="selectedAbility.pokemon.length > 30"
                    class="text-sm text-gray-500 dark:text-gray-400 mt-2"
                  >
                    And {{ selectedAbility.pokemon.length - 30 }} more...
                  </p>
                </div>
              </div>
            </UiCard>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
