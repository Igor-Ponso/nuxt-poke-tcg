<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { TCGRarity } from '~/types'

const emit = defineEmits<{
  filter: [filters: { rarity?: TCGRarity; set?: string }]
}>()

const selectedRarity = ref('')
const selectedSet = ref('')
const showFilters = ref(false)

const rarities = [
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

function applyFilters() {
  emit('filter', {
    rarity: (selectedRarity.value || undefined) as TCGRarity | undefined,
    set: selectedSet.value || undefined,
  })
  showFilters.value = false
}

function clearFilters() {
  selectedRarity.value = ''
  selectedSet.value = ''
  emit('filter', {})
}

const hasActiveFilters = computed(() => selectedRarity.value || selectedSet.value)
</script>

<template>
  <div class="relative">
    <!-- Filter Toggle Button -->
    <button
      type="button"
      class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all flex items-center gap-2"
      @click="showFilters = !showFilters"
    >
      <Icon icon="ph:funnel-bold" class="w-5 h-5" />
      <span>Filters</span>
      <span v-if="hasActiveFilters" class="ml-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-medium">
        {{ [selectedRarity, selectedSet].filter(Boolean).length }}
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
        class="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4"
      >
        <!-- Rarity Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Rarity
          </label>
          <select
            v-model="selectedRarity"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Rarities
            </option>
            <option v-for="rarity in rarities" :key="rarity" :value="rarity">
              {{ rarity }}
            </option>
          </select>
        </div>

        <!-- Set Filter (Simplified - will need sets from store) -->
        <div>
          <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Set ID
          </label>
          <input
            v-model="selectedSet"
            type="text"
            placeholder="e.g., base1, xy1, swsh1"
            class="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            @click="applyFilters"
          >
            Apply
          </button>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            @click="clearFilters"
          >
            Clear
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
