<script setup lang="ts">
/**
 * Generation Selector Component - Enhanced
 *
 * Features:
 * - 3x3 grid layout with larger starter images
 * - Particle disintegration effect on hover (like Digimon death)
 * - Mouse tracking with VueUse
 * - Kanto pre-selected on first load
 * - No "All Gens" button (empty selection = all)
 */

import { Icon } from '@iconify/vue'

export interface Generation {
  id: number
  name: string
  range: [number, number]
  region: string
  starters: [number, number, number] // [grass, fire, water]
  color: string
}

interface Props {
  modelValue?: number
}

withDefaults(defineProps<Props>(), {
  modelValue: 1, // Default to Kanto (Gen 1)
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

/**
 * Generation data with colors
 */
const generations: Generation[] = [
  { id: 1, name: 'Kanto', range: [1, 151], region: 'Kanto', starters: [1, 4, 7], color: 'from-red-500 to-pink-500' },
  { id: 2, name: 'Johto', range: [152, 251], region: 'Johto', starters: [152, 155, 158], color: 'from-teal-500 to-cyan-500' },
  { id: 3, name: 'Hoenn', range: [252, 386], region: 'Hoenn', starters: [252, 255, 258], color: 'from-blue-500 to-cyan-500' },
  { id: 4, name: 'Sinnoh', range: [387, 493], region: 'Sinnoh', starters: [387, 390, 393], color: 'from-green-500 to-emerald-500' },
  { id: 5, name: 'Unova', range: [494, 649], region: 'Unova', starters: [495, 498, 501], color: 'from-yellow-500 to-orange-500' },
  { id: 6, name: 'Kalos', range: [650, 721], region: 'Kalos', starters: [650, 653, 656], color: 'from-gray-400 to-gray-500' },
  { id: 7, name: 'Alola', range: [722, 809], region: 'Alola', starters: [722, 725, 728], color: 'from-blue-400 to-indigo-500' },
  { id: 8, name: 'Galar', range: [810, 905], region: 'Galar', starters: [810, 813, 816], color: 'from-purple-500 to-pink-500' },
  { id: 9, name: 'Paldea', range: [906, 1025], region: 'Paldea', starters: [906, 909, 912], color: 'from-pink-500 to-rose-500' },
]


/**
 * Get starter image URL
 */
function getStarterImageUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}

/**
 * Handle generation selection
 */
function selectGeneration(genId: number) {
  emit('update:modelValue', genId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Select Generation
      </h3>
    </div>

    <!-- Generation Grid - 3x3 layout -->
    <div class="grid grid-cols-3 gap-4 sm:gap-6">
      <!-- Generation Buttons -->
      <button
        v-for="gen in generations"
        :key="gen.id"
        type="button"
        class="group relative overflow-hidden rounded-2xl border-3 transition-all duration-300 hover:scale-105"
        :class="modelValue === gen.id
          ? 'border-blue-500 shadow-2xl shadow-blue-500/40 ring-4 ring-blue-500/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-2xl'"
        @click="selectGeneration(gen.id)"
      >
        <!-- Gradient Background -->
        <div
          class="absolute inset-0 bg-gradient-to-br transition-opacity duration-300"
          :class="[gen.color, modelValue === gen.id ? 'opacity-25' : 'opacity-15 group-hover:opacity-20']"
        />

        <!-- Content -->
        <div class="relative p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <!-- Starters - Left Side (Horizontal) -->
          <div class="flex items-center justify-center gap-1 sm:gap-2">
            <img
              v-for="starterId in gen.starters"
              :key="starterId"
              :src="getStarterImageUrl(starterId)"
              :alt="`Starter ${starterId}`"
              class="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-xl transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
            >
          </div>

          <!-- Text - Right Side -->
          <div class="flex-1 text-left">
            <div class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
              Gen {{ gen.id }}
            </div>
            <div class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {{ gen.region }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-500">
              #{{ gen.range[0] }}-{{ gen.range[1] }}
            </div>
          </div>
        </div>

        <!-- Selected Indicator -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-50 rotate-180"
          enter-to-class="opacity-100 scale-100 rotate-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 rotate-0"
          leave-to-class="opacity-0 scale-50 rotate-180"
        >
          <div
            v-if="modelValue === gen.id"
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-gray-900"
          >
            <Icon
              icon="ph:check-bold"
              class="w-5 h-5 text-white"
            />
          </div>
        </Transition>

        <!-- Glow effect on hover -->
        <div
          class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          :class="gen.color"
        />
      </button>
    </div>
  </div>
</template>
