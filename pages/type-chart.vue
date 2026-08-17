<script setup lang="ts">
/**
 * Type Chart Page
 *
 * Interactive type effectiveness chart showing all Pokemon type matchups
 */

import { Icon } from '@iconify/vue'
import type { PokemonType } from '~/types'

useHead({
  title: 'Type Chart - PokéTCG',
  meta: [{ name: 'description', content: 'Interactive Pokemon type effectiveness chart' }],
})

const ALL_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

// State
const selectedAttacker = ref<PokemonType | null>(null)
const selectedDefender = ref<PokemonType | null>(null)
const hoveredCell = ref<{ attacker: PokemonType, defender: PokemonType } | null>(null)

/**
 * Get effectiveness multiplier for attacker vs defender
 */
function getEffectiveness(attacker: PokemonType, defender: PokemonType): number {
  const { getStrongAgainst, getWeakAgainst, getNoEffectAgainst } = useTypeEffectiveness()
  const strong = getStrongAgainst([attacker])
  const weak = getWeakAgainst([attacker])
  const noEffect = getNoEffectAgainst([attacker])

  if (noEffect.includes(defender)) return 0
  if (strong.includes(defender)) return 2
  if (weak.includes(defender)) return 0.5
  return 1
}

/**
 * Get cell color based on effectiveness
 */
function getCellColor(effectiveness: number): string {
  if (effectiveness === 0) return 'bg-gray-300 dark:bg-gray-700'
  if (effectiveness === 2) return 'bg-green-500 dark:bg-green-600'
  if (effectiveness === 0.5) return 'bg-red-500 dark:bg-red-600'
  return 'bg-gray-100 dark:bg-gray-800'
}

/**
 * Get cell text color based on effectiveness
 */
function getCellTextColor(effectiveness: number): string {
  if (effectiveness === 0) return 'text-gray-600 dark:text-gray-400'
  if (effectiveness === 2) return 'text-white'
  if (effectiveness === 0.5) return 'text-white'
  return 'text-gray-600 dark:text-gray-400'
}

/**
 * Get effectiveness label
 */
function getEffectivenessLabel(effectiveness: number): string {
  if (effectiveness === 0) return 'No Effect'
  if (effectiveness === 2) return 'Super Effective'
  if (effectiveness === 0.5) return 'Not Very Effective'
  return 'Normal'
}

/**
 * Handle cell click
 */
function handleCellClick(attacker: PokemonType, defender: PokemonType) {
  selectedAttacker.value = attacker
  selectedDefender.value = defender
}

/**
 * Handle cell hover
 */
function handleCellHover(attacker: PokemonType, defender: PokemonType) {
  hoveredCell.value = { attacker, defender }
}

/**
 * Clear hover state
 */
function clearHover() {
  hoveredCell.value = null
}

/**
 * Clear selection
 */
function clearSelection() {
  selectedAttacker.value = null
  selectedDefender.value = null
}

/**
 * Check if cell is selected
 */
function isCellSelected(attacker: PokemonType, defender: PokemonType): boolean {
  return selectedAttacker.value === attacker && selectedDefender.value === defender
}

/**
 * Check if cell is highlighted (same row or column as hovered)
 */
function isCellHighlighted(attacker: PokemonType, defender: PokemonType): boolean {
  if (!hoveredCell.value) return false
  return hoveredCell.value.attacker === attacker || hoveredCell.value.defender === defender
}

/**
 * Get matchup details for selected types
 */
const matchupDetails = computed(() => {
  if (!selectedAttacker.value || !selectedDefender.value) return null

  const effectiveness = getEffectiveness(selectedAttacker.value, selectedDefender.value)
  const label = getEffectivenessLabel(effectiveness)

  return {
    attacker: selectedAttacker.value,
    defender: selectedDefender.value,
    effectiveness,
    label,
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Type Effectiveness Chart
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Click any cell to see detailed matchup information
      </p>
    </div>

    <!-- Legend -->
    <UiCard
      variant="glass"
      padding="md"
    >
      <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-green-500 dark:bg-green-600" />
          <span class="text-gray-700 dark:text-gray-300 font-medium">Super Effective (2x)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
          <span class="text-gray-700 dark:text-gray-300 font-medium">Normal (1x)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-red-500 dark:bg-red-600" />
          <span class="text-gray-700 dark:text-gray-300 font-medium">Not Very Effective (0.5x)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-gray-300 dark:bg-gray-700" />
          <span class="text-gray-700 dark:text-gray-300 font-medium">No Effect (0x)</span>
        </div>
      </div>
    </UiCard>

    <!-- Type Chart Matrix -->
    <UiCard
      variant="glass"
      padding="sm"
    >
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full">
          <!-- Table -->
          <div
            class="grid"
            style="grid-template-columns: auto repeat(18, minmax(40px, 1fr));"
          >
            <!-- Header Row: Defender Types -->
            <div class="sticky left-0 z-20 bg-white dark:bg-gray-900 p-2" />
            <div
              v-for="defenderType in ALL_TYPES"
              :key="`header-${defenderType}`"
              class="flex items-center justify-center p-2 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-300 dark:border-gray-700"
            >
              <PokemonTypeTag
                :type="defenderType"
                size="sm"
                class="rotate-0 lg:-rotate-45 origin-center whitespace-nowrap"
              />
            </div>

            <!-- Data Rows -->
            <template
              v-for="attackerType in ALL_TYPES"
              :key="`row-${attackerType}`"
            >
              <!-- Row Header: Attacker Type -->
              <div class="sticky left-0 z-10 bg-white dark:bg-gray-900 flex items-center p-2 border-r-2 border-gray-300 dark:border-gray-700">
                <PokemonTypeTag
                  :type="attackerType"
                  size="sm"
                />
              </div>

              <!-- Effectiveness Cells -->
              <div
                v-for="defenderType in ALL_TYPES"
                :key="`cell-${attackerType}-${defenderType}`"
                class="relative group cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:z-30"
                :class="[
                  getCellColor(getEffectiveness(attackerType, defenderType)),
                  isCellSelected(attackerType, defenderType) ? 'ring-4 ring-blue-500 dark:ring-blue-400 z-30 scale-110' : '',
                  isCellHighlighted(attackerType, defenderType) ? 'opacity-100' : hoveredCell ? 'opacity-40' : 'opacity-100',
                ]"
                @click="handleCellClick(attackerType, defenderType)"
                @mouseenter="handleCellHover(attackerType, defenderType)"
                @mouseleave="clearHover"
              >
                <div
                  class="w-full h-full flex items-center justify-center p-2 font-bold text-xs"
                  :class="getCellTextColor(getEffectiveness(attackerType, defenderType))"
                >
                  {{ getEffectiveness(attackerType, defenderType) }}×
                </div>

                <!-- Hover Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                >
                  <div class="font-semibold">
                    {{ getEffectivenessLabel(getEffectiveness(attackerType, defenderType)) }}
                  </div>
                  <div class="text-gray-300">
                    <span class="capitalize">{{ attackerType }}</span>
                    →
                    <span class="capitalize">{{ defenderType }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Matchup Details (shown when cell is selected) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform scale-95"
      enter-to-class="opacity-100 transform scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform scale-100"
      leave-to-class="opacity-0 transform scale-95"
    >
      <UiCard
        v-if="matchupDetails"
        variant="glass"
        padding="lg"
        class="relative"
      >
        <button
          class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          @click="clearSelection"
        >
          <Icon
            icon="ph:x-bold"
            class="w-5 h-5 text-gray-600 dark:text-gray-400"
          />
        </button>

        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Matchup Details
          </h2>

          <!-- Attacker vs Defender -->
          <div class="flex items-center justify-center gap-4 text-lg">
            <PokemonTypeTag
              :type="matchupDetails.attacker"
              size="lg"
              show-icon
            />
            <Icon
              icon="ph:sword-fill"
              class="w-8 h-8 text-gray-400"
            />
            <PokemonTypeTag
              :type="matchupDetails.defender"
              size="lg"
              show-icon
            />
          </div>

          <!-- Effectiveness Badge -->
          <div class="flex justify-center">
            <div
              class="px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg"
              :class="{
                'bg-green-500 dark:bg-green-600': matchupDetails.effectiveness === 2,
                'bg-red-500 dark:bg-red-600': matchupDetails.effectiveness === 0.5,
                'bg-gray-300 dark:bg-gray-700': matchupDetails.effectiveness === 0,
                'bg-gray-500 dark:bg-gray-600': matchupDetails.effectiveness === 1,
              }"
            >
              {{ matchupDetails.label }} ({{ matchupDetails.effectiveness }}×)
            </div>
          </div>

          <!-- Description -->
          <div class="text-center text-gray-600 dark:text-gray-400">
            <template v-if="matchupDetails.effectiveness === 2">
              <Icon
                icon="ph:arrow-up-bold"
                class="inline w-5 h-5 text-green-500"
              />
              <span class="capitalize">{{ matchupDetails.attacker }}</span> type moves deal double damage to
              <span class="capitalize">{{ matchupDetails.defender }}</span> type Pokemon
            </template>
            <template v-else-if="matchupDetails.effectiveness === 0.5">
              <Icon
                icon="ph:arrow-down-bold"
                class="inline w-5 h-5 text-red-500"
              />
              <span class="capitalize">{{ matchupDetails.attacker }}</span> type moves deal half damage to
              <span class="capitalize">{{ matchupDetails.defender }}</span> type Pokemon
            </template>
            <template v-else-if="matchupDetails.effectiveness === 0">
              <Icon
                icon="ph:x-circle-bold"
                class="inline w-5 h-5 text-gray-500"
              />
              <span class="capitalize">{{ matchupDetails.attacker }}</span> type moves have no effect on
              <span class="capitalize">{{ matchupDetails.defender }}</span> type Pokemon
            </template>
            <template v-else>
              <Icon
                icon="ph:minus-bold"
                class="inline w-5 h-5 text-gray-500"
              />
              <span class="capitalize">{{ matchupDetails.attacker }}</span> type moves deal normal damage to
              <span class="capitalize">{{ matchupDetails.defender }}</span> type Pokemon
            </template>
          </div>
        </div>
      </UiCard>
    </Transition>

    <!-- How to Use -->
    <UiCard
      variant="glass"
      padding="lg"
    >
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Icon
          icon="ph:info-fill"
          class="w-6 h-6 text-blue-500"
        />
        How to Use This Chart
      </h3>
      <div class="space-y-2 text-gray-600 dark:text-gray-400">
        <p class="flex items-start gap-2">
          <Icon
            icon="ph:arrow-right-bold"
            class="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500"
          />
          <span><strong>Rows</strong> represent the attacking type (the move type being used)</span>
        </p>
        <p class="flex items-start gap-2">
          <Icon
            icon="ph:arrow-down-bold"
            class="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500"
          />
          <span><strong>Columns</strong> represent the defending type (the target Pokemon's type)</span>
        </p>
        <p class="flex items-start gap-2">
          <Icon
            icon="ph:cursor-click-fill"
            class="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500"
          />
          <span><strong>Click</strong> any cell to see detailed matchup information</span>
        </p>
        <p class="flex items-start gap-2">
          <Icon
            icon="ph:mouse-fill"
            class="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500"
          />
          <span><strong>Hover</strong> over cells to highlight the row and column</span>
        </p>
      </div>
    </UiCard>
  </div>
</template>
