<script setup lang="ts">
/**
 * Toast Notification Component
 *
 * Individual toast notification with auto-dismiss and animations
 */

import { Icon } from '@iconify/vue'
import type { Toast } from '~/composables/useToast'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

// Auto-close handler
function handleClose() {
  emit('remove', props.toast.id)
}

// Style classes based on toast type
const typeClasses = computed(() => {
  const classes: Record<string, string> = {
    success: 'bg-green-500 dark:bg-green-600 text-white',
    error: 'bg-red-500 dark:bg-red-600 text-white',
    warning: 'bg-yellow-500 dark:bg-yellow-600 text-white',
    info: 'bg-blue-500 dark:bg-blue-600 text-white',
  }
  return classes[props.toast.type] || classes.info
})
</script>

<template>
  <div
    class="toast-item pointer-events-auto"
    :class="typeClasses"
  >
    <div class="flex items-start gap-3 min-w-0">
      <!-- Icon -->
      <Icon
        v-if="toast.icon"
        :icon="toast.icon"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
      />

      <!-- Message -->
      <p class="flex-1 text-sm font-medium leading-5 min-w-0 break-words">
        {{ toast.message }}
      </p>

      <!-- Close Button -->
      <button
        type="button"
        class="flex-shrink-0 hover:opacity-80 transition-opacity"
        @click="handleClose"
      >
        <Icon
          icon="ph:x-bold"
          class="w-4 h-4"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-item {
  @apply w-full max-w-sm;
  @apply px-4 py-3;
  @apply rounded-lg;
  @apply shadow-lg;
  @apply backdrop-blur-sm;
  @apply border border-white/20;
  animation: toast-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Exit animation handled by Vue Transition */
.toast-exit-active {
  animation: toast-exit 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}
</style>
