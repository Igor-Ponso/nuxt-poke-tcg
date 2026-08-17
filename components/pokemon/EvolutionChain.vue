<script setup lang="ts">
/**
 * Evolution Chain Component
 *
 * Displays the evolution chain for a Pokemon with interactive navigation
 */

import { Icon } from '@iconify/vue'
import type { ProcessedEvolution } from '~/composables/pokemon/useEvolutionChain'

interface Props {
  evolutionChainUrl: string
  currentPokemonName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  navigate: [pokemonName: string]
}>()

// State
const evolutions = ref<ProcessedEvolution[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Composables
const { getEvolutionChain, formatEvolutionTrigger } = useEvolutionChain()

// Load evolution chain
watch(
  () => props.evolutionChainUrl,
  async (url) => {
    if (!url) return

    loading.value = true
    error.value = null

    try {
      evolutions.value = await getEvolutionChain(url)
    }
    catch (err) {
      error.value = 'Failed to load evolution chain'
      console.error('Evolution chain error:', err)
    }
    finally {
      loading.value = false
    }
  },
  { immediate: true },
)

/**
 * Build evolution tree structure (parent -> children)
 */
const evolutionTree = computed(() => {
  if (evolutions.value.length === 0) return []

  // Group by evolution level
  const levels: ProcessedEvolution[][] = []

  // Find base Pokemon (no evolvesFrom)
  const base = evolutions.value.find(e => !e.evolvesFrom)
  if (!base) return []

  levels.push([base])

  // Build subsequent levels
  let currentLevel = [base]
  while (currentLevel.length > 0) {
    const nextLevel = evolutions.value.filter(e =>
      currentLevel.some(parent => parent.species.name === e.evolvesFrom),
    )

    if (nextLevel.length > 0) {
      levels.push(nextLevel)
      currentLevel = nextLevel
    }
    else {
      break
    }
  }

  return levels
})

/**
 * Check if this is a multi-branch evolution (like Eevee)
 * Returns true if any level has 3+ Pokemon
 */
const isMultiBranch = computed(() => {
  return evolutionTree.value.some(level => level.length >= 3)
})

/**
 * Get evolution details with sprites for a specific Pokemon
 */
function getEvolutionDetailsWithSprites(pokemon: ProcessedEvolution) {
  if (!pokemon.evolutionDetails || pokemon.evolutionDetails.length === 0) {
    return []
  }

  return pokemon.evolutionDetails.map(detail => ({
    text: formatEvolutionTrigger(detail),
    itemSprite: detail.itemSprite || detail.heldItemSprite || null,
    trigger: detail,
  }))
}

/**
 * Navigate to Pokemon
 */
function handlePokemonClick(pokemonName: string) {
  emit('navigate', pokemonName)
}

/**
 * Check if Pokemon is current
 */
function isCurrentPokemon(pokemonName: string): boolean {
  return pokemonName === props.currentPokemonName
}
</script>

<template>
  <div class="evolution-chain-container">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex flex-col items-center gap-3">
        <svg
          class="animate-spin h-8 w-8 text-blue-500"
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
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Loading evolution chain...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <Icon
          icon="ph:warning-circle"
          class="w-12 h-12 text-red-500 mx-auto mb-3"
        />
        <p class="text-red-600 dark:text-red-400">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- No Evolution -->
    <div
      v-else-if="evolutions.length === 1"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <Icon
          icon="ph:x-circle"
          class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"
        />
        <p class="text-gray-600 dark:text-gray-400">
          This Pokémon does not evolve
        </p>
      </div>
    </div>

    <!-- Evolution Chain - Multi-Branch Layout (Eevee style) -->
    <div
      v-else-if="isMultiBranch"
      class="evolution-tree-radial py-6"
    >
      <!-- Base Pokemon (center) -->
      <div
        v-if="evolutionTree[0]"
        class="flex justify-center mb-8"
      >
        <div class="evolution-card-wrapper">
          <button
            v-for="pokemon in evolutionTree[0]"
            :key="pokemon.species.name"
            type="button"
            class="pokemon-evolution-item group relative"
            :class="{ 'current-pokemon': isCurrentPokemon(pokemon.species.name) }"
            @click="handlePokemonClick(pokemon.species.name)"
          >
            <div
              v-if="isCurrentPokemon(pokemon.species.name)"
              class="absolute -top-2 -right-2 z-10"
            >
              <div class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Current
              </div>
            </div>
            <div class="pokemon-image-container">
              <img
                v-if="pokemon.sprite"
                :src="pokemon.sprite"
                :alt="pokemon.species.name"
                class="pokemon-sprite"
              >
              <div
                v-else
                class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
              >
                <Icon
                  icon="ph:question"
                  class="w-12 h-12 text-gray-400"
                />
              </div>
            </div>
            <div class="pokemon-name">
              {{ formatPokemonName(pokemon.species.name) }}
            </div>
            <div class="pokemon-number">
              #{{ String(pokemon.id).padStart(4, '0') }}
            </div>
            <div
              v-if="pokemon.isBaby"
              class="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
              Baby
            </div>
          </button>
        </div>
      </div>

      <!-- Evolution indicator -->
      <div class="flex justify-center mb-6">
        <div class="text-center">
          <Icon
            icon="ph:arrows-out-bold"
            class="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2 animate-pulse"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Multiple Evolutions
          </p>
        </div>
      </div>

      <!-- Evolutions (wrapped around) -->
      <div class="evolution-branches">
        <div
          v-for="(level, levelIndex) in evolutionTree.slice(1)"
          :key="`level-${levelIndex}`"
          class="flex flex-wrap justify-center gap-4"
        >
          <div
            v-for="pokemon in level"
            :key="pokemon.species.name"
            class="evolution-card-branch"
          >
            <button
              type="button"
              class="pokemon-evolution-item group relative"
              :class="{ 'current-pokemon': isCurrentPokemon(pokemon.species.name) }"
              @click="handlePokemonClick(pokemon.species.name)"
            >
              <div
                v-if="isCurrentPokemon(pokemon.species.name)"
                class="absolute -top-2 -right-2 z-10"
              >
                <div class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Current
                </div>
              </div>
              <div class="pokemon-image-container">
                <img
                  v-if="pokemon.sprite"
                  :src="pokemon.sprite"
                  :alt="pokemon.species.name"
                  class="pokemon-sprite"
                >
                <div
                  v-else
                  class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                >
                  <Icon
                    icon="ph:question"
                    class="w-10 h-10 text-gray-400"
                  />
                </div>
              </div>
              <div class="pokemon-name text-sm">
                {{ formatPokemonName(pokemon.species.name) }}
              </div>
              <div class="pokemon-number text-xs">
                #{{ String(pokemon.id).padStart(4, '0') }}
              </div>
              <div
                v-if="pokemon.isBaby"
                class="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              >
                Baby
              </div>
            </button>
            <div
              v-if="pokemon.evolutionDetails.length > 0"
              class="evolution-details-small mt-2 space-y-1"
            >
              <div
                v-for="(detail, detailIndex) in getEvolutionDetailsWithSprites(pokemon)"
                :key="`detail-${detailIndex}`"
                class="flex flex-col items-center gap-1"
              >
                <img
                  v-if="detail.itemSprite"
                  :src="detail.itemSprite"
                  :alt="detail.trigger.item || detail.trigger.heldItem || 'item'"
                  class="w-6 h-6 object-contain"
                >
                <span class="text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
                  {{ detail.text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Evolution Chain - Linear Layout (normal evolutions) -->
    <div
      v-else
      class="evolution-tree-linear py-6"
    >
      <div class="flex flex-wrap items-center justify-center gap-6">
        <!-- Loop through levels -->
        <template
          v-for="(level, levelIndex) in evolutionTree"
          :key="`level-${levelIndex}`"
        >
          <!-- Arrow between levels -->
          <div
            v-if="levelIndex > 0"
            class="flex items-center"
          >
            <Icon
              icon="ph:arrow-right-bold"
              class="w-8 h-8 text-blue-500 dark:text-blue-400"
            />
          </div>

          <!-- Pokemon cards in this level -->
          <div class="flex flex-wrap items-center justify-center gap-4">
            <div
              v-for="pokemon in level"
              :key="pokemon.species.name"
              class="evolution-card-linear"
            >
              <button
                type="button"
                class="pokemon-evolution-item group relative"
                :class="{ 'current-pokemon': isCurrentPokemon(pokemon.species.name) }"
                @click="handlePokemonClick(pokemon.species.name)"
              >
                <div
                  v-if="isCurrentPokemon(pokemon.species.name)"
                  class="absolute -top-2 -right-2 z-10"
                >
                  <div class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Current
                  </div>
                </div>
                <div class="pokemon-image-container">
                  <img
                    v-if="pokemon.sprite"
                    :src="pokemon.sprite"
                    :alt="pokemon.species.name"
                    class="pokemon-sprite"
                  >
                  <div
                    v-else
                    class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    <Icon
                      icon="ph:question"
                      class="w-12 h-12 text-gray-400"
                    />
                  </div>
                </div>
                <div class="pokemon-name">
                  {{ formatPokemonName(pokemon.species.name) }}
                </div>
                <div class="pokemon-number">
                  #{{ String(pokemon.id).padStart(4, '0') }}
                </div>
                <div
                  v-if="pokemon.isBaby"
                  class="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                >
                  Baby
                </div>
              </button>
              <div
                v-if="pokemon.evolutionDetails.length > 0 && levelIndex > 0"
                class="evolution-details mt-3 space-y-1"
              >
                <div
                  v-for="(detail, detailIndex) in getEvolutionDetailsWithSprites(pokemon)"
                  :key="`detail-${detailIndex}`"
                  class="evolution-requirement"
                >
                  <Icon
                    icon="ph:arrow-right"
                    class="w-4 h-4 text-blue-500 flex-shrink-0"
                  />
                  <img
                    v-if="detail.itemSprite"
                    :src="detail.itemSprite"
                    :alt="detail.trigger.item || detail.trigger.heldItem || 'item'"
                    class="w-5 h-5 object-contain flex-shrink-0"
                  >
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ detail.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evolution-chain-container {
  @apply w-full;
}

/* Linear Layout (normal evolutions: Bulbasaur → Ivysaur → Venusaur) */
.evolution-tree-linear {
  @apply w-full max-w-6xl mx-auto;
}

.evolution-card-linear {
  @apply flex flex-col items-center;
}

/* Radial Layout (multi-branch: Eevee in center, evolutions around) */
.evolution-tree-radial {
  @apply w-full max-w-6xl mx-auto;
}

.evolution-card-wrapper {
  @apply flex justify-center;
}

.evolution-branches {
  @apply w-full;
}

.evolution-card-branch {
  @apply flex flex-col items-center;
  @apply w-40;
}

/* Pokemon Card Styles */
.pokemon-evolution-item {
  @apply relative;
  @apply w-full max-w-[200px] mx-auto;
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl;
  @apply p-4;
  @apply shadow-md;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply transition-all duration-300;
  @apply cursor-pointer;
  @apply hover:shadow-xl hover:scale-105;
  @apply hover:border-blue-400 dark:hover:border-blue-500;
}

.pokemon-evolution-item.current-pokemon {
  @apply border-blue-500 dark:border-blue-400;
  @apply shadow-lg shadow-blue-500/30;
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900;
}

.pokemon-image-container {
  @apply flex items-center justify-center;
  @apply mb-2;
}

.pokemon-sprite {
  @apply w-24 h-24;
  @apply object-contain;
  @apply transition-transform duration-300;
  @apply group-hover:scale-110;
}

.pokemon-name {
  @apply text-center;
  @apply font-bold text-base;
  @apply text-gray-900 dark:text-white;
  @apply capitalize;
  @apply mb-1;
}

.pokemon-number {
  @apply text-center;
  @apply text-xs font-medium;
  @apply text-gray-500 dark:text-gray-400;
}

/* Evolution Details */
.evolution-details {
  @apply w-full max-w-[200px] mx-auto;
}

.evolution-requirement {
  @apply flex items-start gap-2;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply px-3 py-2;
  @apply rounded-lg;
  @apply border border-blue-200 dark:border-blue-800;
}

.evolution-details-small {
  @apply w-full;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .evolution-card-branch {
    @apply w-32;
  }

  .pokemon-evolution-item {
    @apply p-3;
  }

  .pokemon-sprite {
    @apply w-20 h-20;
  }
}

@media (max-width: 640px) {
  .evolution-tree-linear .flex {
    @apply flex-col;
  }

  .evolution-tree-linear .flex-wrap {
    @apply flex-nowrap;
  }

  .evolution-card-branch {
    @apply w-28;
  }

  .pokemon-evolution-item {
    @apply max-w-[160px];
  }
}
</style>
