<script setup lang="ts">
/**
 * PokemonTypeTag Component
 *
 * Displays a Pokemon type badge with proper colors
 * Supports both single and dual-type displays
 */

import { Icon } from '@iconify/vue'
import type { PokemonType } from '~/types'

export interface PokemonTypeTagProps {
  type: PokemonType
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outlined' | 'minimal'
  clickable?: boolean
  showIcon?: boolean
}

const props = withDefaults(defineProps<PokemonTypeTagProps>(), {
  size: 'md',
  variant: 'filled',
  clickable: false,
  showIcon: false,
})

const emit = defineEmits<{
  click: [type: PokemonType]
}>()

/**
 * Get type colors
 */
const typeColors = computed(() => {
  return TYPE_COLORS[props.type] || { light: '#A8A878', dark: '#6D6D4E' }
})

/**
 * Computed class for tag
 */
const tagClass = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'gap-1.5',
    'font-semibold',
    'rounded-full',
    'transition-all',
    'duration-200',
    'capitalize',
  ]

  // Size
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }
  baseClasses.push(sizeClasses[props.size])

  // Variant
  if (props.variant === 'filled') {
    baseClasses.push('text-white', 'shadow-sm')
  }
  else if (props.variant === 'outlined') {
    baseClasses.push('bg-transparent', 'border-2')
  }
  else if (props.variant === 'minimal') {
    baseClasses.push('bg-opacity-20')
  }

  // Clickable
  if (props.clickable) {
    baseClasses.push(
      'cursor-pointer',
      'hover:scale-110',
      'hover:shadow-md',
      'active:scale-95',
    )
  }

  return baseClasses.join(' ')
})

/**
 * Computed style for tag
 */
const tagStyle = computed(() => {
  const { light, dark } = typeColors.value

  if (props.variant === 'filled') {
    return {
      background: `linear-gradient(135deg, ${light}, ${dark})`,
    }
  }
  else if (props.variant === 'outlined') {
    return {
      borderColor: dark,
      color: dark,
    }
  }
  else if (props.variant === 'minimal') {
    return {
      backgroundColor: `${light}33`, // 20% opacity
      color: dark,
    }
  }

  return {}
})

/**
 * Type icon (Phosphor Icons representation)
 */
const typeIcon = computed(() => {
  const icons: Record<PokemonType, string> = {
    normal: 'ph:circle',
    fire: 'ph:flame',
    water: 'ph:drop',
    electric: 'ph:lightning',
    grass: 'ph:leaf',
    ice: 'ph:snowflake',
    fighting: 'ph:fist',
    poison: 'ph:skull',
    ground: 'ph:globe',
    flying: 'ph:bird',
    psychic: 'ph:eye',
    bug: 'ph:bug',
    rock: 'ph:mountains',
    ghost: 'ph:ghost',
    dragon: 'ph:dragon',
    dark: 'ph:moon',
    steel: 'ph:gear',
    fairy: 'ph:sparkle',
  }
  return icons[props.type] || 'ph:question'
})

/**
 * Handle click
 */
function handleClick() {
  if (props.clickable) {
    emit('click', props.type)
  }
}
</script>

<template>
  <span
    :class="tagClass"
    :style="tagStyle"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Type icon -->
    <Icon
      v-if="showIcon"
      :icon="typeIcon"
      class="w-4 h-4"
      aria-hidden="true"
    />

    <!-- Type name -->
    <span>{{ type }}</span>
  </span>
</template>
