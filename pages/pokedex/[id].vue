<script setup lang="ts">
/**
 * Pokemon Details Page
 *
 * Shows detailed information about a specific Pokemon with 3D model viewer
 */

import { Icon } from '@iconify/vue'

const route = useRoute()
const pokemonStore = usePokemonStore()
const id = Number(route.params.id)

const show3D = ref(false)
const showShiny = ref(false)

useHead({
  title: `Pokemon #${id} - PokéTCG`,
})

// Load Pokemon data
onMounted(async () => {
  await pokemonStore.selectPokemon(id)
})

const pokemon = computed(() => pokemonStore.selectedPokemon)
const isFavorite = computed(() => pokemonStore.isFavorite(id))

// Computed sprite based on shiny toggle
const currentSprite = computed(() => {
  if (!pokemon.value) return ''
  return showShiny.value && pokemon.value.shinySprite
    ? pokemon.value.shinySprite
    : pokemon.value.sprite
})

function toggleFavorite() {
  if (pokemon.value) {
    const simplified = {
      id: pokemon.value.id,
      name: pokemon.value.name,
      types: pokemon.value.types,
      sprite: pokemon.value.sprite,
      shinySprite: pokemon.value.shinySprite,
      stats: pokemon.value.stats,
    }
    pokemonStore.toggleFavorite(simplified)
  }
}

function toggle3DView() {
  show3D.value = !show3D.value
}

function toggleShiny() {
  showShiny.value = !showShiny.value
}
</script>

<template>
  <div v-if="pokemonStore.loading" class="flex items-center justify-center py-20">
    <UiLoading type="pokeball" size="xl" message="Loading Pokémon..." />
  </div>

  <div v-else-if="pokemon" class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <UiButton variant="ghost" size="sm" @click="navigateTo('/pokedex')">
            <Icon icon="ph:arrow-left" class="w-4 h-4 mr-1" />
            Back
          </UiButton>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            #{{ pokemon.id.toString().padStart(3, '0') }}
          </span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white capitalize">
          {{ formatPokemonName(pokemon.name) }}
        </h1>
        <div class="flex items-center gap-2 mt-3">
          <PokemonTypeTag
            v-for="type in pokemon.types"
            :key="type"
            :type="type"
            size="md"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UiButton
          :variant="isFavorite ? 'danger' : 'secondary'"
          @click="toggleFavorite"
        >
          <Icon :icon="isFavorite ? 'ph:heart-fill' : 'ph:heart'" class="w-5 h-5 mr-2" />
          {{ isFavorite ? 'Remove from' : 'Add to' }} Team
        </UiButton>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Image / 3D Model Viewer -->
      <UiCard variant="glass" padding="lg" class="relative">
        <!-- View Toggle Buttons -->
        <div class="absolute top-4 right-4 z-20 flex gap-2">
          <button
            type="button"
            class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            :class="!show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
            @click="show3D = false"
          >
            <Icon icon="ph:image" class="w-5 h-5" />
            2D
          </button>
          <button
            type="button"
            class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            :class="show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
            @click="show3D = true"
          >
            <Icon icon="ph:cube" class="w-5 h-5" />
            3D
          </button>
        </div>

        <!-- Shiny Toggle -->
        <div class="absolute top-4 left-4 z-20">
          <button
            type="button"
            class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
            :class="showShiny
              ? 'bg-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-400/50'
              : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
            @click="toggleShiny"
          >
            <Icon icon="ph:sparkle-fill" class="w-5 h-5" />
            Shiny
          </button>
        </div>

        <!-- 2D Sprite View -->
        <div v-if="!show3D" class="text-center py-8">
          <div class="relative inline-block">
            <img
              :src="currentSprite"
              :alt="pokemon.name"
              class="w-80 h-80 mx-auto object-contain drop-shadow-2xl transition-all duration-300"
              :class="{ 'animate-pulse': showShiny }"
            >
            <!-- Shiny sparkles for 2D -->
            <div
              v-if="showShiny"
              class="absolute inset-0 pointer-events-none"
            >
              <Icon
                icon="ph:sparkle-fill"
                class="absolute top-0 right-0 w-8 h-8 text-yellow-300 animate-ping"
              />
              <Icon
                icon="ph:sparkle-fill"
                class="absolute bottom-8 left-8 w-6 h-6 text-yellow-300 animate-ping"
                style="animation-delay: 0.3s"
              />
              <Icon
                icon="ph:sparkle-fill"
                class="absolute top-12 left-12 w-7 h-7 text-yellow-300 animate-ping"
                style="animation-delay: 0.6s"
              />
            </div>
          </div>
        </div>

        <!-- 3D Model View -->
        <div v-else class="min-h-[400px]">
          <ClientOnly>
            <Pokemon3DViewer
              :pokemon-id="pokemon.id"
              :pokemon-name="pokemon.name"
              :form="showShiny ? 'shiny' : 'regular'"
              height="400px"
              :show-form-toggle="false"
            />
            <template #fallback>
              <div class="flex items-center justify-center h-[400px] text-gray-500">
                <Icon icon="ph:circle-notch" class="w-8 h-8 animate-spin" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </UiCard>

      <!-- Stats -->
      <UiCard variant="glass" padding="lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Base Stats
        </h2>
        <div class="space-y-3">
          <div v-for="(value, stat) in pokemon.stats" :key="stat" class="space-y-1">
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
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min((value / 255) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <p class="text-xl text-gray-600 dark:text-gray-400">
      Pokémon not found
    </p>
    <UiButton variant="primary" class="mt-4" @click="navigateTo('/pokedex')">
      Back to Pokédex
    </UiButton>
  </div>
</template>
