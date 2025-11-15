<script setup lang="ts">
/**
 * TCG Gallery Page
 *
 * Browse Pokemon TCG cards with holographic effects
 */

useHead({
  title: 'TCG Gallery - PokéTCG',
  meta: [{ name: 'description', content: 'Explore Pokemon Trading Card Game cards with holographic effects' }],
})

const tcgStore = useTCGStore()

onMounted(async () => {
  await tcgStore.initialize()
  if (tcgStore.cards.length === 0) {
    // Load some initial cards
    await tcgStore.searchCards({ pageSize: 20 })
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          TCG Gallery
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Explore Pokemon Trading Card Game collection
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Holographic:
        </span>
        <button
          type="button"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="tcgStore.holographicEnabled ? 'bg-blue-600' : 'bg-gray-300'"
          @click="tcgStore.toggleHolographic()"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="tcgStore.holographicEnabled ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-if="tcgStore.loading && tcgStore.cards.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    </div>

    <div v-else-if="tcgStore.cards.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <UiCard
        v-for="card in tcgStore.filteredCards"
        :key="card.id"
        variant="glass"
        padding="sm"
        hoverable
        clickable
        @click="navigateTo(`/tcg/${card.id}`)"
      >
        <img
          :src="card.imageUrl"
          :alt="card.name"
          class="w-full h-auto rounded-lg"
          loading="lazy"
        >
        <div class="mt-3 space-y-1">
          <h3 class="font-bold text-gray-900 dark:text-white">
            {{ card.name }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ card.setName }}
          </p>
          <p v-if="card.rarity" class="text-xs font-medium text-blue-600 dark:text-blue-400">
            {{ card.rarity }}
          </p>
        </div>
      </UiCard>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-xl text-gray-600 dark:text-gray-400">
        No cards found
      </p>
      <UiButton variant="primary" class="mt-4" @click="tcgStore.searchCards({ pageSize: 20 })">
        Load Cards
      </UiButton>
    </div>
  </div>
</template>
