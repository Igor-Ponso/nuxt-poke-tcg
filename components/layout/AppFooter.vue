<script setup lang="ts">
/**
 * AppFooter Component
 *
 * Simple, casual footer with essential info
 */

import { Icon } from '@iconify/vue'

// Static year to prevent hydration mismatch
const currentYear = new Date().getFullYear()

/**
 * Quick links
 */
const quickLinks = [
  { label: 'Pokédex', path: '/pokedex' },
  { label: 'TCG Gallery', path: '/tcg' },
  { label: 'My Team', path: '/team' },
]
</script>

<template>
  <footer class="w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 transition-colors">
    <div class="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <!-- Single row footer -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <!-- Left: Brand + Love -->
        <div class="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span>Made with</span>
          <Icon icon="ph:heart-fill" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
          <span>for Pokémon fans</span>
        </div>

        <!-- Center: Quick Links -->
        <nav class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.path"
            :to="link.path"
            class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] flex items-center"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right: Credits -->
        <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center md:text-right">
          <p>
            © {{ currentYear }} PokéTCG
          </p>
        </div>
      </div>

      <!-- Attribution -->
      <div class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        <p class="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-500 leading-relaxed">
          Data provided by
          <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            PokéAPI
          </a>
          and
          <a href="https://pokemontcg.io/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Pokémon TCG API
          </a>
          <span class="hidden sm:inline">•</span>
          <span class="block sm:inline mt-1 sm:mt-0">Pokémon © Nintendo/Game Freak</span>
        </p>
      </div>
    </div>
  </footer>
</template>
