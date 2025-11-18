/**
 * Virtual Grid Composable
 *
 * High-performance virtual scrolling for grid layouts with infinite scroll support
 * Optimized for Pokemon cards, TCG cards, moves, and abilities
 *
 * Key Features:
 * - Only renders visible items + buffer (massive DOM reduction)
 * - Supports responsive grid layouts (1-5 columns)
 * - Integrates seamlessly with infinite scroll
 * - Preserves scroll position during updates
 * - Automatic height calculation and adjustment
 * - Memory efficient with configurable buffer size
 *
 * Performance Impact:
 * - WITHOUT virtualization: 1000 cards = 1000 DOM nodes = LAG
 * - WITH virtualization: 1000 cards = ~50 DOM nodes = SMOOTH
 *
 * Based on @vueuse/core useVirtualList with grid enhancements
 */

import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export interface VirtualGridOptions {
  /**
   * Estimated height of each item in pixels
   * This should match your card height
   * Default: 400px (typical Pokemon card height)
   */
  itemHeight?: number

  /**
   * Gap between items in pixels
   * Should match your grid gap in Tailwind (gap-4 = 16px, gap-6 = 24px)
   * Default: 24px (gap-6)
   */
  gap?: number

  /**
   * Number of items to render above and below visible area
   * Higher = smoother scrolling, more DOM nodes
   * Lower = better performance, possible flickering
   * Default: 2 rows worth of items
   */
  overscan?: number

  /**
   * Responsive columns configuration
   * Matches Tailwind breakpoints
   */
  columns?: {
    'default': number // Mobile (< 640px)
    'sm'?: number // >= 640px
    'md'?: number // >= 768px
    'lg'?: number // >= 1024px
    'xl'?: number // >= 1280px
    '2xl'?: number // >= 1536px
  }

  /**
   * Enable debug logging
   * Default: false
   */
  debug?: boolean
}

export interface VirtualGridItem<T> {
  data: T
  index: number
}

export interface VirtualGridReturn<T> {
  /**
   * Items to render (only visible items + buffer)
   */
  virtualItems: ComputedRef<VirtualGridItem<T>[]>

  /**
   * Container props to bind to scrollable container
   * Usage: <div v-bind="containerProps">
   */
  containerProps: ComputedRef<{
    onScroll: (e: Event) => void
    style: {
      overflowY: string
    }
  }>

  /**
   * Wrapper props to bind to inner wrapper
   * Creates the total scrollable height
   * Usage: <div v-bind="wrapperProps">
   */
  wrapperProps: ComputedRef<{
    style: CSSProperties
  }>

  /**
   * Content props to bind to actual content container
   * Handles positioning of visible items
   * Usage: <div v-bind="contentProps">
   */
  contentProps: ComputedRef<{
    style: CSSProperties
  }>

  /**
   * Scroll to specific index
   */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void

  /**
   * Current scroll position
   */
  scrollTop: Ref<number>

  /**
   * Total height of all items
   */
  totalHeight: ComputedRef<number>

  /**
   * Number of visible rows
   */
  visibleRows: ComputedRef<number>

  /**
   * Current number of columns
   */
  currentColumns: Ref<number>

  /**
   * Manually trigger recalculation
   * Useful when items change size
   */
  recalculate: () => void
}

/**
 * Create a virtual grid with high performance
 */
export function useVirtualGrid<T = any>(
  items: Ref<T[]>,
  options: VirtualGridOptions = {},
): VirtualGridReturn<T> {
  const {
    itemHeight = 400,
    gap = 24,
    overscan = 2,
    columns = { default: 1, sm: 2, lg: 3, xl: 4 },
    debug = false,
  } = options

  // State
  const scrollTop = ref(0)
  const containerHeight = ref(0)
  const currentColumns = ref(columns.default)

  /**
   * Calculate current number of columns based on window width
   */
  function calculateColumns() {
    if (typeof window === 'undefined') return columns.default

    const width = window.innerWidth

    if (columns['2xl'] && width >= 1536) return columns['2xl']
    if (columns.xl && width >= 1280) return columns.xl
    if (columns.lg && width >= 1024) return columns.lg
    if (columns.md && width >= 768) return columns.md
    if (columns.sm && width >= 640) return columns.sm

    return columns.default
  }

  /**
   * Update columns on resize
   */
  function handleResize() {
    const newColumns = calculateColumns()
    if (newColumns !== currentColumns.value) {
      currentColumns.value = newColumns
      if (debug) {
        console.log('[VirtualGrid] Columns changed:', newColumns)
      }
    }

    // Update container height
    if (typeof window !== 'undefined') {
      containerHeight.value = window.innerHeight
    }
  }

  /**
   * Total number of rows needed
   */
  const totalRows = computed(() => {
    return Math.ceil(items.value.length / currentColumns.value)
  })

  /**
   * Height of a single row (item height + gap)
   */
  const rowHeight = computed(() => itemHeight + gap)

  /**
   * Total height of all rows
   */
  const totalHeight = computed(() => {
    return totalRows.value * rowHeight.value
  })

  /**
   * Calculate which rows are visible
   */
  const visibleRange = computed(() => {
    const scrollValue = scrollTop.value
    const containerHeightValue = containerHeight.value

    // Calculate visible rows
    const startRow = Math.floor(scrollValue / rowHeight.value)
    const endRow = Math.ceil((scrollValue + containerHeightValue) / rowHeight.value)

    // Add overscan (buffer above and below)
    const overscanRows = overscan
    const bufferedStartRow = Math.max(0, startRow - overscanRows)
    const bufferedEndRow = Math.min(totalRows.value, endRow + overscanRows)

    if (debug) {
      console.log('[VirtualGrid] Visible range:', {
        startRow,
        endRow,
        bufferedStartRow,
        bufferedEndRow,
        totalRows: totalRows.value,
      })
    }

    return {
      startRow: bufferedStartRow,
      endRow: bufferedEndRow,
    }
  })

  /**
   * Visible items (only items in visible rows + buffer)
   */
  const virtualItems = computed<VirtualGridItem<T>[]>(() => {
    const { startRow, endRow } = visibleRange.value
    const cols = currentColumns.value

    const startIndex = startRow * cols
    const endIndex = Math.min(endRow * cols, items.value.length)

    const result: VirtualGridItem<T>[] = []

    for (let i = startIndex; i < endIndex; i++) {
      const item = items.value[i]
      if (item !== undefined) {
        result.push({
          data: item,
          index: i,
        })
      }
    }

    if (debug) {
      console.log('[VirtualGrid] Rendering items:', result.length, 'of', items.value.length)
    }

    return result
  })

  /**
   * Offset for positioning visible items
   */
  const offsetY = computed(() => {
    return visibleRange.value.startRow * rowHeight.value
  })

  /**
   * Number of visible rows
   */
  const visibleRows = computed(() => {
    return visibleRange.value.endRow - visibleRange.value.startRow
  })

  /**
   * Handle scroll events
   */
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement
    if (target) {
      scrollTop.value = target.scrollTop
    }
  }

  /**
   * Scroll to specific index
   */
  function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
    const row = Math.floor(index / currentColumns.value)
    const targetScrollTop = row * rowHeight.value

    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({
        top: targetScrollTop,
        behavior,
      })
    }
  }

  /**
   * Manually trigger recalculation
   */
  function recalculate() {
    handleResize()
    nextTick(() => {
      if (debug) {
        console.log('[VirtualGrid] Recalculated')
      }
    })
  }

  /**
   * Container props
   */
  const containerProps = computed(() => ({
    onScroll: handleScroll,
    style: {
      overflowY: 'auto' as const,
    },
  }))

  /**
   * Wrapper props (creates total scrollable height)
   */
  const wrapperProps = computed<{ style: CSSProperties }>(() => ({
    style: {
      height: `${totalHeight.value}px`,
      position: 'relative' as const,
      width: '100%',
    },
  }))

  /**
   * Content props (positions visible items)
   */
  const contentProps = computed<{ style: CSSProperties }>(() => ({
    style: {
      transform: `translateY(${offsetY.value}px)`,
      position: 'absolute' as const,
      width: '100%',
    },
  }))

  // Lifecycle
  onMounted(() => {
    handleResize()

    // Setup resize listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true })

      // Setup scroll listener if using window scroll
      window.addEventListener('scroll', () => {
        scrollTop.value = window.scrollY || window.pageYOffset
      }, { passive: true })

      // Initial scroll position
      scrollTop.value = window.scrollY || window.pageYOffset
      containerHeight.value = window.innerHeight
    }

    if (debug) {
      console.log('[VirtualGrid] Mounted with options:', {
        itemHeight,
        gap,
        overscan,
        columns,
      })
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  // Watch for items changes and recalculate
  watch(() => items.value.length, () => {
    nextTick(() => {
      recalculate()
    })
  })

  return {
    virtualItems,
    containerProps,
    wrapperProps,
    contentProps,
    scrollToIndex,
    scrollTop,
    totalHeight,
    visibleRows,
    currentColumns,
    recalculate,
  }
}
