<script setup lang="ts">
/**
 * Generation Selector Component
 *
 * Modern generation selector with 9 buttons showing starters
 * Based on Pokedex-vue design with glassmorphism
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
  modelValue: 0, // 0 = All generations
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

/**
 * Generation data with colors matching tailwind.config
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
 * Get starter image URL from PokeAPI
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
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Select Generation
      </h3>
      <button
        v-if="modelValue !== 0"
        type="button"
        class="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors min-h-[44px] px-2"
        @click="selectGeneration(0)"
      >
        Show All
      </button>
    </div>

    <!-- Generation Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
      <!-- All Generations Button -->
      <button
        type="button"
        class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-3 sm:p-4 min-h-[120px]"
        :class="modelValue === 0
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
          : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg'"
        @click="selectGeneration(0)"
      >
        <div class="space-y-1.5 sm:space-y-2 text-center">
          <div class="flex items-center justify-center">
            <Icon icon="ph:infinity-bold" class="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-400" />
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            All Gens
          </div>
          <div class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            1-1025
          </div>
        </div>
      </button>

      <!-- Generation Buttons -->
      <button
        v-for="gen in generations"
        :key="gen.id"
        type="button"
        class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 min-h-[120px]"
        :class="modelValue === gen.id
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg'"
        @click="selectGeneration(gen.id)"
      >
        <!-- Gradient Background -->
        <div
          class="absolute inset-0 bg-gradient-to-br transition-opacity duration-300"
          :class="[gen.color, modelValue === gen.id ? 'opacity-20' : 'opacity-10 group-hover:opacity-15']"
        />

        <!-- Content -->
        <div class="relative p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          <!-- Header -->
          <div class="text-center">
            <div class="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400">
              Gen {{ gen.id }}
            </div>
            <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {{ gen.region }}
            </div>
            <div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
              #{{ gen.range[0] }}-{{ gen.range[1] }}
            </div>
          </div>

          <!-- Starters -->
          <div class="flex items-center justify-center gap-0.5 sm:gap-1">
            <img
              v-for="starterId in gen.starters"
              :key="starterId"
              :src="getStarterImageUrl(starterId)"
              :alt="`Starter ${starterId}`"
              class="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
            >
          </div>
        </div>

        <!-- Selected Indicator -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <div
            v-if="modelValue === gen.id"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
          >
            <Icon icon="ph:check-bold" class="w-4 h-4 text-white" />
          </div>
        </Transition>
      </button>
    </div>
  </div>
</template>
