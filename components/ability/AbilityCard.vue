<script setup lang="ts">
/**
 * AbilityCard Component
 *
 * Display ability information in a card format
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedAbility } from '~/types'

interface Props {
  ability: SimplifiedAbility
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  click: [ability: SimplifiedAbility]
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
 * Format ability name for display
 */
const displayName = computed(() => {
  return props.ability.name.replace(/-/g, ' ')
})

/**
 * Get generation badge color
 */
const generationColor = computed(() => {
  const genNumber = parseInt(props.ability.generation.replace(/[^0-9]/g, ''))

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
  emit('click', props.ability)
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
            #{{ ability.id.toString().padStart(4, '0') }}
          </p>
        </div>

        <!-- Generation Badge -->
        <div
          class="flex-shrink-0 px-2 py-1 rounded-md text-xs font-bold text-white"
          :class="generationColor"
        >
          {{ ability.generation }}
        </div>
      </div>

      <!-- Short Effect -->
      <p
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
        :title="ability.shortEffect"
      >
        {{ ability.shortEffect }}
      </p>

      <!-- Footer Stats -->
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div
          v-if="ability.pokemonCount > 0"
          class="flex items-center gap-1"
        >
          <Icon
            icon="ph:pokemon-logo-fill"
            class="w-4 h-4"
          />
          <span>{{ ability.pokemonCount }} Pokémon</span>
        </div>

        <div
          v-if="ability.isMainSeries"
          class="flex items-center gap-1 ml-auto"
        >
          <Icon
            icon="ph:star-fill"
            class="w-4 h-4 text-yellow-500"
          />
          <span>Main Series</span>
        </div>
      </div>
    </div>
  </UiCard>
</template>
