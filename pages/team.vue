<script setup lang="ts">
/**
 * Team / Favorites Page
 *
 * View and manage your favorite Pokemon team (max 6)
 */

import type { PokemonType } from '~/types'

useHead({
  title: 'My Team - PokéTCG',
  meta: [{ name: 'description', content: 'View and manage your favorite Pokemon team' }],
})

const pokemonStore = usePokemonStore()

onMounted(() => {
  pokemonStore.loadFavoritesFromStorage()
})

const favorites = computed(() => pokemonStore.favorites)
const canAddMore = computed(() => favorites.value.length < 6)

/**
 * Calculate team stats
 */
const teamStats = computed(() => {
  if (favorites.value.length === 0) return null

  const totalStats = favorites.value.reduce(
    (acc, pokemon) => {
      acc.hp += pokemon.stats.hp
      acc.attack += pokemon.stats.attack
      acc.defense += pokemon.stats.defense
      acc.specialAttack += pokemon.stats.specialAttack
      acc.specialDefense += pokemon.stats.specialDefense
      acc.speed += pokemon.stats.speed
      return acc
    },
    { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
  )

  const count = favorites.value.length
  return {
    hp: Math.round(totalStats.hp / count),
    attack: Math.round(totalStats.attack / count),
    defense: Math.round(totalStats.defense / count),
    specialAttack: Math.round(totalStats.specialAttack / count),
    specialDefense: Math.round(totalStats.specialDefense / count),
    speed: Math.round(totalStats.speed / count),
  }
})

/**
 * Get all unique types in team
 */
const teamTypes = computed(() => {
  const types = new Set<PokemonType>()
  favorites.value.forEach((pokemon) => {
    pokemon.types.forEach(type => types.add(type))
  })
  return Array.from(types)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
        My Team
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Your favorite Pokemon team ({{ favorites.length }}/6)
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="favorites.length === 0"
      class="text-center py-20"
    >
      <div class="text-6xl mb-4">
        ⭐
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No Pokemon in your team yet
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Start building your dream team by favoriting Pokemon from the Pokedex!
      </p>
      <UiButton
        variant="primary"
        size="lg"
        @click="navigateTo('/pokedex')"
      >
        Browse Pokédex
      </UiButton>
    </div>

    <!-- Team Content -->
    <div
      v-else
      class="space-y-8"
    >
      <!-- Team Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Average Stats -->
        <UiCard
          variant="glass"
          padding="lg"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Average Stats
          </h2>
          <div
            v-if="teamStats"
            class="space-y-3"
          >
            <div
              v-for="(value, stat) in teamStats"
              :key="stat"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {{ stat }}
                </span>
                <span class="font-bold text-gray-900 dark:text-white">
                  {{ value }}
                </span>
              </div>
              <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  :style="{ width: `${Math.min((value / 255) * 100, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </UiCard>

        <!-- Type Coverage -->
        <UiCard
          variant="glass"
          padding="lg"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Type Coverage
          </h2>
          <div class="flex flex-wrap gap-2">
            <PokemonTypeTag
              v-for="type in teamTypes"
              :key="type"
              :type="type"
              size="md"
              show-icon
            />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Your team has {{ teamTypes.length }} unique type{{ teamTypes.length !== 1 ? 's' : '' }}
          </p>
        </UiCard>
      </div>

      <!-- Team Members -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Team Members
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PokemonCard
            v-for="pokemon in favorites"
            :key="pokemon.id"
            :pokemon="pokemon"
            size="md"
            :favorited="true"
            show-stats
            @click="navigateTo(`/pokedex/${pokemon.id}`)"
            @favorite="pokemonStore.toggleFavorite(pokemon)"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-center gap-4">
        <UiButton
          v-if="canAddMore"
          variant="primary"
          @click="navigateTo('/pokedex')"
        >
          Add More Pokemon ({{ 6 - favorites.length }} slots left)
        </UiButton>
        <UiButton
          variant="secondary"
          @click="pokemonStore.favorites = []"
        >
          Clear Team
        </UiButton>
      </div>
    </div>
  </div>
</template>
