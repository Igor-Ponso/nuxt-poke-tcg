/**
 * 3D Card Effect Composable
 *
 * Implements the 3D tilt effect for Pokemon cards
 * Based on mouse movement with spring physics for smooth animation
 */

import { ref, computed, onMounted, onUnmounted, nextTick, watch, isRef } from 'vue'
import type { Ref } from 'vue'

export interface Card3DOptions {
  maxRotate?: number // Maximum rotation in degrees (default: 15)
  perspective?: number // CSS perspective value (default: 1000)
  scale?: number // Scale on hover (default: 1.05)
  speed?: number // Animation speed (default: 400ms)
  easing?: string // CSS easing function
  disableOnMobile?: boolean // Disable on touch devices
  enabled?: Ref<boolean> | boolean // Enable/disable effect dynamically
}

export interface Card3DState {
  rotateX: Ref<number>
  rotateY: Ref<number>
  translateZ: Ref<number>
  shine: Ref<{ x: number, y: number, opacity: number }>
  isHovering: Ref<boolean>
}

export function use3DCard(
  elementRef: Ref<HTMLElement | null>,
  options: Card3DOptions = {},
) {
  const {
    maxRotate = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 400,
    easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
    disableOnMobile = true,
    enabled = true,
  } = options

  // Convert enabled to ref if it's a boolean
  const isEnabled = isRef(enabled) ? enabled : ref(enabled)

  // State
  const rotateX = ref(0)
  const rotateY = ref(0)
  const translateZ = ref(0)
  const shine = ref({ x: 50, y: 50, opacity: 0 })
  const isHovering = ref(false)

  // Performance optimization
  let rafId: number | null = null
  let cachedRect: DOMRect | null = null
  let rectCacheTime = 0
  const RECT_CACHE_DURATION = 100 // Cache rect for 100ms

  // Computed transform style
  const transformStyle = computed(() => {
    if (!isHovering.value) {
      return {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: `transform ${speed}ms ${easing}`,
      }
    }

    return {
      transform: `
        perspective(${perspective}px)
        rotateX(${rotateX.value}deg)
        rotateY(${rotateY.value}deg)
        scale(${scale})
        translateZ(${translateZ.value}px)
      `.replace(/\s+/g, ' ').trim(),
      transition: `transform ${speed}ms ${easing}`,
    }
  })

  // Computed shine style
  const shineStyle = computed(() => ({
    background: `radial-gradient(circle at ${shine.value.x}% ${shine.value.y}%, rgba(255,255,255,${shine.value.opacity}) 0%, transparent 80%)`,
    opacity: shine.value.opacity,
    transition: `opacity ${speed}ms ${easing}`,
  }))

  /**
   * Get cached rect or fetch new one
   */
  function getRect(): DOMRect | null {
    if (!elementRef.value) return null

    const now = Date.now()
    if (!cachedRect || now - rectCacheTime > RECT_CACHE_DURATION) {
      cachedRect = elementRef.value.getBoundingClientRect()
      rectCacheTime = now
    }
    return cachedRect
  }

  /**
   * Handles mouse move on card (optimized with RAF throttling)
   */
  function handleMouseMove(event: MouseEvent) {
    if (!elementRef.value || !isEnabled.value) return

    const rect = getRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const clientX = event.clientX
    const clientY = event.clientY

    // Calculate mouse position relative to center (-1 to 1)
    const mouseX = (clientX - centerX) / (rect.width / 2)
    const mouseY = (clientY - centerY) / (rect.height / 2)

    // Store values for RAF callback
    const shineX = ((clientX - rect.left) / rect.width) * 100
    const shineY = ((clientY - rect.top) / rect.height) * 100

    // Throttle with RAF - only schedule if not already pending
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        // Apply rotation (inverted for natural feel)
        rotateY.value = mouseX * maxRotate
        rotateX.value = -mouseY * maxRotate

        // Calculate shine position (0-100%)
        shine.value = {
          x: shineX,
          y: shineY,
          opacity: 0.3,
        }

        // Add slight translateZ for depth
        translateZ.value = 10

        rafId = null
      })
    }
  }

  /**
   * Handles mouse enter
   */
  function handleMouseEnter() {
    if (!isEnabled.value) return
    isHovering.value = true
    // Clear cache on hover start for accurate positioning
    cachedRect = null
  }

  /**
   * Handles mouse leave - reset to neutral position
   */
  function handleMouseLeave() {
    // Cancel any pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    isHovering.value = false
    rotateX.value = 0
    rotateY.value = 0
    translateZ.value = 0
    shine.value = { x: 50, y: 50, opacity: 0 }
    cachedRect = null
  }

  /**
   * Touch handlers for mobile
   */
  function handleTouchMove(event: TouchEvent) {
    if (disableOnMobile) return

    const touch = event.touches[0]
    if (!touch || !elementRef.value) return

    const rect = elementRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = (touch.clientX - centerX) / (rect.width / 2)
    const mouseY = (touch.clientY - centerY) / (rect.height / 2)

    rotateY.value = mouseX * (maxRotate * 0.5) // Reduced rotation on mobile
    rotateX.value = -mouseY * (maxRotate * 0.5)

    shine.value = {
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
      opacity: 0.2,
    }
  }

  function handleTouchEnd() {
    if (disableOnMobile) return
    handleMouseLeave()
  }

  /**
   * Setup event listeners
   */
  function setupListeners() {
    if (!elementRef.value || !isEnabled.value) return

    elementRef.value.addEventListener('mouseenter', handleMouseEnter, { passive: true })
    elementRef.value.addEventListener('mousemove', handleMouseMove, { passive: true })
    elementRef.value.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    if (!disableOnMobile) {
      elementRef.value.addEventListener('touchmove', handleTouchMove, { passive: true })
      elementRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }

  /**
   * Remove event listeners
   */
  function removeListeners() {
    if (!elementRef.value) return

    elementRef.value.removeEventListener('mouseenter', handleMouseEnter)
    elementRef.value.removeEventListener('mousemove', handleMouseMove)
    elementRef.value.removeEventListener('mouseleave', handleMouseLeave)

    if (!disableOnMobile) {
      elementRef.value.removeEventListener('touchmove', handleTouchMove)
      elementRef.value.removeEventListener('touchend', handleTouchEnd)
    }
  }

  // Watch enabled state to add/remove listeners
  watch(isEnabled, (enabled) => {
    if (enabled) {
      setupListeners()
    }
    else {
      removeListeners()
      // Reset to neutral state when disabled
      handleMouseLeave()
    }
  })

  // Lifecycle
  onMounted(() => {
    // Use nextTick to ensure element is in DOM
    nextTick(() => {
      if (isEnabled.value) {
        setupListeners()
      }
    })
  })

  onUnmounted(() => {
    removeListeners()
  })

  return {
    // State
    rotateX,
    rotateY,
    translateZ,
    shine,
    isHovering,

    // Computed styles
    transformStyle,
    shineStyle,

    // Methods (for manual control)
    reset: handleMouseLeave,
    setupListeners,
    removeListeners,
  }
}
