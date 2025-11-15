<script setup lang="ts">
/**
 * Home Page
 *
 * Landing page with hero section, features, and quick stats
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedPokemon } from '~/types'

useHead({
  title: 'Home - PokéTCG',
  meta: [
    { name: 'description', content: 'Your ultimate Pokémon companion with complete Pokédex and TCG card collection' },
  ],
})

const pokemonStore = usePokemonStore()
const tcgStore = useTCGStore()
const uiStore = useUIStore()

// Initialize stores
onMounted(async () => {
  await pokemonStore.initialize()
  await tcgStore.initialize()
})

/**
 * Featured Pokémon (starters from Gen 1)
 */
const featuredPokemon = ref<SimplifiedPokemon[]>([])

/**
 * Load featured Pokémon
 */
async function loadFeaturedPokemon() {
  const api = usePokemonApi()
  const starterIds = [1, 4, 7, 25] // Bulbasaur, Charmander, Squirtle, Pikachu

  try {
    const promises = starterIds.map(async (id) => {
      const pokemon = await api.fetchPokemon(id)
      return api.simplifyPokemon(pokemon)
    })

    featuredPokemon.value = await Promise.all(promises)
  }
  catch (error) {
    console.error('Error loading featured Pokemon:', error)
  }
}

onMounted(() => {
  loadFeaturedPokemon()
})

/**
 * Stats for hero section
 */
const stats = computed(() => [
  {
    label: 'Pokémon',
    value: '1025+',
    icon: 'ph:books',
    description: 'From all generations',
  },
  {
    label: 'TCG Cards',
    value: '10,000+',
    icon: 'ph:cards',
    description: 'Physical trading cards',
  },
  {
    label: 'Types',
    value: '18',
    icon: 'ph:lightning',
    description: 'Unique Pokémon types',
  },
  {
    label: 'Generations',
    value: '9',
    icon: 'ph:star-four',
    description: 'Complete generations',
  },
])

/**
 * Features
 */
const features = [
  {
    title: 'Complete Pokédex',
    description: 'Browse through all Pokémon from Generation I to IX with detailed stats, abilities, and evolution chains.',
    icon: 'ph:books',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'TCG Gallery',
    description: 'Explore thousands of Pokémon Trading Card Game cards with high-quality images and holographic effects.',
    icon: 'ph:cards',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Build Your Team',
    description: 'Create your dream team by favoriting up to 6 Pokémon and view their combined stats and type coverage.',
    icon: 'ph:star',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Holographic Cards',
    description: 'Experience photorealistic holographic effects on TCG cards with multiple foil patterns and 3D animations.',
    icon: 'ph:sparkle',
    color: 'from-green-500 to-emerald-500',
  },
]
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center space-y-8 py-12">
      <!-- Hero Content -->
      <div class="space-y-6">
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
          <span class="block">Welcome to</span>
          <span
            class="block bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent"
          >
            PokéTCG
          </span>
        </h1>

        <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your ultimate Pokémon companion with a complete Pokédex and TCG card collection.
          Gotta catch 'em all!
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UiButton
            variant="primary"
            size="lg"
            @click="navigateTo('/pokedex')"
          >
            <Icon icon="ph:books" class="w-5 h-5" />
            Explore Pokédex
          </UiButton>

          <UiButton
            variant="secondary"
            size="lg"
            @click="navigateTo('/tcg')"
          >
            <Icon icon="ph:cards" class="w-5 h-5" />
            Browse TCG Cards
          </UiButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
        <UiCard
          v-for="stat in stats"
          :key="stat.label"
          variant="glass"
          padding="lg"
          class="text-center"
        >
          <div class="space-y-2">
            <div class="text-4xl flex items-center justify-center">
              <Icon :icon="stat.icon" class="w-10 h-10" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ stat.value }}
            </div>
            <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ stat.label }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ stat.description }}
            </div>
          </div>
        </UiCard>
      </div>
    </section>

    <!-- Featured Pokémon -->
    <section v-if="featuredPokemon.length > 0" class="space-y-8">
      <div class="text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Featured Pokémon
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Meet some of the most iconic Pokémon
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PokemonCard
          v-for="pokemon in featuredPokemon"
          :key="pokemon.id"
          :pokemon="pokemon"
          size="md"
          :favorited="pokemonStore.isFavorite(pokemon.id)"
          @click="navigateTo(`/pokedex/${pokemon.id}`)"
          @favorite="pokemonStore.toggleFavorite(pokemon)"
        />
      </div>
    </section>

    <!-- Features -->
    <section class="space-y-8">
      <div class="text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Features
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Everything you need to explore the Pokémon universe
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiCard
          v-for="feature in features"
          :key="feature.title"
          variant="glass"
          padding="lg"
          hoverable
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              :class="`bg-gradient-to-br ${feature.color}`"
            >
              <Icon :icon="feature.icon" class="w-8 h-8 text-white" />
            </div>
            <div class="flex-1 space-y-2">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </UiCard>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <UiCard
        variant="glass"
        padding="lg"
        class="text-center"
        gradient
        gradient-from="#3b82f6"
        gradient-to="#8b5cf6"
      >
        <div class="space-y-6">
          <h2 class="text-3xl md:text-4xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">
            Discover over 1,000 Pokémon, build your dream team, and explore thousands of TCG cards.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <UiButton
              variant="secondary"
              size="lg"
              @click="navigateTo('/pokedex')"
            >
              Get Started
            </UiButton>
          </div>
        </div>
      </UiCard>
    </section>
  </div>
</template>
