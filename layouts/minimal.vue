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
