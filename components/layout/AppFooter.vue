<script setup lang="ts">
/**
 * AppFooter Component
 *
 * Footer with links, credits, and social info
 */

import { Icon } from '@iconify/vue'

// Static year to prevent hydration mismatch
const currentYear = 2024

/**
 * Footer links organized by category
 */
const footerLinks = {
  explore: [
    { label: 'Home', path: '/' },
    { label: 'Pokédex', path: '/pokedex' },
    { label: 'TCG Gallery', path: '/tcg' },
    { label: 'My Team', path: '/team' },
  ],
  resources: [
    { label: 'PokéAPI', href: 'https://pokeapi.co/', external: true },
    { label: 'Pokémon TCG API', href: 'https://pokemontcg.io/', external: true },
    { label: 'Official Pokémon Site', href: 'https://www.pokemon.com/', external: true },
  ],
}

/**
 * Social links
 */
const socialLinks = [
  { label: 'GitHub', icon: 'ph:github-logo', href: 'https://github.com' },
  { label: 'Twitter', icon: 'ph:twitter-logo', href: 'https://twitter.com' },
  { label: 'Discord', icon: 'ph:discord-logo', href: 'https://discord.com' },
]
</script>

<template>
  <footer class="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
    <div class="container mx-auto px-4 py-12 max-w-7xl">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <!-- Brand Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <Icon icon="ph:lightning" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                PokéTCG
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                Gotta catch 'em all!
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Your ultimate Pokémon companion with Pokédex and TCG card collection features.
          </p>
          <!-- Social Links -->
          <div class="flex gap-2">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              :aria-label="social.label"
            >
              <Icon :icon="social.icon" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Explore -->
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Explore
          </h4>
          <ul class="space-y-2">
            <li v-for="link in footerLinks.explore" :key="link.path">
              <NuxtLink
                :to="link.path"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Resources
          </h4>
          <ul class="space-y-2">
            <li v-for="link in footerLinks.resources" :key="link.href">
              <a
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                {{ link.label }}
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <!-- Bottom Section -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {{ currentYear }} PokéTCG. Built with Nuxt 3 & Vue 3.
          </p>
          <p class="text-center md:text-right">
            Pokémon and All Respective Names are Trademark & © of Nintendo 1996-{{ currentYear }}
          </p>
        </div>

        <!-- Attribution -->
        <div class="mt-4 text-xs text-center text-gray-500 dark:text-gray-500">
          <p>
            Data provided by
            <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-700 dark:hover:text-gray-300">
              PokéAPI
            </a>
            and
            <a href="https://pokemontcg.io/" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-700 dark:hover:text-gray-300">
              Pokémon TCG API
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
