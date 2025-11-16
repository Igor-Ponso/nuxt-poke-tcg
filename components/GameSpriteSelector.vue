<script setup lang="ts">
/**
 * Game Sprite Selector Component
 *
 * Allows users to select which game sprites to display
 * Shows sprites from different Pokemon game versions
 */

import { Icon } from '@iconify/vue'

export interface GameVersion {
  id: string
  name: string
  generation: number
  icon?: string
}

interface Props {
  modelValue?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

/**
 * Available game versions organized by generation
 */
const gameVersions: GameVersion[] = [
  // Generation I
  { id: 'red-blue', name: 'Red/Blue', generation: 1, icon: 'game-icons:pokeball' },
  { id: 'yellow', name: 'Yellow', generation: 1, icon: 'game-icons:lightning-bolt' },

  // Generation II
  { id: 'gold', name: 'Gold', generation: 2, icon: 'game-icons:gold-bar' },
  { id: 'silver', name: 'Silver', generation: 2, icon: 'game-icons:metal-scales' },
  { id: 'crystal', name: 'Crystal', generation: 2, icon: 'game-icons:crystal-cluster' },

  // Generation III
  { id: 'ruby-sapphire', name: 'Ruby/Sapphire', generation: 3, icon: 'game-icons:ruby' },
  { id: 'emerald', name: 'Emerald', generation: 3, icon: 'game-icons:emerald' },
  { id: 'firered-leafgreen', name: 'FireRed/LeafGreen', generation: 3, icon: 'game-icons:fire' },

  // Generation IV
  { id: 'diamond-pearl', name: 'Diamond/Pearl', generation: 4, icon: 'game-icons:diamond' },
  { id: 'platinum', name: 'Platinum', generation: 4, icon: 'game-icons:medal' },
  { id: 'heartgold-soulsilver', name: 'HeartGold/SoulSilver', generation: 4, icon: 'game-icons:heart-bottle' },

  // Generation V
  { id: 'black-white', name: 'Black/White', generation: 5, icon: 'game-icons:yin-yang' },

  // Generation VI
  { id: 'omegaruby-alphasapphire', name: 'OmegaRuby/AlphaSapphire', generation: 6, icon: 'game-icons:omega' },

  // Generation VII
  { id: 'ultra-sun-ultra-moon', name: 'Ultra Sun/Ultra Moon', generation: 7, icon: 'game-icons:sun' },

  // Generation VIII
  { id: 'icons', name: 'Icons', generation: 8, icon: 'game-icons:game-console' },
]

/**
 * Handle version selection
 */
function selectVersion(versionId: string | null) {
  emit('update:modelValue', versionId)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Game Sprites
      </h3>
      <button
        v-if="modelValue !== null"
        type="button"
        class="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors min-h-[44px] px-2"
        @click="selectVersion(null)"
      >
        Use Official Artwork
      </button>
    </div>

    <!-- Version Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
      <!-- Official Artwork Option -->
      <button
        type="button"
        class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-3 sm:p-4 min-h-[100px]"
        :class="modelValue === null
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
          : 'border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg'"
        @click="selectVersion(null)"
      >
        <div class="space-y-1.5 sm:space-y-2 text-center">
          <div class="flex items-center justify-center">
            <Icon
              icon="ph:image-bold"
              class="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-400"
            />
          </div>
          <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
            Official
          </div>
          <div class="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
            Artwork
          </div>
        </div>
      </button>

      <!-- Game Version Buttons -->
      <button
        v-for="version in gameVersions"
        :key="version.id"
        type="button"
        class="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 min-h-[100px]"
        :class="modelValue === version.id
          ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg bg-white/50 dark:bg-gray-800/50'"
        @click="selectVersion(version.id)"
      >
        <!-- Content -->
        <div class="relative p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          <!-- Icon -->
          <div class="flex items-center justify-center">
            <Icon
              :icon="version.icon || 'game-icons:pokeball'"
              class="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 dark:text-gray-300"
            />
          </div>

          <!-- Name -->
          <div class="text-center">
            <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {{ version.name }}
            </div>
            <div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
              Gen {{ version.generation }}
            </div>
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
            v-if="modelValue === version.id"
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
          >
            <Icon
              icon="ph:check-bold"
              class="w-4 h-4 text-white"
            />
          </div>
        </Transition>
      </button>
    </div>
  </div>
</template>
