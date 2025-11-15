<script setup lang="ts">
/**
 * Pokédex Page
 *
 * Browse and search all Pokémon with filters
 */

useHead({
  title: 'Pokédex - PokéTCG',
  meta: [{ name: 'description', content: 'Browse all Pokémon from Generation I to IX' }],
})

const pokemonStore = usePokemonStore()
const route = useRoute()

// Initialize store
onMounted(async () => {
  await pokemonStore.initialize()

  // Apply query params if present
  if (route.query.search) {
    await pokemonStore.searchPokemons(route.query.search as string)
  }
})

/**
 * Load more Pokemon
 */
async function loadMore() {
  if (!pokemonStore.hasMore || pokemonStore.loading) return
  await pokemonStore.fetchPokemons(pokemonStore.currentPage + 1)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Pokédex
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Browse all {{ pokemonStore.totalCount }} Pokémon
        </p>
      </div>
    </div>

    <!-- Pokemon Grid -->
    <div v-if="pokemonStore.loading && pokemonStore.pokemons.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <PokemonCard
          v-for="pokemon in pokemonStore.filteredPokemons"
          :key="pokemon.id"
          :pokemon="pokemon"
          size="md"
          :favorited="pokemonStore.isFavorite(pokemon.id)"
          @click="navigateTo(`/pokedex/${pokemon.id}`)"
          @favorite="pokemonStore.toggleFavorite(pokemon)"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="pokemonStore.hasMore" class="flex justify-center pt-8">
        <UiButton
          variant="secondary"
          size="lg"
          :loading="pokemonStore.loading"
          @click="loadMore"
        >
          Load More Pokémon
        </UiButton>
      </div>
    </div>
  </div>
</template>
