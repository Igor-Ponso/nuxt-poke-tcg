<script setup lang="ts">
/**
 * TCG Gallery Page
 *
 * Browse Pokemon TCG cards with holographic effects
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedTCGCard } from '~/types'
import type { TCGCardFilters } from '~/stores/tcg'

useHead({
  title: 'TCG Gallery - PokéTCG',
  meta: [{ name: 'description', content: 'Explore Pokemon Trading Card Game cards with holographic effects' }],
})

const tcgStore = useTCGStore()
const searchQuery = ref('')
const isSearching = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const selectedCard = ref<SimplifiedTCGCard | null>(null)
const showCardModal = ref(false)

/**
 * Virtual Grid Setup for Performance
 * Only renders visible TCG cards + buffer
 */
const {
  virtualItems,
  wrapperProps,
  contentProps,
} = useVirtualGrid(computed(() => tcgStore.cards), {
  itemHeight: 420, // Estimated TCG card height (taller than Pokemon cards)
  gap: 24, // gap-6 in Tailwind = 24px
  overscan: 2,
  columns: {
    'default': 1, // Mobile
    'sm': 2, // >= 640px
    'lg': 3, // >= 1024px
    'xl': 4, // >= 1280px
    '2xl': 5, // >= 1536px
  },
  debug: false,
})

/**
 * A name search looks across every collection — pinning it to the open set would
 * hide the very cards someone is searching for.
 */
async function handleSearch() {
  isSearching.value = true
  const name = searchQuery.value.trim()
  await tcgStore.searchCards(
    name
      ? { name, rarity: tcgStore.filters.rarity, supertype: tcgStore.filters.supertype }
      : { ...tcgStore.filters, name: undefined },
  )
  isSearching.value = false
}

function handleFilter(filters: TCGCardFilters) {
  searchQuery.value = ''
  tcgStore.searchCards(filters)
}

function handleReset() {
  searchQuery.value = ''
  tcgStore.resetFilters()
}

function clearSearch() {
  searchQuery.value = ''
  handleSearch()
}

function handleCardClick(card: SimplifiedTCGCard) {
  selectedCard.value = card
  showCardModal.value = true
}

function closeModal() {
  showCardModal.value = false
  setTimeout(() => {
    selectedCard.value = null
  }, 300)
}

onMounted(async () => {
  await tcgStore.initialize()

  // Infinite scroll observer
  const observer = new IntersectionObserver((entries) => {
    const first = entries[0]
    if (first?.isIntersecting) {
      tcgStore.loadMore()
    }
  }, { threshold: 0.5 })

  watch(loadMoreTrigger, (el) => {
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            TCG Gallery
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            <!-- currentSet resolves only once the set list lands, so key the branch on
                 the filter itself to avoid flashing the wrong caption on first paint -->
            <template v-if="tcgStore.filters.set">
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ tcgStore.currentSet?.name || 'Coleção' }}
              </span>
              <template v-if="tcgStore.currentSet">
                · {{ tcgStore.currentSet.series }}
                · {{ tcgStore.currentSet.releaseDate.slice(0, 4) }}
              </template>
              · {{ tcgStore.totalCount }} cartas
            </template>
            <template v-else-if="tcgStore.filters.name">
              {{ tcgStore.totalCount }} cartas encontradas
            </template>
            <template v-else>
              Todas as coleções, em ordem da Pokédex
            </template>
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

      <!-- Search Bar and Filters -->
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search cards by name..."
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            @keyup.enter="handleSearch"
          >
          <Icon
            v-if="searchQuery"
            icon="ph:x-circle-fill"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            @click="clearSearch"
          />
        </div>
        <TCGFilters
          :filters="tcgStore.filters"
          @apply="handleFilter"
          @reset="handleReset"
        />
        <button
          type="button"
          class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSearching"
          @click="handleSearch"
        >
          <Icon
            icon="ph:magnifying-glass-bold"
            class="w-5 h-5"
          />
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Cards Grid -->
    <div
      v-if="tcgStore.loading && tcgStore.cards.length === 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-center"
    >
      <div
        v-for="n in 20"
        :key="n"
        class="w-56 h-80 animate-pulse"
      >
        <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg" />
      </div>
    </div>

    <!-- TCG Cards Grid with Virtual Scrolling -->
    <div
      v-else-if="tcgStore.cards.length > 0"
      class="space-y-6"
    >
      <div v-bind="wrapperProps">
        <div v-bind="contentProps">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-center">
            <TCGCard
              v-for="item in virtualItems"
              :key="`tcg-${item.data.id}`"
              :card="item.data"
              :holographic-enabled="tcgStore.holographicEnabled"
              card-type="regular-holo"
              size="md"
              @click="handleCardClick(item.data)"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-20"
    >
      <p class="text-xl text-gray-600 dark:text-gray-400">
        {{ tcgStore.error || 'Nenhuma carta encontrada com esses filtros' }}
      </p>
      <UiButton
        variant="primary"
        class="mt-4"
        @click="handleReset"
      >
        Voltar para o Base Set
      </UiButton>
    </div>

    <!-- Infinite Scroll Trigger -->
    <div
      v-if="tcgStore.cards.length > 0"
      ref="loadMoreTrigger"
      class="py-8 text-center"
    >
      <div
        v-if="tcgStore.loading"
        class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
      >
        <Icon
          icon="ph:circle-notch"
          class="w-5 h-5 animate-spin"
        />
        <span>Loading more cards...</span>
      </div>
      <p
        v-else-if="!tcgStore.hasMore"
        class="text-gray-500 dark:text-gray-400"
      >
        No more cards to load
      </p>
    </div>

    <!-- Card Detail Modal -->
    <TCGCardModal
      :card="selectedCard"
      :show="showCardModal"
      @close="closeModal"
    />
  </div>
</template>
