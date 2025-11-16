<script setup lang="ts">
/**
 * Home Page - Landing/Entry Point
 *
 * Main navigation hub with search and quick access to all sections
 */

import { Icon } from '@iconify/vue'

useHead({
  title: 'PokéTCG - Your Ultimate Pokémon Companion',
  meta: [
    { name: 'description', content: 'Explore the complete Pokédex, TCG cards, moves, abilities, items, and more' },
  ],
})

const searchQuery = ref('')
const router = useRouter()

/**
 * Navigation sections with dynamic routing
 */
const navigationSections = [
  {
    title: 'Pokédex',
    description: 'Browse all Pokémon',
    icon: 'ph:books-bold',
    route: '/pokedex',
    color: 'from-red-500 to-pink-500',
    available: true,
  },
  {
    title: 'Moves',
    description: 'All Pokémon moves',
    icon: 'ph:sword-bold',
    route: '/moves',
    color: 'from-blue-500 to-cyan-500',
    available: false,
  },
  {
    title: 'Abilities',
    description: 'Pokémon abilities',
    icon: 'ph:lightning-bold',
    route: '/abilities',
    color: 'from-yellow-500 to-orange-500',
    available: false,
  },
  {
    title: 'Items',
    description: 'All items',
    icon: 'ph:backpack-bold',
    route: '/items',
    color: 'from-purple-500 to-indigo-500',
    available: false,
  },
  {
    title: 'Locations',
    description: 'Explore regions',
    icon: 'ph:map-pin-bold',
    route: '/locations',
    color: 'from-green-500 to-emerald-500',
    available: false,
  },
  {
    title: 'Type Charts',
    description: 'Type effectiveness',
    icon: 'ph:chart-bar-bold',
    route: '/type-charts',
    color: 'from-teal-500 to-cyan-500',
    available: false,
  },
]

/**
 * Handle search submission
 */
function handleSearch() {
  if (!searchQuery.value.trim()) return

  // Navigate to Pokedex with search query
  router.push({
    path: '/pokedex',
    query: { search: searchQuery.value.trim() },
  })
}

/**
 * Navigate to section
 */
function navigateToSection(section: typeof navigationSections[0]) {
  if (!section.available) {
    // TODO: Show "Coming soon" toast
    console.log(`${section.title} coming soon!`)
    return
  }

  router.push(section.route)
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-4xl space-y-12">
      <!-- Hero Title -->
      <div class="text-center space-y-4">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
          <span class="block text-gray-900 dark:text-white">Welcome to</span>
          <span
            class="block bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent"
          >
            PokéTCG
          </span>
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400">
          Your ultimate Pokémon companion
        </p>
      </div>

      <!-- Search Bar -->
      <div class="relative max-w-2xl mx-auto">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Pokemon, Move, Ability, etc..."
            class="w-full px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 text-base sm:text-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg"
            @keyup.enter="handleSearch"
          >
          <button
            type="button"
            class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!searchQuery.trim()"
            @click="handleSearch"
          >
            <Icon icon="ph:magnifying-glass-bold" class="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <!-- Navigation Grid -->
      <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <button
          v-for="section in navigationSections"
          :key="section.title"
          type="button"
          class="group relative overflow-hidden rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-4 sm:p-5 md:p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          :disabled="!section.available"
          @click="navigateToSection(section)"
        >
          <!-- Gradient Background (on hover) -->
          <div
            class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            :class="section.color"
          />

          <!-- Content -->
          <div class="relative space-y-3">
            <!-- Icon -->
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br"
              :class="section.color"
            >
              <Icon :icon="section.icon" class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>

            <!-- Text -->
            <div>
              <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {{ section.title }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ section.description }}
              </p>

              <!-- Coming Soon Badge -->
              <span
                v-if="!section.available"
                class="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                Coming Soon
              </span>
            </div>
          </div>
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-center pt-8">
        <div>
          <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            1025+
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Pokémon
          </div>
        </div>
        <div class="w-px h-10 sm:h-12 bg-gray-300 dark:bg-gray-600" />
        <div>
          <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            9
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Generations
          </div>
        </div>
        <div class="w-px h-10 sm:h-12 bg-gray-300 dark:bg-gray-600" />
        <div>
          <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            18
          </div>
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Types
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
