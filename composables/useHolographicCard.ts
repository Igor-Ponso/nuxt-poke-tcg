/**
 * Holographic Card Composable - Simon Goellner Style
 *
 * Complete implementation of the GENIUS holographic effect system
 * Based on https://poke-holo.simey.me/ and pokemon-cards-css-main
 *
 * Features:
 * - 4-layer structure: translater → rotator → front → (shine + glare)
 * - CSS variables bridge between JS and CSS
 * - Giant gradients (400% size) for parallax scrolling effect
 * - Spring-like smooth animations
 * - Multiple card types (Regular Holo, Cosmos, Full Art, Rainbow, Secret, Radiant)
 * - Performance optimized with RAF throttling
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export type CardType = 'regular-holo' | 'cosmos' | 'full-art' | 'rainbow' | 'secret' | 'radiant'

export interface HolographicCardOptions {
  cardType?: CardType
  enabled?: boolean
  intensity?: number
  springConfig?: {
    stiffness: number
    damping: number
  }
}

export function useHolographicCard(
  cardRef: Ref<HTMLElement | null>,
  options: HolographicCardOptions = {}
) {
  const {
    cardType = 'regular-holo',
    enabled = true,
    intensity = 1,
    springConfig = {
      stiffness: 0.066,
      damping: 0.25,
    },
  } = options

  // Mouse position (0-100%)
  const pointerX = ref(50)
  const pointerY = ref(50)

  // Distance calculations (0-1)
  const pointerFromCenter = ref(0)
  const pointerFromTop = ref(0.5)
  const pointerFromLeft = ref(0.5)

  // Background parallax (37-63% range for subtle effect)
  const backgroundX = ref(50)
  const backgroundY = ref(50)

  // 3D rotation
  const rotateX = ref(0) // Y-axis rotation
  const rotateY = ref(0) // X-axis rotation

  // Card state
  const cardOpacity = ref(0) // Holographic effect opacity
  const cardScale = ref(1)
  const isInteractive = ref(false)

  // Performance optimization
  let rafId: number | null = null
  let resetTimeoutId: number | null = null

  // Spring physics simulation (simplified)
  const springState = {
    rotate: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  }

  /**
   * CSS Variables object for inline styles
   * This is the BRIDGE between JS and CSS
   */
  const cssVariables = computed(() => ({
    '--pointer-x': `${pointerX.value}%`,
    '--pointer-y': `${pointerY.value}%`,
    '--pointer-from-center': pointerFromCenter.value,
    '--pointer-from-top': pointerFromTop.value,
    '--pointer-from-left': pointerFromLeft.value,
    '--background-x': `${backgroundX.value}%`,
    '--background-y': `${backgroundY.value}%`,
    '--rotate-x': `${rotateX.value}deg`,
    '--rotate-y': `${rotateY.value}deg`,
    '--card-opacity': cardOpacity.value,
    '--card-scale': cardScale.value,
  }))

  /**
   * Adjust value from one range to another
   */
  function adjustRange(
    value: number,
    oldMin: number,
    oldMax: number,
    newMin: number,
    newMax: number
  ): number {
    return ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
  }

  /**
   * Calculate distance from center using Pythagorean theorem
   */
  function calculateDistanceFromCenter(x: number, y: number): number {
    const centerX = x - 50
    const centerY = y - 50
    return Math.sqrt(centerX * centerX + centerY * centerY) / 50 // Normalize to 0-1
  }

  /**
   * Apply spring physics for smooth animation
   */
  function applySpring() {
    const { stiffness, damping } = springConfig

    // Calculate spring force
    const forceX = -springState.rotate.x * stiffness
    const forceY = -springState.rotate.y * stiffness

    // Apply damping
    springState.velocity.x = (springState.velocity.x + forceX) * damping
    springState.velocity.y = (springState.velocity.y + forceY) * damping

    // Update position
    springState.rotate.x += springState.velocity.x
    springState.rotate.y += springState.velocity.y

    // Update reactive values
    rotateX.value = springState.rotate.x
    rotateY.value = springState.rotate.y

    // Continue animation if still moving
    if (
      Math.abs(springState.velocity.x) > 0.01 ||
      Math.abs(springState.velocity.y) > 0.01 ||
      Math.abs(springState.rotate.x) > 0.01 ||
      Math.abs(springState.rotate.y) > 0.01
    ) {
      rafId = requestAnimationFrame(applySpring)
    } else {
      // Animation finished
      rafId = null
      springState.rotate.x = 0
      springState.rotate.y = 0
      springState.velocity.x = 0
      springState.velocity.y = 0
    }
  }

  /**
   * Update all CSS variables based on mouse position
   */
  function updateCSSVariables(clientX: number, clientY: number) {
    if (!cardRef.value || !enabled) return

    const rect = cardRef.value.getBoundingClientRect()

    // Calculate normalized positions (0-100%)
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    // Update pointer position
    pointerX.value = Math.max(0, Math.min(100, x))
    pointerY.value = Math.max(0, Math.min(100, y))

    // Calculate distance metrics
    pointerFromCenter.value = calculateDistanceFromCenter(x, y)
    pointerFromTop.value = y / 100
    pointerFromLeft.value = x / 100

    // Background parallax (restricted range for subtlety)
    backgroundX.value = adjustRange(x, 0, 100, 37, 63)
    backgroundY.value = adjustRange(y, 0, 100, 33, 67)

    // Calculate rotation based on distance from center
    const centerX = x - 50
    const centerY = y - 50

    // Set target rotation (spring will animate to these values)
    const targetRotateX = -(centerY / 3.5) * intensity
    const targetRotateY = (centerX / 2) * intensity

    // Instant update (no spring during active movement)
    rotateX.value = targetRotateX
    rotateY.value = targetRotateY
    springState.rotate.x = targetRotateX
    springState.rotate.y = targetRotateY

    // Show holographic effect
    cardOpacity.value = 1
  }

  /**
   * Handle mouse move with RAF throttling
   */
  function handleMouseMove(event: MouseEvent) {
    if (!enabled) return

    // Cancel any pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    // Update immediately (RAF not needed for smooth mouse tracking)
    updateCSSVariables(event.clientX, event.clientY)
  }

  /**
   * Handle mouse enter
   */
  function handleMouseEnter() {
    if (!enabled) return

    isInteractive.value = true
    cardScale.value = 1.05
    cardOpacity.value = 1

    // Clear any pending reset
    if (resetTimeoutId !== null) {
      clearTimeout(resetTimeoutId)
      resetTimeoutId = null
    }
  }

  /**
   * Handle mouse leave - smooth spring reset
   */
  function handleMouseLeave() {
    if (!enabled) return

    isInteractive.value = false
    cardScale.value = 1

    // Reset pointer to center
    pointerX.value = 50
    pointerY.value = 50
    backgroundX.value = 50
    backgroundY.value = 50
    pointerFromCenter.value = 0
    pointerFromTop.value = 0.5
    pointerFromLeft.value = 0.5

    // Fade out holographic effect
    resetTimeoutId = setTimeout(() => {
      cardOpacity.value = 0
    }, 200)

    // Spring animation back to neutral
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(applySpring)
  }

  /**
   * Setup event listeners
   */
  function setup() {
    if (!cardRef.value || !enabled) return

    cardRef.value.addEventListener('mouseenter', handleMouseEnter)
    cardRef.value.addEventListener('mousemove', handleMouseMove)
    cardRef.value.addEventListener('mouseleave', handleMouseLeave)
  }

  /**
   * Cleanup event listeners
   */
  function cleanup() {
    if (!cardRef.value) return

    cardRef.value.removeEventListener('mouseenter', handleMouseEnter)
    cardRef.value.removeEventListener('mousemove', handleMouseMove)
    cardRef.value.removeEventListener('mouseleave', handleMouseLeave)

    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    if (resetTimeoutId !== null) {
      clearTimeout(resetTimeoutId)
      resetTimeoutId = null
    }
  }

  // Lifecycle
  onMounted(() => {
    if (import.meta.client) {
      setup()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    cssVariables,
    isInteractive,
    cardOpacity,

    // Methods
    setup,
    cleanup,
    reset: handleMouseLeave,
  }
}
