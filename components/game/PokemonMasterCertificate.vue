<script setup lang="ts">
/**
 * Pokemon Master Certificate Modal
 *
 * Easter egg shown when player catches all Pokemon from selected generations
 */

import { Icon } from '@iconify/vue'
import { GENERATIONS } from '~/utils/constants'

interface Props {
  show: boolean
  pokemonCount: number
  selectedGenerations: number[]
  score: number
  accuracy: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  playAgain: []
}>()

/**
 * Confetti animation state
 */
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

interface Particle {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  size: number
}

const confettiPieces = ref<Confetti[]>([])
const particles = ref<Particle[]>([])

// Generate confetti when modal shows
watch(() => props.show, (isShowing) => {
  if (isShowing) {
    generateConfetti()
    generateParticles()
  }
  else {
    confettiPieces.value = []
    particles.value = []
  }
})

function generateConfetti() {
  const colors = ['#FFCB05', '#3B4CCA', '#FF0000', '#00FF00', '#0000FF', '#FF69B4', '#FFD700', '#FF4500', '#FFA500', '#32CD32']
  const shapes: Array<'square' | 'circle' | 'rectangle'> = ['square', 'circle', 'rectangle']
  const pieces: Confetti[] = []

  for (let i = 0; i < 80; i++) {
    pieces.push({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 20,
      delay: Math.random() * 0.8,
      duration: 3 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    })
  }

  confettiPieces.value = pieces
}

function generateParticles() {
  const particleList: Particle[] = []

  for (let i = 0; i < 30; i++) {
    particleList.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 2 + Math.random() * 4,
    })
  }

  particles.value = particleList
}

/**
 * Get generation names
 */
const generationNames = computed(() => {
  return props.selectedGenerations
    .map(id => GENERATIONS.find(g => g.id === id)?.region)
    .filter(Boolean)
    .join(', ')
})

/**
 * Get certificate title based on generations
 */
const certificateTitle = computed(() => {
  if (props.selectedGenerations.length === 9) {
    return 'Ultimate Pokémon Master'
  }
  if (props.selectedGenerations.length >= 5) {
    return 'Elite Pokémon Master'
  }
  if (props.selectedGenerations.length >= 3) {
    return 'Pokémon Master'
  }
  return 'Regional Pokémon Expert'
})

/**
 * Get certificate message
 */
const certificateMessage = computed(() => {
  if (props.selectedGenerations.length === 9) {
    return 'You have proven yourself as the ultimate Pokémon Master by identifying all 1025 Pokémon across all generations! Your knowledge is legendary!'
  }
  if (props.selectedGenerations.length >= 5) {
    return 'You have demonstrated exceptional Pokémon knowledge by identifying all Pokémon across multiple generations!'
  }
  return `You have successfully identified all ${props.pokemonCount} Pokémon from the selected region${props.selectedGenerations.length > 1 ? 's' : ''}!`
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
        @click.self="emit('close')"
      >
        <!-- Animated Background Effects -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <!-- Radial Gradient Pulse -->
          <div class="radial-pulse" />

          <!-- Light Beams -->
          <div class="light-beam light-beam-1" />
          <div class="light-beam light-beam-2" />
          <div class="light-beam light-beam-3" />
          <div class="light-beam light-beam-4" />
          <div class="light-beam light-beam-5" />
          <div class="light-beam light-beam-6" />
          <div class="light-beam light-beam-7" />
          <div class="light-beam light-beam-8" />

          <!-- Spotlight Effects -->
          <div class="spotlight spotlight-1" />
          <div class="spotlight spotlight-2" />
          <div class="spotlight spotlight-3" />
        </div>

        <!-- Floating Particles -->
        <div
          v-for="particle in particles"
          :key="`particle-${particle.id}`"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }"
        />

        <!-- Enhanced Confetti with shapes -->
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

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
          >
            <!-- Certificate Card -->
            <UiCard
              variant="elevated"
              padding="none"
              class="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 dark:from-yellow-900/20 dark:via-gray-900 dark:to-yellow-900/20 border-4 border-yellow-500 dark:border-yellow-600 shadow-2xl"
            >
              <!-- Close button -->
              <button
                type="button"
                class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                @click="emit('close')"
              >
                <Icon
                  icon="ph:x-bold"
                  class="w-5 h-5 text-gray-700 dark:text-gray-300"
                />
              </button>

              <div class="p-8 sm:p-12 space-y-8">
                <!-- Header with Trophy -->
                <div class="text-center space-y-4">
                  <div class="flex justify-center relative">
                    <!-- Glow effect behind trophy -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="trophy-glow" />
                    </div>
                    <Icon
                      icon="ph:trophy-fill"
                      class="w-24 h-24 text-yellow-500 drop-shadow-lg trophy-bounce relative z-10"
                    />
                  </div>

                  <h1 class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-title-shimmer bg-[length:200%_auto]">
                    Congratulations!
                  </h1>

                  <div class="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-full certificate-badge bg-[length:200%_auto]">
                    <p class="text-2xl font-bold text-white drop-shadow-lg">
                      {{ certificateTitle }}
                    </p>
                  </div>
                </div>

                <!-- Decorative border -->
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t-2 border-yellow-400 dark:border-yellow-600" />
                  </div>
                  <div class="relative flex justify-center">
                    <Icon
                      icon="ph:seal-check-fill"
                      class="w-12 h-12 bg-yellow-50 dark:bg-gray-900 text-yellow-500"
                    />
                  </div>
                </div>

                <!-- Certificate Text -->
                <div class="text-center space-y-6">
                  <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ certificateMessage }}
                  </p>

                  <!-- Stats Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
                    <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {{ pokemonCount }}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Pokémon
                      </div>
                    </div>

                    <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                        {{ accuracy.toFixed(0) }}%
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Accuracy
                      </div>
                    </div>

                    <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {{ score.toLocaleString() }}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Score
                      </div>
                    </div>

                    <div class="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {{ selectedGenerations.length }}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ selectedGenerations.length === 1 ? 'Gen' : 'Gens' }}
                      </div>
                    </div>
                  </div>

                  <!-- Regions -->
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Regions Mastered
                    </p>
                    <p class="text-base text-blue-800 dark:text-blue-200">
                      {{ generationNames }}
                    </p>
                  </div>

                  <!-- Motivational Message -->
                  <div class="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                    <Icon
                      icon="ph:star-four-fill"
                      class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1"
                    />
                    <p class="text-sm text-gray-700 dark:text-gray-300 italic">
                      "A true Pokémon Master knows not just how to catch them all, but how to recognize them all!" - Professor Oak
                    </p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <UiButton
                    variant="primary"
                    size="lg"
                    class="flex-1"
                    @click="emit('playAgain')"
                  >
                    <Icon
                      icon="ph:play-fill"
                      class="w-5 h-5"
                    />
                    Play Again
                  </UiButton>
                  <UiButton
                    variant="secondary"
                    size="lg"
                    class="flex-1"
                    @click="emit('close')"
                  >
                    <Icon
                      icon="ph:house-fill"
                      class="w-5 h-5"
                    />
                    Main Menu
                  </UiButton>
                </div>

                <!-- Footer -->
                <div class="text-center text-xs text-gray-500 dark:text-gray-500 pt-4">
                  Certificate issued on {{ new Date().toLocaleDateString() }}
                </div>
              </div>
            </UiCard>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===== RADIAL PULSE EFFECT ===== */
.radial-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(255, 203, 5, 0.15) 0%,
    rgba(59, 76, 202, 0.1) 25%,
    rgba(255, 0, 0, 0.05) 50%,
    transparent 70%
  );
  animation: pulse-expand 3s ease-in-out infinite;
}

@keyframes pulse-expand {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

/* ===== SPOTLIGHT EFFECTS ===== */
.spotlight {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0;
  animation: spotlight-dance 6s ease-in-out infinite;
  mix-blend-mode: screen;
}

.spotlight-1 {
  background: radial-gradient(circle, rgba(255, 203, 5, 0.4), transparent);
  top: -100px;
  left: 20%;
  animation-delay: 0s;
}

.spotlight-2 {
  background: radial-gradient(circle, rgba(59, 76, 202, 0.4), transparent);
  top: 30%;
  right: 10%;
  animation-delay: 2s;
}

.spotlight-3 {
  background: radial-gradient(circle, rgba(255, 105, 180, 0.4), transparent);
  bottom: -100px;
  left: 40%;
  animation-delay: 4s;
}

@keyframes spotlight-dance {
  0%, 100% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  25% {
    opacity: 0.6;
    transform: translate(30px, -20px) scale(1.1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-20px, 30px) scale(0.9);
  }
  75% {
    opacity: 0.6;
    transform: translate(20px, 20px) scale(1.05);
  }
}

/* ===== FLOATING PARTICLES ===== */
.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(255, 203, 5, 0.4));
  border-radius: 50%;
  pointer-events: none;
  animation: particle-float linear infinite;
  filter: blur(1px);
  box-shadow: 0 0 10px rgba(255, 203, 5, 0.6);
}

@keyframes particle-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) scale(1.5);
  }
}

/* ===== ENHANCED CONFETTI WITH 3D EFFECTS ===== */
.confetti {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  animation: confetti-fall linear infinite;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transform-style: preserve-3d;
}

/* Different shapes */
.confetti-square {
  border-radius: 2px;
}

.confetti-circle {
  border-radius: 50%;
}

.confetti-rectangle {
  border-radius: 2px;
}

.confetti-rectangle {
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
    transform: translateY(120vh) translateX(var(--drift-x, 100px)) rotateX(720deg) rotateY(720deg) rotateZ(1080deg);
  }
}

/* Varied drift patterns */
.confetti:nth-child(2n) {
  --drift-x: -150px;
}

.confetti:nth-child(3n) {
  --drift-x: 200px;
  animation-timing-function: ease-in-out;
}

.confetti:nth-child(4n) {
  --drift-x: -100px;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.confetti:nth-child(5n) {
  --drift-x: 150px;
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ===== ENHANCED LIGHT BEAMS WITH MODERN EFFECTS ===== */
.light-beam {
  position: absolute;
  width: 250px;
  height: 100%;
  opacity: 0;
  animation: light-sweep 5s ease-in-out infinite;
  transform-origin: top center;
  filter: blur(3px);
  mix-blend-mode: screen;
}

.light-beam-1 {
  left: 5%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 203, 5, 0.4) 30%,
    rgba(255, 203, 5, 0.2) 60%,
    transparent 100%
  );
  animation-delay: 0s;
}

.light-beam-2 {
  left: 20%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(59, 76, 202, 0.4) 25%,
    rgba(59, 76, 202, 0.2) 65%,
    transparent 100%
  );
  animation-delay: 0.6s;
}

.light-beam-3 {
  left: 35%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 0, 100, 0.4) 30%,
    rgba(255, 0, 100, 0.2) 60%,
    transparent 100%
  );
  animation-delay: 1.2s;
}

.light-beam-4 {
  left: 50%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 150, 0.4) 35%,
    rgba(0, 255, 150, 0.2) 65%,
    transparent 100%
  );
  animation-delay: 1.8s;
}

.light-beam-5 {
  left: 65%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 105, 180, 0.4) 30%,
    rgba(255, 105, 180, 0.2) 60%,
    transparent 100%
  );
  animation-delay: 2.4s;
}

.light-beam-6 {
  left: 80%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 215, 0, 0.4) 25%,
    rgba(255, 215, 0, 0.2) 65%,
    transparent 100%
  );
  animation-delay: 3s;
}

.light-beam-7 {
  left: 12%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(138, 43, 226, 0.4) 30%,
    rgba(138, 43, 226, 0.2) 60%,
    transparent 100%
  );
  animation-delay: 3.6s;
}

.light-beam-8 {
  left: 72%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 191, 255, 0.4) 30%,
    rgba(0, 191, 255, 0.2) 60%,
    transparent 100%
  );
  animation-delay: 4.2s;
}

@keyframes light-sweep {
  0% {
    opacity: 0;
    transform: rotate(-25deg) scaleY(0) scaleX(0.8);
    filter: blur(5px) brightness(0.5);
  }
  5% {
    opacity: 0.3;
    filter: blur(4px) brightness(0.8);
  }
  15% {
    opacity: 0.7;
    transform: rotate(-15deg) scaleY(1) scaleX(1);
    filter: blur(3px) brightness(1.2);
  }
  25% {
    opacity: 0.9;
    transform: rotate(0deg) scaleY(1.05) scaleX(1.1);
    filter: blur(2px) brightness(1.5);
  }
  35% {
    opacity: 0.7;
    transform: rotate(15deg) scaleY(1) scaleX(1);
    filter: blur(3px) brightness(1.2);
  }
  45% {
    opacity: 0.3;
    transform: rotate(25deg) scaleY(0.8) scaleX(0.9);
    filter: blur(4px) brightness(0.8);
  }
  50% {
    opacity: 0;
    transform: rotate(25deg) scaleY(0) scaleX(0.8);
    filter: blur(5px) brightness(0.5);
  }
  100% {
    opacity: 0;
    transform: rotate(25deg) scaleY(0) scaleX(0.8);
    filter: blur(5px) brightness(0.5);
  }
}

/* ===== TROPHY ANIMATIONS ===== */
.trophy-glow {
  width: 150px;
  height: 150px;
  background: radial-gradient(
    circle,
    rgba(255, 203, 5, 0.6) 0%,
    rgba(255, 215, 0, 0.4) 30%,
    rgba(255, 165, 0, 0.2) 60%,
    transparent 100%
  );
  border-radius: 50%;
  animation: trophy-glow-pulse 2s ease-in-out infinite;
  filter: blur(20px);
}

@keyframes trophy-glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

.trophy-bounce {
  animation: trophy-bounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

@keyframes trophy-bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(-5deg);
  }
  50% {
    transform: translateY(-25px) rotate(0deg) scale(1.1);
  }
  75% {
    transform: translateY(-15px) rotate(5deg);
  }
}

/* ===== TEXT SHIMMER ANIMATIONS ===== */
.animate-title-shimmer {
  animation: title-shimmer 3s ease-in-out infinite;
  background-size: 200% auto;
}

@keyframes title-shimmer {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

/* ===== CERTIFICATE BADGE ANIMATION ===== */
.certificate-badge {
  animation: badge-shimmer 3s ease-in-out infinite, badge-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 203, 5, 0.5);
}

@keyframes badge-shimmer {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

@keyframes badge-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 203, 5, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 203, 5, 0.8), 0 0 40px rgba(255, 165, 0, 0.6);
  }
}
</style>
