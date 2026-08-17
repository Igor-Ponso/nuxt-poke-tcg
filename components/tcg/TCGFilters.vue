<script setup lang="ts">
/**
 * TCG Filters
 *
 * Series → Collection pickers plus rarity and card type. Options come from the set list
 * the store already loads, so nobody has to guess that Base Set is spelled "base1".
 */

import { Icon } from '@iconify/vue'
import type { TCGRarity, TCGSupertype } from '~/types'
import type { TCGCardFilters } from '~/stores/tcg'

const props = defineProps<{
  filters: TCGCardFilters
}>()

const emit = defineEmits<{
  apply: [filters: TCGCardFilters]
  reset: []
}>()

const tcgStore = useTCGStore()
const showFilters = ref(false)

const RARITIES: TCGRarity[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Ultra',
  'Rare Secret',
  'Rare Rainbow',
]

const SUPERTYPES: TCGSupertype[] = ['Pokémon', 'Trainer', 'Energy']

// Draft state — the panel only takes effect on Apply
const series = ref('')
const setId = ref('')
const rarity = ref('')
const supertype = ref('')

const seriesNames = computed(() => Object.keys(tcgStore.setsBySeries))

// setsBySeries is already sorted newest-first, within and across series
const setsInSeries = computed(() =>
  series.value
    ? tcgStore.setsBySeries[series.value] || []
    : Object.values(tcgStore.setsBySeries).flat(),
)

/** Seed the draft from whatever is currently applied whenever the panel opens */
function syncDraft() {
  setId.value = props.filters.set || ''
  rarity.value = props.filters.rarity || ''
  supertype.value = props.filters.supertype || ''
  series.value = tcgStore.sets.find(s => s.id === setId.value)?.series || ''
}

watch(showFilters, open => open && syncDraft())
watch(() => props.filters, syncDraft, { deep: true })

/** Changing series invalidates a set that no longer belongs to it */
watch(series, () => {
  if (setId.value && !setsInSeries.value.some(s => s.id === setId.value)) {
    setId.value = ''
  }
})

function apply() {
  emit('apply', {
    set: setId.value || undefined,
    rarity: (rarity.value || undefined) as TCGRarity | undefined,
    supertype: (supertype.value || undefined) as TCGSupertype | undefined,
  })
  showFilters.value = false
}

function reset() {
  emit('reset')
  showFilters.value = false
}

function setLabel(id: string) {
  const set = tcgStore.sets.find(s => s.id === id)
  if (!set) return id
  return `${set.name} (${set.releaseDate.slice(0, 4)}) · ${set.total} cartas`
}
</script>

<template>
  <div class="relative">
    <!-- Filter Toggle Button -->
    <button
      type="button"
      class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all flex items-center gap-2"
      :aria-expanded="showFilters"
      aria-haspopup="true"
      @click="showFilters = !showFilters"
    >
      <Icon
        icon="ph:funnel-bold"
        class="w-5 h-5"
      />
      <span class="hidden sm:inline">Filters</span>
      <span
        v-if="tcgStore.activeFilterCount"
        class="ml-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-medium"
      >
        {{ tcgStore.activeFilterCount }}
      </span>
    </button>

    <!-- Filters Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showFilters"
        class="absolute top-full right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4"
      >
        <!-- Series -->
        <div>
          <label
            for="tcg-series"
            class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            Série
          </label>
          <select
            id="tcg-series"
            v-model="series"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Todas as séries
            </option>
            <option
              v-for="name in seriesNames"
              :key="name"
              :value="name"
            >
              {{ name }} ({{ tcgStore.setsBySeries[name]?.length }})
            </option>
          </select>
        </div>

        <!-- Collection -->
        <div>
          <label
            for="tcg-set"
            class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            Coleção
          </label>
          <select
            id="tcg-set"
            v-model="setId"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Todas as coleções (ordem da Pokédex)
            </option>
            <option
              v-for="set in setsInSeries"
              :key="set.id"
              :value="set.id"
            >
              {{ setLabel(set.id) }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dentro de uma coleção as cartas vêm na ordem do álbum, sem repetição.
          </p>
        </div>

        <!-- Rarity -->
        <div>
          <label
            for="tcg-rarity"
            class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            Raridade
          </label>
          <select
            id="tcg-rarity"
            v-model="rarity"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Todas as raridades
            </option>
            <option
              v-for="r in RARITIES"
              :key="r"
              :value="r"
            >
              {{ r }}
            </option>
          </select>
        </div>

        <!-- Supertype -->
        <div>
          <label
            for="tcg-supertype"
            class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
          >
            Tipo de carta
          </label>
          <select
            id="tcg-supertype"
            v-model="supertype"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Todos os tipos
            </option>
            <option
              v-for="t in SUPERTYPES"
              :key="t"
              :value="t"
            >
              {{ t }}
            </option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            @click="apply"
          >
            Aplicar
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            @click="reset"
          >
            Limpar
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="showFilters"
      class="fixed inset-0 z-40"
      @click="showFilters = false"
    />
  </div>
</template>
