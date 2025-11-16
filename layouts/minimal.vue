<script setup lang="ts">
/**
 * Minimal Layout
 *
 * Simplified layout without header/footer/sidebar
 * Used for auth pages, error pages, or full-screen views
 */

const uiStore = useUIStore()

// Initialize store on mount
onMounted(() => {
  uiStore.initialize()
})

/**
 * Computed layout class
 */
const layoutClass = computed(() => {
  return [
    'min-h-screen',
    'flex',
    'items-center',
    'justify-center',
    'bg-gradient-to-br',
    'from-gray-50',
    'to-gray-100',
    'dark:from-gray-900',
    'dark:to-gray-800',
    'transition-colors',
    'duration-200',
    'p-4',
  ].join(' ')
})
</script>

<template>
  <div :class="layoutClass">
    <!-- Page content (centered) -->
    <slot />

    <!-- Toast Container -->
    <Teleport to="body">
      <div
        class="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        <UiToast
          v-for="toast in uiStore.toasts"
          :id="toast.id"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          :duration="toast.duration"
          class="pointer-events-auto"
          @close="uiStore.removeToast(toast.id)"
        />
      </div>
    </Teleport>

    <!-- Global Loading Overlay -->
    <UiLoading
      v-if="uiStore.globalLoading"
      type="pokeball"
      size="xl"
      :message="uiStore.loadingMessage || 'Loading...'"
      overlay
      fullscreen
    />
  </div>
</template>
