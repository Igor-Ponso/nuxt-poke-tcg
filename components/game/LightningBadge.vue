<script setup lang="ts">
/**
 * Lightning Badge Component
 *
 * Spectacular lightning bolt effect for quick answers
 */

import { Icon } from '@iconify/vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

// Generate random lightning bolts for electric effect
interface ElectricBolt {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  delay: number
  duration: number
}

const electricBolts = ref<ElectricBolt[]>([])

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    generateElectricBolts()
  } else {
    electricBolts.value = []
  }
})

function generateElectricBolts() {
  const bolts: ElectricBolt[] = []

  // Generate 8 electric bolts around the badge
  for (let i = 0; i < 8; i++) {
    bolts.push({
      id: i,
      startX: 50 + Math.random() * 20 - 10,
      startY: 50 + Math.random() * 20 - 10,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.3 + Math.random() * 0.3,
    })
  }

  electricBolts.value = bolts
}

onMounted(() => {
  if (props.show) {
    generateElectricBolts()
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 scale-50"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-50"
  >
    <div
      v-if="show"
      class="relative inline-flex items-center gap-2 px-6 py-3"
    >
      <!-- Electric background glow -->
      <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full blur-xl opacity-80 animate-pulse-fast" />
      <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-full animate-electric-pulse" />

      <!-- Electric sparks container -->
      <div class="absolute inset-0 overflow-visible">
        <!-- Animated electric bolts -->
        <svg
          v-for="bolt in electricBolts"
          :key="`bolt-${bolt.id}`"
          class="absolute inset-0 w-full h-full pointer-events-none electric-bolt"
          :style="{
            animationDelay: `${bolt.delay}s`,
            animationDuration: `${bolt.duration}s`,
          }"
        >
          <line
            :x1="`${bolt.startX}%`"
            :y1="`${bolt.startY}%`"
            :x2="`${bolt.endX}%`"
            :y2="`${bolt.endY}%`"
            stroke="url(#lightning-gradient)"
            stroke-width="2"
            stroke-linecap="round"
          />
          <defs>
            <linearGradient
              id="lightning-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style="stop-color:#FFD700;stop-opacity:0"
              />
              <stop
                offset="50%"
                style="stop-color:#FFF;stop-opacity:1"
              />
              <stop
                offset="100%"
                style="stop-color:#FFD700;stop-opacity:0"
              />
            </linearGradient>
          </defs>
        </svg>

        <!-- Corner lightning sparks -->
        <div class="absolute -top-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-spark" style="animation-delay: 0s;" />
        <div class="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-spark" style="animation-delay: 0.2s;" />
        <div class="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-300 rounded-full animate-spark" style="animation-delay: 0.4s;" />
        <div class="absolute -bottom-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-spark" style="animation-delay: 0.6s;" />
      </div>

      <!-- Content (on top of effects) -->
      <div class="relative z-10 flex items-center gap-2">
        <!-- Left lightning bolt icon with shake -->
        <Icon
          icon="ph:lightning-fill"
          class="w-6 h-6 text-white drop-shadow-lg animate-lightning-shake"
        />

        <!-- Text with electric glow -->
        <span class="text-lg font-black text-white tracking-wider uppercase drop-shadow-lg animate-text-glow">
          LIGHTNING FAST!
        </span>

        <!-- Right lightning bolt icon with shake (delayed) -->
        <Icon
          icon="ph:lightning-fill"
          class="w-6 h-6 text-white drop-shadow-lg animate-lightning-shake"
          style="animation-delay: 0.15s;"
        />
      </div>

      <!-- Radiating rings -->
      <div class="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ring-1" />
      <div class="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ring-2" />
      <div class="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ring-3" />
    </div>
  </Transition>
</template>

<style scoped>
/* Fast pulse animation */
@keyframes pulse-fast {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.animate-pulse-fast {
  animation: pulse-fast 0.5s ease-in-out infinite;
}

/* Electric pulse animation */
@keyframes electric-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

.animate-electric-pulse {
  animation: electric-pulse 0.3s ease-in-out infinite;
}

/* Electric bolt flash */
@keyframes electric-bolt {
  0%, 100% {
    opacity: 0;
  }
  10%, 30%, 50% {
    opacity: 1;
  }
  20%, 40% {
    opacity: 0.3;
  }
}

.electric-bolt {
  animation: electric-bolt 0.6s ease-in-out infinite;
}

/* Spark animation */
@keyframes spark {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

.animate-spark {
  animation: spark 0.8s ease-in-out infinite;
}

/* Lightning shake */
@keyframes lightning-shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10% {
    transform: translateX(-2px) rotate(-5deg);
  }
  20% {
    transform: translateX(2px) rotate(5deg);
  }
  30% {
    transform: translateX(-2px) rotate(-5deg);
  }
  40% {
    transform: translateX(2px) rotate(5deg);
  }
  50% {
    transform: translateX(0) rotate(0deg);
  }
}

.animate-lightning-shake {
  animation: lightning-shake 0.5s ease-in-out infinite;
}

/* Text glow */
@keyframes text-glow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6);
  }
}

.animate-text-glow {
  animation: text-glow 0.5s ease-in-out infinite;
}

/* Radiating rings */
@keyframes ring-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ring-1 {
  animation: ring-pulse 1s ease-out infinite;
  animation-delay: 0s;
}

.animate-ring-2 {
  animation: ring-pulse 1s ease-out infinite;
  animation-delay: 0.3s;
}

.animate-ring-3 {
  animation: ring-pulse 1s ease-out infinite;
  animation-delay: 0.6s;
}
</style>
