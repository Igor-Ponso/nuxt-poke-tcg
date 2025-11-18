<script setup lang="ts">
/**
 * Confetti Effect Component
 *
 * Shows confetti and light effects for quick/perfect answers
 */

interface Props {
  show: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000,
})

interface Confetti {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  color: string
  rotation: number
  size: number
  shape: 'square' | 'circle' | 'rectangle'
}

const confettiPieces = ref<Confetti[]>([])
const showEffect = ref(false)

// Watch for show prop changes
watch(() => props.show, (isShowing) => {
  if (isShowing) {
    triggerConfetti()
  }
})

function triggerConfetti() {
  showEffect.value = true
  generateConfetti()

  // Auto-hide after duration
  setTimeout(() => {
    showEffect.value = false
    confettiPieces.value = []
  }, props.duration)
}

function generateConfetti() {
  const colors = ['#FFCB05', '#3B4CCA', '#FF0000', '#FFD700', '#FF4500', '#FFA500', '#32CD32', '#FF69B4']
  const shapes: Array<'square' | 'circle' | 'rectangle'> = ['square', 'circle', 'rectangle']
  const pieces: Confetti[] = []

  for (let i = 0; i < 50; i++) {
    pieces.push({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 20,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 6,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }

  confettiPieces.value = pieces
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showEffect"
        class="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      >
        <!-- Light Bursts from corners -->
        <div class="light-burst light-burst-tl" />
        <div class="light-burst light-burst-tr" />
        <div class="light-burst light-burst-bl" />
        <div class="light-burst light-burst-br" />

        <!-- Center flash -->
        <div class="center-flash" />

        <!-- Confetti pieces -->
        <div
          v-for="confetti in confettiPieces"
          :key="`confetti-${confetti.id}`"
          class="confetti"
          :class="`confetti-${confetti.shape}`"
          :style="{
            left: `${confetti.x}%`,
            top: `${confetti.y}%`,
            animationDelay: `${confetti.delay}s`,
            animationDuration: `${confetti.duration}s`,
            backgroundColor: confetti.color,
            transform: `rotate(${confetti.rotation}deg)`,
            width: `${confetti.size}px`,
            height: `${confetti.size}px`,
          }"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===== LIGHT BURSTS ===== */
.light-burst {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 203, 5, 0.6) 0%, rgba(255, 203, 5, 0.3) 30%, transparent 70%);
  animation: burst 0.8s ease-out forwards;
  filter: blur(20px);
}

.light-burst-tl {
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.light-burst-tr {
  top: -200px;
  right: -200px;
  animation-delay: 0.1s;
}

.light-burst-bl {
  bottom: -200px;
  left: -200px;
  animation-delay: 0.2s;
}

.light-burst-br {
  bottom: -200px;
  right: -200px;
  animation-delay: 0.3s;
}

@keyframes burst {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* ===== CENTER FLASH ===== */
.center-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 40%);
  animation: flash 0.5s ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

/* ===== CONFETTI ===== */
.confetti {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  animation: confetti-fall linear forwards;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
}

.confetti-square {
  border-radius: 2px;
}

.confetti-circle {
  border-radius: 50%;
}

.confetti-rectangle {
  border-radius: 2px;
  aspect-ratio: 2/1;
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) translateX(var(--drift-x, 50px)) rotateX(720deg) rotateY(720deg) rotateZ(1080deg);
  }
}

/* Varied drift patterns */
.confetti:nth-child(2n) {
  --drift-x: -100px;
}

.confetti:nth-child(3n) {
  --drift-x: 150px;
  animation-timing-function: ease-in-out;
}

.confetti:nth-child(4n) {
  --drift-x: -75px;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.confetti:nth-child(5n) {
  --drift-x: 100px;
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
