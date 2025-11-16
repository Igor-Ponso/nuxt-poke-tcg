/**
 * Holographic Effect Composable
 *
 * Implements the photorealistic holographic foil effect for TCG cards
 * Based on the GENIUS implementation from pokemon-cards-css-main
 *
 * Features:
 * - 3-layer holographic system (shine with :before and :after)
 * - mix-blend-mode: color-dodge for realistic foil
 * - Giant gradients (400%) for parallax effect
 * - Spring physics for smooth animation
 * - Mouse tracking with CSS variables
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { HolographicConfig } from '~/types'

export interface HolographicState {
  mouseX: Ref<number>
  mouseY: Ref<number>
  rotateX: Ref<number>
  rotateY: Ref<number>
  backgroundPosition: Ref<string>
  glarePosition: Ref<string>
  glareOpacity: Ref<number>
  isActive: Ref<boolean>
}

export function useHolographic(
  elementRef: Ref<HTMLElement | null>,
  config: HolographicConfig = {
    enabled: true,
    intensity: 1,
    speed: 1,
    type: 'standard',
  },
) {
  const { enabled, intensity = 1, type = 'standard' } = config

  // Mouse position (0-1 range)
  const mouseX = ref(0.5)
  const mouseY = ref(0.5)

  // Rotation values
  const rotateX = ref(0)
  const rotateY = ref(0)

  // Background position for giant gradient (400%)
  const backgroundPosition = ref('50% 50%')

  // Glare/shine position and opacity
  const glarePosition = ref('50% 50%')
  const glareOpacity = ref(0)

  // Active state
  const isActive = ref(false)

  // Performance optimization
  let rafId: number | null = null
  let cachedRect: DOMRect | null = null
  let rectCacheTime = 0
  const RECT_CACHE_DURATION = 100 // Cache rect for 100ms

  /**
   * CSS Variables for the card
   * These are used in the actual card component
   */
  const cssVariables = computed(() => ({
    '--mouse-x': `${mouseX.value}`,
    '--mouse-y': `${mouseY.value}`,
    '--rotate-x': `${rotateX.value}deg`,
    '--rotate-y': `${rotateY.value}deg`,
    '--bg-position': backgroundPosition.value,
    '--glare-position': glarePosition.value,
    '--glare-opacity': glareOpacity.value,
  }))

  /**
   * Holographic gradient based on card type
   */
  const holographicGradient = computed(() => {
    switch (type) {
      case 'reverse':
        // Reverse holo - vertical stripes
        return `
          repeating-linear-gradient(
            0deg,
            rgb(255, 119, 115) calc(5% * 1),
            rgb(255, 237, 95) calc(5% * 2),
            rgb(168, 255, 95) calc(5% * 3),
            rgb(131, 255, 247) calc(5% * 4),
            rgb(120, 148, 255) calc(5% * 5),
            rgb(216, 117, 255) calc(5% * 6),
            rgb(255, 119, 115) calc(5% * 7)
          )
        `

      case 'cosmos':
        // Cosmos holo - radial burst
        return `
          radial-gradient(
            farthest-corner circle at var(--pointer-x) var(--pointer-y),
            rgba(0, 0, 0, 0.1) 12%,
            rgba(0, 0, 0, 0.15) 20%,
            rgba(0, 0, 0, 0.25) 120%
          ),
          radial-gradient(
            farthest-corner circle at 40% 50%,
            hsla(200, 100%, 50%, 1),
            hsla(200, 100%, 50%, 0) 50%
          ),
          radial-gradient(
            farthest-corner circle at 60% 50%,
            hsla(300, 100%, 50%, 1),
            hsla(300, 100%, 50%, 0) 50%
          )
        `

      case 'radial':
        // Radial holo - centered burst
        return `
          radial-gradient(
            circle at 50% 50%,
            hsl(0, 100%, 50%) 0%,
            hsl(60, 100%, 50%) 20%,
            hsl(120, 100%, 50%) 40%,
            hsl(180, 100%, 50%) 60%,
            hsl(240, 100%, 50%) 80%,
            hsl(300, 100%, 50%) 100%
          )
        `

      case 'prism':
        // Rainbow prism effect
        return `
          linear-gradient(
            115deg,
            transparent 0%,
            rgb(0, 231, 255) 30%,
            rgb(255, 0, 231) 50%,
            rgb(255, 231, 0) 70%,
            transparent 100%
          )
        `

      case 'standard':
      default:
        // Standard holo - diagonal rainbow
        return getHolographicGradient(mouseX.value * 360, intensity)
    }
  })

  /**
   * Sparkle colors based on mouse position
   */
  const sparkleColors = computed(() => getSparkleColors(mouseX.value * 360))

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
   * Handle mouse move (optimized with RAF throttling)
   */
  function handleMouseMove(event: MouseEvent) {
    if (!enabled || !elementRef.value) return

    const rect = getRect()
    if (!rect) return

    const clientX = event.clientX
    const clientY = event.clientY

    // Normalize mouse position (0-1)
    const newMouseX = (clientX - rect.left) / rect.width
    const newMouseY = (clientY - rect.top) / rect.height

    // Calculate rotation
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const deltaX = clientX - rect.left - centerX
    const deltaY = clientY - rect.top - centerY

    const newRotateX = -(deltaY / centerY) * 10 * intensity
    const newRotateY = (deltaX / centerX) * 10 * intensity

    // Giant background position (400% for parallax)
    const bgX = 20 + newMouseX * 60 // 20-80%
    const bgY = 20 + newMouseY * 60

    // Throttle with RAF - only schedule if not already pending
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        mouseX.value = newMouseX
        mouseY.value = newMouseY

        rotateX.value = newRotateX
        rotateY.value = newRotateY

        backgroundPosition.value = `${bgX}% ${bgY}%`

        // Glare position
        glarePosition.value = `${newMouseX * 100}% ${newMouseY * 100}%`
        glareOpacity.value = 0.6 * intensity

        rafId = null
      })
    }
  }

  /**
   * Handle mouse enter
   */
  function handleMouseEnter() {
    if (!enabled) return
    isActive.value = true
    // Clear cache on hover start for accurate positioning
    cachedRect = null
  }

  /**
   * Handle mouse leave - smooth reset
   */
  function handleMouseLeave() {
    if (!enabled) return

    // Cancel any pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    isActive.value = false

    // Smooth transition back to neutral
    mouseX.value = 0.5
    mouseY.value = 0.5
    rotateX.value = 0
    rotateY.value = 0
    backgroundPosition.value = '50% 50%'
    glarePosition.value = '50% 50%'
    glareOpacity.value = 0
    cachedRect = null
  }

  /**
   * Setup event listeners
   */
  function setupListeners() {
    if (!elementRef.value || !enabled) return

    elementRef.value.addEventListener('mouseenter', handleMouseEnter)
    elementRef.value.addEventListener('mousemove', handleMouseMove)
    elementRef.value.addEventListener('mouseleave', handleMouseLeave)
  }

  /**
   * Remove event listeners
   */
  function removeListeners() {
    if (!elementRef.value) return

    elementRef.value.removeEventListener('mouseenter', handleMouseEnter)
    elementRef.value.removeEventListener('mousemove', handleMouseMove)
    elementRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }

  // Lifecycle
  onMounted(() => {
    // Use nextTick to ensure element is in DOM
    if (import.meta.client) {
      nextTick(() => {
        setupListeners()
      })
    }
  })

  onUnmounted(() => {
    removeListeners()
  })

  return {
    // State
    mouseX,
    mouseY,
    rotateX,
    rotateY,
    backgroundPosition,
    glarePosition,
    glareOpacity,
    isActive,

    // Computed
    cssVariables,
    holographicGradient,
    sparkleColors,

    // Methods
    reset: handleMouseLeave,
    setupListeners,
    removeListeners,
  }
}

/**
 * Generate holographic layer styles for the 3-layer system
 * To be used in component with :before and :after pseudo-elements
 */
export function getHolographicLayerStyles(type: HolographicConfig['type'] = 'standard') {
  const baseStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    pointerEvents: 'none' as const,
  }

  switch (type) {
    case 'standard':
      return {
        layer1: {
          ...baseStyles,
          background: 'var(--holo-gradient)',
          backgroundSize: '400% 400%',
          backgroundPosition: 'var(--bg-position)',
          mixBlendMode: 'color-dodge' as const,
          opacity: 0.75,
        },
        layer2: {
          ...baseStyles,
          background: 'radial-gradient(circle at var(--glare-position), rgba(255,255,255,0.8), transparent 50%)',
          mixBlendMode: 'overlay' as const,
          opacity: 'var(--glare-opacity)',
        },
        layer3: {
          ...baseStyles,
          background: 'var(--sparkle-pattern)',
          mixBlendMode: 'hard-light' as const,
          opacity: 0.3,
        },
      }

    case 'reverse':
      return {
        layer1: {
          ...baseStyles,
          background: 'var(--holo-gradient)',
          backgroundSize: '200% 700%',
          backgroundPosition: 'center',
          mixBlendMode: 'color-dodge' as const,
          filter: 'brightness(calc((var(--mouse-x) + var(--mouse-y)) / 2 + 0.5))',
        },
        layer2: {
          ...baseStyles,
          background: 'radial-gradient(circle at var(--glare-position), white, transparent 60%)',
          mixBlendMode: 'overlay' as const,
          opacity: 0.4,
        },
        layer3: baseStyles,
      }

    default:
      return {
        layer1: baseStyles,
        layer2: baseStyles,
        layer3: baseStyles,
      }
  }
}
