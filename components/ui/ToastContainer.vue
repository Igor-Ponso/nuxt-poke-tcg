<script setup lang="ts">
/**
 * Toast Container Component
 *
 * Global container for all toast notifications
 * Positioned at top-right of screen
 */

const { toasts, removeToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="toast-container fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @remove="removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* TransitionGroup animations */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

/* Move animation for other toasts when one is removed */
.toast-move {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Responsive positioning */
@media (max-width: 640px) {
  .toast-container {
    @apply bottom-2 right-2 left-2;
    @apply max-w-full;
  }
}
</style>
