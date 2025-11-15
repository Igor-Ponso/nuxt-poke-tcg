<script setup lang="ts">
/**
 * UiToast Component
 *
 * Toast notification component with multiple types and auto-dismiss
 * Works with the UI store for global toast management
 */

export interface UiToastProps {
  id?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  closable?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const props = withDefaults(defineProps<UiToastProps>(), {
  type: 'info',
  duration: 3000,
  closable: true,
  position: 'top-right',
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)
const progressWidth = ref(100)
let timeoutId: NodeJS.Timeout | null = null
let intervalId: NodeJS.Timeout | null = null

/**
 * Toast icon based on type
 */
const toastIcon = computed(() => {
  const icons = {
    success: `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `,
    error: `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `,
    warning: `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    `,
    info: `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `,
  }
  return icons[props.type]
})

/**
 * Computed class for toast
 */
const toastClass = computed(() => {
  const baseClasses = [
    'flex',
    'items-start',
    'gap-3',
    'p-4',
    'rounded-xl',
    'shadow-lg',
    'backdrop-blur-md',
    'border',
    'min-w-[300px]',
    'max-w-md',
    'transform',
    'transition-all',
    'duration-300',
  ]

  // Type-specific colors
  const typeClasses = {
    success: [
      'bg-green-50/90',
      'dark:bg-green-900/90',
      'border-green-500',
      'text-green-800',
      'dark:text-green-200',
    ],
    error: [
      'bg-red-50/90',
      'dark:bg-red-900/90',
      'border-red-500',
      'text-red-800',
      'dark:text-red-200',
    ],
    warning: [
      'bg-yellow-50/90',
      'dark:bg-yellow-900/90',
      'border-yellow-500',
      'text-yellow-800',
      'dark:text-yellow-200',
    ],
    info: [
      'bg-blue-50/90',
      'dark:bg-blue-900/90',
      'border-blue-500',
      'text-blue-800',
      'dark:text-blue-200',
    ],
  }

  return [...baseClasses, ...typeClasses[props.type]].join(' ')
})

/**
 * Computed class for icon
 */
const iconClass = computed(() => {
  const typeClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }
  return `flex-shrink-0 ${typeClasses[props.type]}`
})

/**
 * Computed class for progress bar
 */
const progressClass = computed(() => {
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }
  return `h-1 transition-all duration-100 ease-linear ${typeClasses[props.type]}`
})

/**
 * Close toast
 */
function close() {
  isVisible.value = false
  if (timeoutId) clearTimeout(timeoutId)
  if (intervalId) clearInterval(intervalId)

  // Wait for animation to complete
  setTimeout(() => {
    emit('close')
  }, 300)
}

/**
 * Auto-dismiss toast (client-only to prevent hydration mismatch)
 */
function startAutoDismiss() {
  if (import.meta.client && props.duration > 0) {
    const startTime = Date.now()
    const updateInterval = 50

    // Update progress bar
    intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, props.duration - elapsed)
      progressWidth.value = (remaining / props.duration) * 100
    }, updateInterval)

    // Auto-close
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// Start auto-dismiss on mount (client-only)
onMounted(() => {
  if (import.meta.client) {
    startAutoDismiss()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <Transition
    name="toast"
    @after-leave="$emit('close')"
  >
    <div
      v-if="isVisible"
      :class="toastClass"
      role="alert"
      aria-live="polite"
    >
      <!-- Icon -->
      <div :class="iconClass" v-html="toastIcon" />

      <!-- Message -->
      <div class="flex-1 text-sm font-medium">
        {{ message }}
      </div>

      <!-- Close button -->
      <button
        v-if="closable"
        type="button"
        class="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Close notification"
        @click="close"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Progress bar -->
      <div
        v-if="duration > 0"
        class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-xl overflow-hidden"
      >
        <div
          :class="progressClass"
          :style="{ width: `${progressWidth}%` }"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
