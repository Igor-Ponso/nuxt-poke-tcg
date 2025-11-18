<script setup lang="ts">
/**
 * Game Generation Selector Component
 *
 * Features:
 * - Multi-selection support (checkboxes)
 * - Select All / Clear All buttons
 * - Collapsible section
 * - Shows Pokemon count for selected generations
 */

import { Icon } from '@iconify/vue'

// Expandable state
const isExpanded = ref(true)

interface Generation {
  id: number
  name: string
  range: [number, number]
  region: string
  starters: [number, number, number] // [grass, fire, water]
  color: string
  pokemonCount: number
}

interface Props {
  modelValue: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

/**
 * Generation data with colors
 */
const generations: Generation[] = [
  { id: 1, name: 'Kanto', range: [1, 151], region: 'Kanto', starters: [1, 4, 7], color: 'from-red-500 to-pink-500', pokemonCount: 151 },
  { id: 2, name: 'Johto', range: [152, 251], region: 'Johto', starters: [152, 155, 158], color: 'from-teal-500 to-cyan-500', pokemonCount: 100 },
  { id: 3, name: 'Hoenn', range: [252, 386], region: 'Hoenn', starters: [252, 255, 258], color: 'from-blue-500 to-cyan-500', pokemonCount: 135 },
  { id: 4, name: 'Sinnoh', range: [387, 493], region: 'Sinnoh', starters: [387, 390, 393], color: 'from-green-500 to-emerald-500', pokemonCount: 107 },
  { id: 5, name: 'Unova', range: [494, 649], region: 'Unova', starters: [495, 498, 501], color: 'from-yellow-500 to-orange-500', pokemonCount: 156 },
  { id: 6, name: 'Kalos', range: [650, 721], region: 'Kalos', starters: [650, 653, 656], color: 'from-gray-400 to-gray-500', pokemonCount: 72 },
  { id: 7, name: 'Alola', range: [722, 809], region: 'Alola', starters: [722, 725, 728], color: 'from-blue-400 to-indigo-500', pokemonCount: 88 },
  { id: 8, name: 'Galar', range: [810, 905], region: 'Galar', starters: [810, 813, 816], color: 'from-purple-500 to-pink-500', pokemonCount: 96 },
  { id: 9, name: 'Paldea', range: [906, 1025], region: 'Paldea', starters: [906, 909, 912], color: 'from-pink-500 to-rose-500', pokemonCount: 120 },
]

/**
 * Get starter image URL
 */
function getStarterImageUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}

/**
 * Check if generation is selected
 */
function isSelected(genId: number): boolean {
  return props.modelValue?.includes(genId) ?? false
}

/**
 * Toggle generation selection
 */
function toggleGeneration(genId: number) {
  const newSelection = [...(props.modelValue || [])]
  const index = newSelection.indexOf(genId)

  if (index === -1) {
    newSelection.push(genId)
  }
  else {
    newSelection.splice(index, 1)
  }

  // Sort generations
  newSelection.sort((a, b) => a - b)
  emit('update:modelValue', newSelection)
}

/**
 * Select all generations
 */
function selectAll() {
  emit('update:modelValue', [1, 2, 3, 4, 5, 6, 7, 8, 9])
}

/**
 * Clear all selections
 */
function clearAll() {
  emit('update:modelValue', [])
}

/**
 * Total Pokemon count
 */
const totalPokemonCount = computed(() => {
  if (!props.modelValue) return 0
  return generations
    .filter(gen => props.modelValue.includes(gen.id))
    .reduce((sum, gen) => sum + gen.pokemonCount, 0)
})

/**
 * Toggle expand/collapse
 */
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header - Clickable -->
    <button
      type="button"
      class="w-full flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      @click="toggleExpanded"
    >
      <div class="text-left">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Select Generations
        </h3>
        <p
          v-if="modelValue && modelValue.length > 0"
          class="text-sm text-gray-600 dark:text-gray-400 mt-1"
        >
          {{ modelValue.length }} {{ modelValue.length === 1 ? 'generation' : 'generations' }} selected • {{ totalPokemonCount }} Pokémon
        </p>
        <p
          v-else
          class="text-sm text-red-600 dark:text-red-400 mt-1"
        >
          Please select at least one generation
        </p>
      </div>
      <Icon
        :icon="isExpanded ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
        class="w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-200"
      />
    </button>

    <!-- Content (Collapsible) -->
    <div v-if="isExpanded">
      <!-- Action Buttons -->
      <div class="flex gap-3 mb-6">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md group"
          @click="selectAll"
        >
          <Icon
            icon="ph:check-square-fill"
            class="w-5 h-5 group-hover:scale-110 transition-transform"
          />
          <span>Select All</span>
        </button>
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md group"
          @click="clearAll"
        >
          <Icon
            icon="ph:x-square-fill"
            class="w-5 h-5 group-hover:scale-110 transition-transform"
          />
          <span>Clear All</span>
        </button>
      </div>

      <!-- Generation Grid - 3x3 layout -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <!-- Generation Buttons -->
        <button
          v-for="gen in generations"
          :key="gen.id"
          type="button"
          class="group relative overflow-hidden rounded-xl border-3 transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800"
          :class="isSelected(gen.id)
            ? 'border-blue-600 shadow-xl shadow-blue-500/40 ring-4 ring-blue-500/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'"
          @click="toggleGeneration(gen.id)"
        >
          <!-- Gradient Background -->
          <div
            class="absolute inset-0 bg-gradient-to-br transition-opacity duration-300"
            :class="[gen.color, isSelected(gen.id) ? 'opacity-25' : 'opacity-15 group-hover:opacity-20']"
          />

          <!-- Content -->
          <div class="relative p-4 flex items-center gap-3">
            <!-- Checkbox Indicator -->
            <div
              class="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm"
              :class="isSelected(gen.id)
                ? 'bg-blue-600 border-blue-600 scale-110'
                : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'"
            >
              <Icon
                v-if="isSelected(gen.id)"
                icon="ph:check-bold"
                class="w-5 h-5 text-white"
              />
            </div>

            <!-- Starters -->
            <div class="flex items-center justify-center gap-0.5">
              <img
                v-for="starterId in gen.starters"
                :key="starterId"
                :src="getStarterImageUrl(starterId)"
                :alt="`Starter ${starterId}`"
                class="w-9 h-9 object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
                loading="lazy"
              >
            </div>

            <!-- Text -->
            <div class="flex-1 text-left">
              <div class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Gen {{ gen.id }}
              </div>
              <div class="text-base font-black text-gray-900 dark:text-white">
                {{ gen.region }}
              </div>
              <div class="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {{ gen.pokemonCount }} Pokémon
              </div>
            </div>
          </div>

          <!-- Glow effect on hover -->
          <div
            class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
            :class="gen.color"
          />
        </button>
      </div>
    </div>
  </div>
</template>
