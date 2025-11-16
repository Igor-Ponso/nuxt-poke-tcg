<script setup lang="ts">
/**
 * UiLoading Component
 *
 * Loading spinner/skeleton component with multiple variants
 * Can be used as inline spinner or full-page overlay
 */

export interface UiLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'pokeball'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  overlay?: boolean
  fullscreen?: boolean
  message?: string
  color?: string
}

const props = withDefaults(defineProps<UiLoadingProps>(), {
  type: 'spinner',
  size: 'md',
  overlay: false,
  fullscreen: false,
  color: 'blue',
})

/**
 * Computed class for container
 */
const containerClass = computed(() => {
  const baseClasses = ['flex', 'flex-col', 'items-center', 'justify-center', 'gap-4']

  if (props.overlay || props.fullscreen) {
    baseClasses.push(
      'fixed',
      'inset-0',
      'z-50',
      'bg-white/80',
      'dark:bg-gray-900/80',
      'backdrop-blur-sm',
    )
  }

  return baseClasses.join(' ')
})

/**
 * Computed class for spinner
 */
const spinnerClass = computed(() => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  }

  const colorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    yellow: 'border-yellow-500 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    pink: 'border-pink-500 border-t-transparent',
  }

  return [
    'rounded-full',
    'animate-spin',
    sizeClasses[props.size],
    colorClasses[props.color as keyof typeof colorClasses] || colorClasses.blue,
  ].join(' ')
})

/**
 * Computed class for dots
 */
const dotClass = computed(() => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  }

  return [
    'rounded-full',
    sizeClasses[props.size],
    colorClasses[props.color as keyof typeof colorClasses] || colorClasses.blue,
  ].join(' ')
})

/**
 * Computed class for pulse
 */
const pulseClass = computed(() => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  }

  return [
    'rounded-full',
    'animate-pulse',
    sizeClasses[props.size],
    colorClasses[props.color as keyof typeof colorClasses] || colorClasses.blue,
  ].join(' ')
})

/**
 * Computed size for Pokeball
 */
const pokeballSize = computed(() => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  }
  return sizes[props.size]
})
</script>

<template>
  <div :class="containerClass">
    <!-- Spinner type -->
    <div
      v-if="type === 'spinner'"
      :class="spinnerClass"
    />

    <!-- Dots type -->
    <div
      v-else-if="type === 'dots'"
      class="flex gap-2"
    >
      <div
        :class="dotClass"
        class="animate-bounce"
        style="animation-delay: 0ms"
      />
      <div
        :class="dotClass"
        class="animate-bounce"
        style="animation-delay: 150ms"
      />
      <div
        :class="dotClass"
        class="animate-bounce"
        style="animation-delay: 300ms"
      />
    </div>

    <!-- Pulse type -->
    <div
      v-else-if="type === 'pulse'"
      :class="pulseClass"
    />

    <!-- Pokeball type -->
    <div
      v-else-if="type === 'pokeball'"
      class="relative animate-spin"
      :style="{ width: `${pokeballSize}px`, height: `${pokeballSize}px` }"
    >
      <!-- Pokeball SVG -->
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Top half (red) -->
        <path
          d="M50 5 C 23 5, 5 23, 5 50 L 5 45 C 5 23, 23 5, 50 5 Z"
          fill="#EF4444"
        />
        <path
          d="M50 5 C 77 5, 95 23, 95 50 L 95 45 C 95 23, 77 5, 50 5 Z"
          fill="#EF4444"
        />

        <!-- Bottom half (white) -->
        <path
          d="M50 95 C 23 95, 5 77, 5 50 L 5 55 C 5 77, 23 95, 50 95 Z"
          fill="#F3F4F6"
        />
        <path
          d="M50 95 C 77 95, 95 77, 95 50 L 95 55 C 95 77, 77 95, 50 95 Z"
          fill="#F3F4F6"
        />

        <!-- Middle band (black) -->
        <rect
          x="5"
          y="45"
          width="90"
          height="10"
          fill="#1F2937"
        />

        <!-- Center circle (white) -->
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="#F3F4F6"
          stroke="#1F2937"
          stroke-width="3"
        />

        <!-- Center circle inner (white) -->
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="white"
          stroke="#1F2937"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- Loading message -->
    <p
      v-if="message"
      class="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
