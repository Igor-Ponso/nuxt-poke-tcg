<script setup lang="ts">
/**
 * Game Sprite Selector Component - Redesigned
 *
 * Features:
 * - Card-based layout similar to GenerationSelector
 * - Pikachu sprite preview for each game version
 * - Collapsible/expandable section
 * - Organized by generation
 */

import { Icon } from '@iconify/vue'

export interface GameVersion {
  id: string
  name: string
  generation: number
  color: string
}

interface Props {
  modelValue?: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Expandable state
const isExpanded = ref(true)

/**
 * Available game versions with colors matching generations
 */
const gameVersions: GameVersion[] = [
  // Animated (All Generations)
  { id: 'animated', name: 'Animated', generation: 0, color: 'from-purple-500 to-pink-500' },

  // Generation I
  { id: 'red-blue', name: 'Red/Blue', generation: 1, color: 'from-red-500 to-pink-500' },
  { id: 'yellow', name: 'Yellow', generation: 1, color: 'from-red-500 to-pink-500' },

  // Generation II
  { id: 'gold', name: 'Gold', generation: 2, color: 'from-teal-500 to-cyan-500' },
  { id: 'silver', name: 'Silver', generation: 2, color: 'from-teal-500 to-cyan-500' },
  { id: 'crystal', name: 'Crystal', generation: 2, color: 'from-teal-500 to-cyan-500' },

  // Generation III
  { id: 'ruby-sapphire', name: 'Ruby/Sapphire', generation: 3, color: 'from-blue-500 to-cyan-500' },
  { id: 'emerald', name: 'Emerald', generation: 3, color: 'from-blue-500 to-cyan-500' },
  { id: 'firered-leafgreen', name: 'FireRed/LeafGreen', generation: 3, color: 'from-blue-500 to-cyan-500' },

  // Generation IV
  { id: 'diamond-pearl', name: 'Diamond/Pearl', generation: 4, color: 'from-green-500 to-emerald-500' },
  { id: 'platinum', name: 'Platinum', generation: 4, color: 'from-green-500 to-emerald-500' },
  { id: 'heartgold-soulsilver', name: 'HeartGold/SoulSilver', generation: 4, color: 'from-green-500 to-emerald-500' },

  // Generation V
  { id: 'black-white', name: 'Black/White', generation: 5, color: 'from-yellow-500 to-orange-500' },

  // Generation VI
  { id: 'omegaruby-alphasapphire', name: 'OmegaRuby/AlphaSapphire', generation: 6, color: 'from-gray-400 to-gray-500' },

  // Generation VII
  { id: 'ultra-sun-ultra-moon', name: 'Ultra Sun/Ultra Moon', generation: 7, color: 'from-blue-400 to-indigo-500' },

  // Generation VIII
  { id: 'icons', name: 'Icons', generation: 8, color: 'from-purple-500 to-pink-500' },
]

/**
 * Get Pikachu sprite URL for a specific game version
 */
function getPikachuSpriteUrl(versionId: string): string {
  const versionMap: Record<string, string> = {
    'animated': 'https://projectpokemon.org/images/normal-sprite/pikachu.gif',
    'red-blue': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/25.png',
    'yellow': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/25.png',
    'gold': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/25.png',
    'silver': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/silver/25.png',
    'crystal': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/25.png',
    'ruby-sapphire': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/25.png',
    'emerald': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/25.png',
    'firered-leafgreen': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/25.png',
    'diamond-pearl': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/25.png',
    'platinum': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/25.png',
    'heartgold-soulsilver': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/25.png',
    'black-white': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/25.png',
    'omegaruby-alphasapphire': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/25.png',
    'ultra-sun-ultra-moon': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/25.png',
    'icons': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/25.png',
  }

  return versionMap[versionId] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
}

/**
 * Handle version selection
 */
function selectVersion(versionId: string | null) {
  emit('update:modelValue', versionId)
}

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
      <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Game Sprites
      </h3>
      <div class="flex items-center gap-3">
        <button
          v-if="modelValue !== null"
          type="button"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30"
          @click.stop="selectVersion(null)"
        >
          Reset to Official Artwork
        </button>
        <Icon
          :icon="isExpanded ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
          class="w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-200"
        />
      </div>
    </button>

    <!-- Game Version Grid (Collapsible) -->
    <div
      v-if="isExpanded"
      class="space-y-3 sm:space-y-4"
    >
      <!-- Game Version Cards Grid (including Official Artwork) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <!-- Official Artwork Option -->
        <button
          type="button"
          class="group relative overflow-hidden rounded-2xl border-3 transition-all duration-300 hover:scale-105"
          :class="modelValue === null
            ? 'border-blue-500 shadow-2xl shadow-blue-500/40 ring-4 ring-blue-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-2xl'"
          @click="selectVersion(null)"
        >
          <!-- Gradient Background -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 transition-opacity duration-300"
            :class="modelValue === null ? 'opacity-25' : 'opacity-15 group-hover:opacity-20'"
          />

          <!-- Content - 50/50 Split -->
          <div class="relative flex items-stretch h-full">
            <!-- Left Half - Pikachu Image -->
            <div class="w-1/2 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                alt="Pikachu Official Artwork"
                class="w-full h-full max-h-24 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-125"
                loading="lazy"
              >
            </div>

            <!-- Right Half - Text -->
            <div class="w-1/2 flex flex-col justify-center py-3 sm:py-4 pl-3 sm:pl-4 pr-10 sm:pr-12">
              <div class="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                Official Artwork
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
              v-if="modelValue === null"
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
            class="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          />
        </button>

        <!-- Game Version Cards -->
        <button
          v-for="version in gameVersions"
          :key="version.id"
          type="button"
          class="group relative overflow-hidden rounded-2xl border-3 transition-all duration-300 hover:scale-105"
          :class="modelValue === version.id
            ? 'border-blue-500 shadow-2xl shadow-blue-500/40 ring-4 ring-blue-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-2xl'"
          @click="selectVersion(version.id)"
        >
          <!-- Gradient Background -->
          <div
            class="absolute inset-0 bg-gradient-to-br transition-opacity duration-300"
            :class="[version.color, modelValue === version.id ? 'opacity-25' : 'opacity-15 group-hover:opacity-20']"
          />

          <!-- Content - 50/50 Split -->
          <div class="relative flex items-stretch h-full">
            <!-- Left Half - Pikachu Sprite -->
            <div class="w-1/2 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
              <img
                :src="getPikachuSpriteUrl(version.id)"
                :alt="`Pikachu in ${version.name}`"
                class="w-full h-full max-h-24 object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-125 pixelated"
                loading="lazy"
              >
            </div>

            <!-- Right Half - Text -->
            <div class="w-1/2 flex flex-col justify-center py-3 sm:py-4 pl-3 sm:pl-4 pr-10 sm:pr-12">
              <div class="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                {{ version.name }}
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
              v-if="modelValue === version.id"
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
            :class="version.color"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Preserve pixel art crispness for old game sprites */
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
