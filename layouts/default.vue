<script setup lang="ts">
/**
 * Default Layout
 *
 * Main layout with header and footer
 * Includes toast container and modal portal
 */

const uiStore = useUIStore()

// Initialize stores on mount
onMounted(() => {
  uiStore.initialize()
})

/**
 * Computed layout class based on responsive state
 */
const layoutClass = computed(() => {
  return [
    'min-h-screen',
    'flex',
    'flex-col',
    'relative',
    'overflow-hidden',
    'transition-colors',
    'duration-200',
  ].join(' ')
})

/**
 * Main content class with sidebar spacing
 */
const mainClass = computed(() => {
  return [
    'flex-1',
    'flex',
    'flex-col',
    'transition-all',
    'duration-300',
  ].join(' ')
})
</script>

<template>
  <div
    :class="layoutClass"
    class="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"
  >
    <!-- Animated Background (Client-only to prevent hydration mismatch) -->
    <ClientOnly>
      <div class="fixed inset-0 z-0 pointer-events-none">
        <!-- Animated gradient orbs -->
        <div class="absolute top-0 -left-40 w-80 h-80 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" />
        <div class="absolute top-0 -right-40 w-80 h-80 bg-yellow-400 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div class="absolute -bottom-40 left-20 w-80 h-80 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        <div class="absolute bottom-0 right-20 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-6000" />

        <!-- Subtle pattern overlay -->
        <div
          class="absolute inset-0 opacity-5 dark:opacity-10"
          style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23000000&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />
      </div>
    </ClientOnly>

    <!-- Content wrapper with backdrop -->
    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Header -->
      <AppHeader />

      <!-- Main content area -->
      <main :class="mainClass">
        <div class="container mx-auto px-4 py-6 max-w-7xl">
          <!-- Page content -->
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Toast Container (Client-only to prevent hydration mismatch) -->
    <ClientOnly>
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
    </ClientOnly>

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
