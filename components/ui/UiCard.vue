<script setup lang="ts">
/**
 * UiCard Component
 *
 * Reusable card component with glassmorphism effect
 * Supports different variants, hover effects, and interactive states
 */

export interface UiCardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
  loading?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  gradient?: boolean
  gradientFrom?: string
  gradientTo?: string
}

const props = withDefaults(defineProps<UiCardProps>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  clickable: false,
  selected: false,
  disabled: false,
  loading: false,
  rounded: 'xl',
  gradient: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()

/**
 * Computed class for card container
 */
const cardClass = computed(() => {
  const baseClasses = [
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-200',
  ]

  // Rounded
  const roundedClasses = {
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }
  baseClasses.push(roundedClasses[props.rounded])

  // Padding
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  if (props.padding !== 'none') {
    baseClasses.push(paddingClasses[props.padding])
  }

  // Variant
  const variantClasses = {
    default: [
      'bg-white',
      'dark:bg-gray-800',
      'border',
      'border-gray-200',
      'dark:border-gray-700',
    ],
    outlined: [
      'bg-transparent',
      'border-2',
      'border-gray-300',
      'dark:border-gray-600',
    ],
    elevated: [
      'bg-white',
      'dark:bg-gray-800',
      'shadow-lg',
      'border',
      'border-gray-100',
      'dark:border-gray-700',
    ],
    glass: [
      'bg-white/30',
      'dark:bg-gray-800/30',
      'backdrop-blur-md',
      'border',
      'border-white/20',
      'dark:border-gray-700/50',
    ],
    flat: [
      'bg-gray-100',
      'dark:bg-gray-800',
    ],
  }
  baseClasses.push(...variantClasses[props.variant])

  // Hoverable
  if (props.hoverable && !props.disabled) {
    baseClasses.push(
      'hover:shadow-xl',
      'hover:scale-[1.02]',
      'hover:border-gray-300',
      'dark:hover:border-gray-600',
    )
  }

  // Clickable
  if (props.clickable && !props.disabled) {
    baseClasses.push('cursor-pointer', 'active:scale-[0.98]')
  }

  // Selected
  if (props.selected) {
    baseClasses.push(
      'ring-2',
      'ring-blue-500',
      'border-blue-500',
      'dark:border-blue-500',
    )
  }

  // Disabled
  if (props.disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed')
  }

  return baseClasses.join(' ')
})

/**
 * Computed style for gradient
 */
const cardStyle = computed(() => {
  if (!props.gradient) return {}

  const from = props.gradientFrom || '#3b82f6'
  const to = props.gradientTo || '#8b5cf6'

  return {
    background: `linear-gradient(135deg, ${from}, ${to})`,
  }
})

/**
 * Handle click event
 */
function handleClick(event: MouseEvent | KeyboardEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="cardClass"
    :style="cardStyle"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
    >
      <div
        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      />
    </div>

    <!-- Header slot -->
    <div
      v-if="$slots.header"
      class="mb-4"
    >
      <slot name="header" />
    </div>

    <!-- Default content -->
    <div>
      <slot />
    </div>

    <!-- Footer slot -->
    <div
      v-if="$slots.footer"
      class="mt-4"
    >
      <slot name="footer" />
    </div>

    <!-- Gradient overlay for glassmorphism effect -->
    <div
      v-if="variant === 'glass'"
      class="absolute inset-0 -z-10 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
    />
  </div>
</template>
