/**
 * Card Visibility Composable
 *
 * Manages card visibility state to optimize performance by:
 * - Disabling expensive effects (3D, holographic) when card is off-screen
 * - Using IntersectionObserver with larger margins for smoother transitions
 * - Providing consistent visibility state across all card effects
 *
 * This prevents 250+ cards from running animations simultaneously
 */

import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'

export interface CardVisibilityOptions {
  /**
   * Root margin for IntersectionObserver
   * Default: '300px' - Start loading effects 300px before visible
   */
  rootMargin?: string

  /**
   * Threshold for visibility (0-1)
   * Default: 0.01 - Consider visible when 1% is showing
   */
  threshold?: number

  /**
   * Delay before disabling effects when card goes off-screen
   * Default: 200ms - Prevents flickering during fast scrolling
   */
  disableDelay?: number
}

export function useCardVisibility(
  elementRef: Ref<HTMLElement | null>,
  options: CardVisibilityOptions = {},
) {
  const {
    rootMargin = '300px',
    threshold = 0.01,
    disableDelay = 200,
  } = options

  // Visibility states
  const isInViewport = ref(false) // Is card currently in viewport
  const shouldRenderEffects = ref(false) // Should expensive effects be active

  let observer: IntersectionObserver | null = null
  let disableTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Handle intersection changes
   */
  function handleIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]
    if (entry?.isIntersecting) {
      // Card is entering viewport
      isInViewport.value = true

      // Clear any pending disable timeout
      if (disableTimeout) {
        clearTimeout(disableTimeout)
        disableTimeout = null
      }

      // Enable effects immediately for smooth appearance
      shouldRenderEffects.value = true
    }
    else {
      // Card is leaving viewport
      isInViewport.value = false

      // Delay disabling effects to prevent flickering during fast scrolling
      if (disableTimeout) clearTimeout(disableTimeout)

      disableTimeout = setTimeout(() => {
        shouldRenderEffects.value = false
      }, disableDelay)
    }
  }

  /**
   * Setup observer
   */
  function setupObserver() {
    if (!elementRef.value) return

    observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    })

    observer.observe(elementRef.value)
  }

  /**
   * Cleanup observer
   */
  function cleanup() {
    if (observer) {
      observer.disconnect()
      observer = null
    }

    if (disableTimeout) {
      clearTimeout(disableTimeout)
      disableTimeout = null
    }
  }

  // Lifecycle
  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isInViewport,
    shouldRenderEffects,
    cleanup,
    setupObserver,
  }
}
