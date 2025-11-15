<script setup lang="ts">
/**
 * TCG Card Details Page
 *
 * Shows detailed view of a TCG card with holographic effect
 */

import { Icon } from '@iconify/vue'

const route = useRoute()
const tcgStore = useTCGStore()
const id = String(route.params.id)

useHead({
  title: `Card ${id} - PokéTCG`,
})

onMounted(async () => {
  await tcgStore.selectCard(id)
})

const card = computed(() => tcgStore.selectedCard)
</script>

<template>
  <div v-if="tcgStore.loading" class="flex items-center justify-center py-20">
    <UiLoading type="pokeball" size="xl" message="Loading card..." />
  </div>

  <div v-else-if="card" class="space-y-8">
    <!-- Header -->
    <div>
      <UiButton variant="ghost" size="sm" @click="navigateTo('/tcg')">
        <Icon icon="ph:arrow-left" class="w-4 h-4 mr-1" />
        Back to Gallery
      </UiButton>
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mt-4">
        {{ card.name }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
        <Icon icon="ph:cards" class="w-5 h-5" />
        {{ card.set?.name }} • {{ card.rarity }}
      </p>
    </div>

    <!-- Card Display -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Card Image -->
      <UiCard variant="glass" padding="lg" class="text-center">
        <img
          :src="card.images?.large || card.images?.small"
          :alt="card.name"
          class="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
        >
      </UiCard>

      <!-- Card Info -->
      <UiCard variant="glass" padding="lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Card Information
        </h2>
        <dl class="space-y-3">
          <div v-if="card.supertype">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Type
            </dt>
            <dd class="text-base font-semibold text-gray-900 dark:text-white">
              {{ card.supertype }}
            </dd>
          </div>
          <div v-if="card.subtypes">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Subtypes
            </dt>
            <dd class="text-base font-semibold text-gray-900 dark:text-white">
              {{ card.subtypes.join(', ') }}
            </dd>
          </div>
          <div v-if="card.hp">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              HP
            </dt>
            <dd class="text-base font-semibold text-gray-900 dark:text-white">
              {{ card.hp }}
            </dd>
          </div>
          <div v-if="card.artist">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Artist
            </dt>
            <dd class="text-base font-semibold text-gray-900 dark:text-white">
              {{ card.artist }}
            </dd>
          </div>
        </dl>
      </UiCard>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <p class="text-xl text-gray-600 dark:text-gray-400">
      Card not found
    </p>
    <UiButton variant="primary" class="mt-4" @click="navigateTo('/tcg')">
      Back to Gallery
    </UiButton>
  </div>
</template>
