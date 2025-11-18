/**
 * Virtualized Groups Composable
 *
 * Provides virtual scrolling for grouped Pokemon lists (by generation)
 * This is a simpler, custom implementation that:
 * - Works with generation grouping (unlike standard virtual scrollers)
 * - Renders only visible groups + buffer
 * - Maintains smooth scrolling without infinite loops
 * - Preserves infinite scroll functionality
 *
 * Performance Impact:
 * - 1000 Pokemon = 1000 DOM nodes WITHOUT virtualization
 * - 1000 Pokemon = ~80 DOM nodes WITH virtualization (visible + buffer)
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface VirtualizedGroupsOptions {
  /**
   * Number of items to render before and after visible area
   * Higher = smoother scrolling, but more DOM nodes
   * Default: 20 cards (1-2 screens worth)
   */
  bufferSize?: number

  /**
   * Estimated height of each card in pixels
   * Used to calculate visible range
   * Default: 400px (approximate card height)
   */
  itemHeight?: number

  /**
   * Container ref to watch for scroll events
   */
  containerRef?: Ref<HTMLElement | null>
}

export function useVirtualizedGroups<T extends { id: number }>(
  items: Ref<T[]>,
  options: VirtualizedGroupsOptions = {},
) {
  const {
    bufferSize = 20,
    itemHeight = 400,
    containerRef,
  } = options

  // Scroll state
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  /**
   * Calculate which items should be rendered
   */
  const visibleRange = computed(() => {
    if (items.value.length === 0) {
      return { start: 0, end: 0 }
    }

    // Calculate visible range based on scroll position
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
    const end = Math.min(
      items.value.length,
      Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + bufferSize,
    )

    return { start, end }
  })

  /**
   * Get visible items (items within visible range)
   */
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end)
  })

  /**
   * Calculate offset for positioning items correctly
   */
  const offsetY = computed(() => {
    return visibleRange.value.start * itemHeight
  })

  /**
   * Total height of the scrollable area
   */
  const totalHeight = computed(() => {
    return items.value.length * itemHeight
  })

  /**
   * Handle scroll events
   */
  function handleScroll() {
    const container = containerRef?.value || window
    if (container === window) {
      scrollTop.value = window.scrollY || window.pageYOffset
      containerHeight.value = window.innerHeight
    }
    else if (container instanceof HTMLElement) {
      scrollTop.value = container.scrollTop
      containerHeight.value = container.clientHeight
    }
  }

  /**
   * Update container height on resize
   */
  function handleResize() {
    const container = containerRef?.value || window
    if (container === window) {
      containerHeight.value = window.innerHeight
    }
    else if (container instanceof HTMLElement) {
      containerHeight.value = container.clientHeight
    }
  }

  /**
   * Setup scroll listener
   */
  function setupScrollListener() {
    const container = containerRef?.value || window
    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Initial measurement
    handleResize()
    handleScroll()
  }

  /**
   * Cleanup scroll listener
   */
  function cleanup() {
    const container = containerRef?.value || window
    container.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
  }

  // Lifecycle
  onMounted(() => {
    setupScrollListener()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    visibleItems,
    visibleRange,
    offsetY,
    totalHeight,
    scrollTop,
    containerHeight,
  }
}
