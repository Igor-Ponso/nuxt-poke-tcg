<script setup lang="ts">
/**
 * AppSidebar Component
 *
 * Collapsible sidebar with filters and quick actions
 * Shows on desktop, hidden on mobile
 */

const uiStore = useUIStore()
const pokemonStore = usePokemonStore()
const tcgStore = useTCGStore()
const route = useRoute()

/**
 * Check if sidebar should be open
 */
const isOpen = computed(() => uiStore.sidebarOpen)

/**
 * Sidebar filters based on current route
 */
const showPokemonFilters = computed(() => route.path.startsWith('/pokedex'))
const showTCGFilters = computed(() => route.path.startsWith('/tcg'))

/**
 * Selected generation
 */
const selectedGeneration = computed({
  get: () => pokemonStore.selectedGeneration,
  set: (value) => pokemonStore.setGenerationFilter(value),
})

/**
 * Selected type
 */
const selectedType = computed({
  get: () => pokemonStore.selectedType,
  set: (value) => pokemonStore.setTypeFilter(value),
})

/**
 * Selected rarity (TCG)
 */
const selectedRarity = computed({
  get: () => tcgStore.selectedRarity,
  set: (value) => tcgStore.setRarityFilter(value),
})

/**
 * TCG Rarities
 */
const tcgRarities = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Ultra',
  'Rare Secret',
]

/**
 * Toggle sidebar
 */
function toggleSidebar() {
  uiStore.toggleSidebar()
}

/**
 * Clear all filters
 */
function clearFilters() {
  if (showPokemonFilters.value) {
    pokemonStore.clearFilters()
  } else if (showTCGFilters.value) {
    tcgStore.clearFilters()
  }
  uiStore.showToast('Filters cleared', 'info', 2000)
}
</script>

<template>
  <aside
    class="hidden lg:block w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex-shrink-0"
    :class="{ 'lg:w-16': !isOpen }"
  >
    <div class="sticky top-4 p-4 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <!-- Toggle Button -->
      <button
        type="button"
        class="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle sidebar"
        @click="toggleSidebar"
      >
        <span class="text-xl">
          {{ isOpen ? '◀' : '▶' }}
        </span>
      </button>

      <!-- Sidebar Content (when open) -->
      <Transition name="fade">
        <div v-if="isOpen" class="space-y-6">
          <!-- Pokemon Filters -->
          <div v-if="showPokemonFilters" class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Filters
            </h3>

            <!-- Generation Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generation
              </label>
              <select
                v-model="selectedGeneration"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option :value="null">
                  All Generations
                </option>
                <option
                  v-for="gen in GENERATIONS"
                  :key="gen.id"
                  :value="gen.id"
                >
                  {{ gen.name }} ({{ gen.region }})
                </option>
              </select>
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                v-model="selectedType"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors capitalize"
              >
                <option :value="null">
                  All Types
                </option>
                <option
                  v-for="type in POKEMON_TYPES"
                  :key="type.name"
                  :value="type.name"
                  class="capitalize"
                >
                  {{ type.name }}
                </option>
              </select>
            </div>

            <!-- Stats -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span class="font-medium">Total:</span>
                  {{ pokemonStore.pokemonCount }} Pokémon
                </p>
                <p>
                  <span class="font-medium">Filtered:</span>
                  {{ pokemonStore.filteredPokemons.length }} shown
                </p>
                <p>
                  <span class="font-medium">Favorites:</span>
                  {{ pokemonStore.favoriteCount }}/6
                </p>
              </div>
            </div>

            <!-- Clear Filters -->
            <UiButton
              v-if="pokemonStore.hasActiveFilters"
              variant="ghost"
              size="sm"
              full-width
              @click="clearFilters"
            >
              Clear Filters
            </UiButton>
          </div>

          <!-- TCG Filters -->
          <div v-if="showTCGFilters" class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Filters
            </h3>

            <!-- Rarity Filter -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rarity
              </label>
              <select
                v-model="selectedRarity"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option :value="null">
                  All Rarities
                </option>
                <option
                  v-for="rarity in tcgRarities"
                  :key="rarity"
                  :value="rarity"
                >
                  {{ rarity }}
                </option>
              </select>
            </div>

            <!-- Holographic Toggle -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                Holographic Effect
              </span>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="tcgStore.holographicEnabled ? 'bg-blue-600' : 'bg-gray-300'"
                @click="tcgStore.toggleHolographic()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="tcgStore.holographicEnabled ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Stats -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span class="font-medium">Total:</span>
                  {{ tcgStore.cardCount }} cards
                </p>
                <p>
                  <span class="font-medium">Filtered:</span>
                  {{ tcgStore.filteredCards.length }} shown
                </p>
              </div>
            </div>

            <!-- Clear Filters -->
            <UiButton
              v-if="tcgStore.hasActiveFilters"
              variant="ghost"
              size="sm"
              full-width
              @click="clearFilters"
            >
              Clear Filters
            </UiButton>
          </div>

          <!-- Quick Actions -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
              Quick Actions
            </h4>

            <UiButton
              variant="secondary"
              size="sm"
              full-width
              @click="navigateTo('/team')"
            >
              ⭐ View My Team
            </UiButton>

            <UiButton
              variant="secondary"
              size="sm"
              full-width
              @click="tcgStore.toggleTCGMode()"
            >
              {{ tcgStore.tcgMode ? '📚 Pokédex Mode' : '🎴 TCG Mode' }}
            </UiButton>
          </div>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
