<script setup lang="ts">
/**
 * Shiny Sparkles Effect Component
 *
 * Creates a Pokemon-style shiny animation:
 * 1. Initial burst: Stars spiral out from center
 * 2. Idle state: Stars twinkle and float around the Pokemon
 */

import { Icon } from '@iconify/vue'

interface Props {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  size: 'md',
})

// Star configurations for the spiral effect
interface Star {
  id: number
  delay: number
  angle: number
  distance: number
  size: number
  duration: number
}

const stars = ref<Star[]>([])

// Separate stars for spiral and idle
const spiralStars = ref<Star[]>([])
const idleStars = ref<Star[]>([])
const showSpiral = ref(false)

// Generate stars when active
watch(() => props.active, (isActive) => {
  if (isActive) {
    // Show spiral animation
    showSpiral.value = true
    generateSpiralStars()
    generateIdleStars()

    // Hide spiral after animation completes (0.12 * 6 stars + 0.6s animation + 0.3s fade = 1.62s)
    setTimeout(() => {
      showSpiral.value = false
    }, 1700)
  }
  else {
    showSpiral.value = false
  }
}, { immediate: true })

function generateSpiralStars() {
  const starCount = 6
  const newStars: Star[] = []

  for (let i = 0; i < starCount; i++) {
    const progress = i / starCount // 0 to 1
    newStars.push({
      id: i,
      delay: i * 0.12, // Sequential delay for spiral effect
      // Angle increases more for later stars (creates spiral)
      angle: progress * 720, // 2 full rotations (720 degrees)
      distance: 150, // Far out before disappearing
      size: 0.9 + Math.random() * 0.3, // Random size between 0.9 and 1.2
      duration: 0, // Not used for spiral
    })
  }

  spiralStars.value = newStars
}

function generateIdleStars() {
  const starCount = 4
  const newStars: Star[] = []

  for (let i = 0; i < starCount; i++) {
    newStars.push({
      id: i + 100, // Different IDs from spiral stars
      delay: 1.5 + (Math.random() * 0.8), // Start after spiral completes
      angle: Math.random() * 360, // Random positions around Pokemon
      distance: 80 + Math.random() * 30, // Distance 80-110% (away from center)
      size: 0.7 + Math.random() * 0.3, // Random size between 0.7 and 1.0
      duration: 2.5 + Math.random() * 2, // Random duration between 2.5-4.5s for idle animation
    })
  }

  idleStars.value = newStars
  stars.value = newStars // Keep for compatibility
}

// Size classes
const containerSize = computed(() => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  }
  return sizes[props.size]
})

const iconSize = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }
  return sizes[props.size]
})
</script>

<template>
  <div
    v-if="active"
    class="absolute inset-0 pointer-events-none overflow-visible z-20"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <div :class="containerSize" class="relative">
        <!-- Spiral Stars (appear once then disappear) -->
        <div
          v-for="star in spiralStars"
          v-show="showSpiral"
          :key="`spiral-${star.id}`"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 spiral-star"
          :style="{
            '--star-angle': `${star.angle}deg`,
            '--star-distance': `${star.distance}%`,
            '--star-size': star.size,
            '--star-delay': `${star.delay}s`,
          }"
        >
          <div class="spiral-container">
            <Icon
              icon="ph:sparkle-fill"
              :class="iconSize"
              class="text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]"
            />
          </div>
        </div>

        <!-- Idle Stars (twinkle continuously) -->
        <div
          v-for="star in idleStars"
          :key="`idle-${star.id}`"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          :style="{
            transform: `
              translate(-50%, -50%)
              rotate(${star.angle}deg)
              translateY(-${star.distance}%)
            `,
          }"
        >
          <div
            class="idle-star"
            :style="{
              '--idle-delay': `${star.delay}s`,
              '--idle-duration': `${star.duration}s`,
              transform: `scale(${star.size})`,
            }"
          >
            <Icon
              icon="ph:sparkle-fill"
              :class="iconSize"
              class="text-yellow-300 drop-shadow-[0_0_4px_rgba(253,224,71,0.8)]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   SPIRAL ANIMATION (One-time, then disappear)
   ============================================ */

.spiral-star {
  animation: spiral-path 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--star-delay);
}

.spiral-container {
  animation:
    spiral-appear 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards,
    spiral-fade-out 0.3s ease-out 0.6s forwards;
  animation-delay: var(--star-delay);
}

/* Spiral path - stars rotate AND move outward simultaneously creating true spiral */
@keyframes spiral-path {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateY(0);
  }
  100% {
    transform:
      translate(-50%, -50%)
      rotate(var(--star-angle))
      translateY(calc(var(--star-distance) * -1));
  }
}

/* Spiral appearance - fade in with scale */
@keyframes spiral-appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  30% {
    opacity: 1;
    transform: scale(var(--star-size));
  }
  100% {
    opacity: 1;
    transform: scale(var(--star-size));
  }
}

/* Spiral fade out - disappear at the end */
@keyframes spiral-fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* ============================================
   IDLE ANIMATION (Continuous twinkling)
   ============================================ */

.idle-star {
  animation: idle-twinkle var(--idle-duration) ease-in-out var(--idle-delay) infinite;
  opacity: 0;
}

/* Idle twinkling - ONLY opacity changes, no movement */
@keyframes idle-twinkle {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
