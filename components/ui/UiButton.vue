<script setup lang="ts">
/**
 * UiButton Component
 *
 * Reusable button component with multiple variants and states
 * Follows glassmorphism design pattern from architecture
 */

export interface UiButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const props = withDefaults(defineProps<UiButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/**
 * Computed class based on variant and size
 */
const buttonClass = computed(() => {
  const baseClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'rounded-xl',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-gradient-to-r',
      'from-blue-500',
      'to-purple-500',
      'text-white',
      'shadow-lg',
      'hover:shadow-xl',
      'hover:scale-105',
      'focus:ring-blue-500',
    ],
    secondary: [
      'bg-white/10',
      'backdrop-blur-md',
      'border',
      'border-white/20',
      'text-gray-900',
      'dark:text-white',
      'hover:bg-white/20',
      'hover:border-white/30',
      'focus:ring-gray-500',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'dark:text-gray-300',
      'hover:bg-white/10',
      'hover:backdrop-blur-md',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-gradient-to-r',
      'from-red-500',
      'to-pink-500',
      'text-white',
      'shadow-lg',
      'hover:shadow-xl',
      'hover:scale-105',
      'focus:ring-red-500',
    ],
    success: [
      'bg-gradient-to-r',
      'from-green-500',
      'to-emerald-500',
      'text-white',
      'shadow-lg',
      'hover:shadow-xl',
      'hover:scale-105',
      'focus:ring-green-500',
    ],
  }

  // Full width
  const widthClass = props.fullWidth ? 'w-full' : ''

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    widthClass,
  ].join(' ')
})

/**
 * Handle click event
 */
function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span
      v-if="loading"
      class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
      aria-hidden="true"
    />

    <!-- Icon (left) -->
    <span
      v-if="icon && iconPosition === 'left' && !loading"
      class="inline-flex"
      aria-hidden="true"
    >
      <slot name="icon-left">
        {{ icon }}
      </slot>
    </span>

    <!-- Button content -->
    <span
      v-if="!loading || $slots.default"
      class="inline-flex items-center"
    >
      <slot />
    </span>

    <!-- Icon (right) -->
    <span
      v-if="icon && iconPosition === 'right' && !loading"
      class="inline-flex"
      aria-hidden="true"
    >
      <slot name="icon-right">
        {{ icon }}
      </slot>
    </span>
  </button>
</template>
