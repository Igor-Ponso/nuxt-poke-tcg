<script setup lang="ts">
/**
 * MoveCard Component
 *
 * Display move information in a card format
 */

import { Icon } from '@iconify/vue';
import type { SimplifiedMove } from '~/types';

interface Props {
  move: SimplifiedMove
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  click: [move: SimplifiedMove]
}>()

/**
 * Card size classes
 */
const cardClass = computed(() => {
  const baseClasses = [
    'group',
    'cursor-pointer',
    'transition-all',
    'duration-300',
    'hover:scale-105',
    'hover:shadow-xl',
  ]

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return [...baseClasses, sizeClasses[props.size]].join(' ')
})

/**
 * Title size classes
 */
const titleClass = computed(() => {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return `font-bold text-gray-900 dark:text-white capitalize ${sizeClasses[props.size]}`
})

/**
 * Format move name for display
 */
const displayName = computed(() => {
  return props.move.name.replace(/-/g, ' ')
})

/**
 * Get category icon and color
 */
const categoryConfig = computed(() => {
  const configs = {
    physical: {
      icon: 'ph:sword-bold',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      label: 'Physical',
    },
    special: {
      icon: 'ph:sparkle-bold',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      label: 'Special',
    },
    status: {
      icon: 'ph:gear-bold',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500',
      label: 'Status',
    },
  }

  return configs[props.move.category]
})

/**
 * Get generation badge color
 */
const generationColor = computed(() => {
  const genNumber = parseInt(props.move.generation.replace(/[^0-9]/g, ''))

  const colors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-yellow-500',
    3: 'bg-emerald-500',
    4: 'bg-blue-500',
    5: 'bg-purple-500',
    6: 'bg-pink-500',
    7: 'bg-orange-500',
    8: 'bg-cyan-500',
    9: 'bg-indigo-500',
  }

  return colors[genNumber] || 'bg-gray-500'
})

/**
 * Handle card click
 */
function handleClick() {
  emit('click', props.move)
}
</script>

<template>
  <UiCard
    variant="glass"
    :padding="size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'"
    :class="cardClass"
    @click="handleClick"
  >
    <div class="space-y-3">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <!-- Title & ID -->
        <div class="flex-1 min-w-0">
          <h3 :class="titleClass">
            {{ displayName }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            #{{ move.id.toString().padStart(4, '0') }}
          </p>
        </div>

        <!-- Generation Badge -->
        <div
          class="flex-shrink-0 px-2 py-1 rounded-md text-xs font-bold text-white"
          :class="generationColor"
        >
          {{ move.generation }}
        </div>
      </div>

      <!-- Type and Category -->
      <div class="flex items-center gap-2 flex-wrap">
        <PokemonTypeTag
          :type="move.type"
          size="sm"
        />
        <div
          class="flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs font-bold"
          :class="categoryConfig.bgColor"
        >
          <Icon
            :icon="categoryConfig.icon"
            class="w-3 h-3"
          />
          <span>{{ categoryConfig.label }}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <!-- Power -->
        <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Power
          </div>
          <div class="font-bold text-gray-900 dark:text-white mt-0.5">
            {{ move.power ?? '—' }}
          </div>
        </div>

        <!-- Accuracy -->
        <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Accuracy
          </div>
          <div class="font-bold text-gray-900 dark:text-white mt-0.5">
            {{ move.accuracy ? `${move.accuracy}%` : '—' }}
          </div>
        </div>

        <!-- PP -->
        <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            PP
          </div>
          <div class="font-bold text-gray-900 dark:text-white mt-0.5">
            {{ move.pp }}
          </div>
        </div>
      </div>

      <!-- Short Effect -->
      <p
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
        :title="move.shortEffect"
      >
        {{ move.shortEffect }}
      </p>

      <!-- Footer Stats -->
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div
          v-if="move.learnedByCount > 0"
          class="flex items-center gap-1"
        >
          <Icon
            icon="ph:pokemon-logo-fill"
            class="w-4 h-4"
          />
          <span>{{ move.learnedByCount }} Pokémon</span>
        </div>
      </div>
    </div>
  </UiCard>
</template>
