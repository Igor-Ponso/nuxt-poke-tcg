<script setup lang="ts">
/**
 * Who's That Pokémon? Game Page
 *
 * Interactive guessing game with difficulty levels
 */

import { Icon } from '@iconify/vue'
import type { Difficulty } from '~/stores/game'

useHead({
  title: 'Who\'s That Pokémon? - PokéTCG',
  meta: [{ name: 'description', content: 'Test your Pokémon knowledge with this fun guessing game!' }],
})

const gameStore = useGameStore()

// Initialize game data on mount
onMounted(async () => {
  if (gameStore.selectedGenerations.length > 0) {
    await gameStore.initialize()
  }
})

// Watch for generation changes and reinitialize
watch(() => gameStore.selectedGenerations, async () => {
  if (!gameStore.isPlaying && gameStore.selectedGenerations.length > 0) {
    await gameStore.initialize()
  }
}, { deep: true })

// Start game
async function startGame() {
  await gameStore.startGame()
}

// End game
function endGame() {
  gameStore.endGame()
}

// Change difficulty
function changeDifficulty(difficulty: Difficulty) {
  gameStore.setDifficulty(difficulty)
}

// Difficulty options
const difficultyOptions = [
  { value: 'easy', label: 'Easy', icon: 'ph:smiley-fill', color: 'text-green-600', description: '2 options, 20s' },
  { value: 'medium', label: 'Medium', icon: 'ph:smiley-fill', color: 'text-blue-600', description: '4 options, 15s' },
  { value: 'hard', label: 'Hard', icon: 'ph:fire-fill', color: 'text-orange-600', description: '6 options, 10s' },
  { value: 'expert', label: 'Expert', icon: 'ph:lightning-fill', color: 'text-purple-600', description: '8 options, 8s' },
] as const
</script>

<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
        <Icon
          icon="ph:game-controller-duotone"
          class="w-12 h-12 text-blue-600"
        />
        Who's That Pokémon?
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Test your Pokémon knowledge! Guess the Pokémon from its silhouette before time runs out.
      </p>
    </div>

    <!-- Game not started - Menu -->
    <div
      v-if="!gameStore.isPlaying"
      class="max-w-4xl mx-auto space-y-6"
    >
      <!-- Difficulty Selection -->
      <UiCard
        variant="elevated"
        padding="lg"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Select Difficulty
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            v-for="option in difficultyOptions"
            :key="option.value"
            type="button"
            class="group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105"
            :class="{
              'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-4 ring-blue-500/20': gameStore.difficulty === option.value,
              'border-gray-300 dark:border-gray-600 hover:border-blue-500': gameStore.difficulty !== option.value,
            }"
            @click="changeDifficulty(option.value)"
          >
            <div class="text-center space-y-3">
              <!-- Icon -->
              <Icon
                :icon="option.icon"
                class="w-12 h-12 mx-auto transition-transform group-hover:scale-110"
                :class="option.color"
              />

              <!-- Label -->
              <div class="text-xl font-bold text-gray-900 dark:text-white">
                {{ option.label }}
              </div>

              <!-- Description -->
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ option.description }}
              </div>

              <!-- Selected indicator -->
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <div
                  v-if="gameStore.difficulty === option.value"
                  class="absolute top-3 right-3"
                >
                  <Icon
                    icon="ph:check-circle-fill"
                    class="w-6 h-6 text-blue-600"
                  />
                </div>
              </Transition>
            </div>
          </button>
        </div>
      </UiCard>

      <!-- Generation Selection -->
      <GenerationMultiSelector v-model="gameStore.selectedGenerations" />

      <!-- Best Stats Card -->
      <UiCard
        v-if="gameStore.stats.bestStreak > 0"
        variant="glass"
        padding="lg"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Your Best Records
        </h3>
        <div class="flex items-center justify-center gap-8 flex-wrap">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {{ gameStore.stats.bestStreak }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Best Streak
            </div>
          </div>
        </div>
      </UiCard>

      <!-- How to Play -->
      <UiCard
        variant="glass"
        padding="lg"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon
            icon="ph:info-fill"
            class="w-6 h-6 text-blue-600"
          />
          How to Play
        </h3>
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
          <li class="flex items-start gap-2">
            <Icon
              icon="ph:number-circle-one-fill"
              class="w-6 h-6 text-blue-600 flex-shrink-0"
            />
            <span>A Pokémon silhouette will appear on screen</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon
              icon="ph:number-circle-two-fill"
              class="w-6 h-6 text-blue-600 flex-shrink-0"
            />
            <span>Choose the correct Pokémon name from the options before time runs out</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon
              icon="ph:number-circle-three-fill"
              class="w-6 h-6 text-blue-600 flex-shrink-0"
            />
            <span>Build up your streak for bonus points!</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon
              icon="ph:number-circle-four-fill"
              class="w-6 h-6 text-blue-600 flex-shrink-0"
            />
            <span>Higher difficulties have more options and less time</span>
          </li>
        </ul>
      </UiCard>

      <!-- Start Button -->
      <div class="flex justify-center">
        <UiButton
          variant="primary"
          size="lg"
          class="text-xl px-12 py-4"
          :disabled="gameStore.selectedGenerations.length === 0"
          @click="startGame"
        >
          <Icon
            icon="ph:play-fill"
            class="w-6 h-6"
          />
          Start Game
        </UiButton>
      </div>
    </div>

    <!-- Game Active -->
    <div
      v-else
      class="max-w-5xl mx-auto space-y-6"
    >
      <!-- Game Controls -->
      <div class="flex items-center justify-between gap-4">
        <!-- Difficulty Badge -->
        <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon
            :icon="difficultyOptions.find(d => d.value === gameStore.difficulty)?.icon || 'ph:star-fill'"
            class="w-5 h-5"
            :class="difficultyOptions.find(d => d.value === gameStore.difficulty)?.color"
          />
          <span class="font-semibold text-gray-900 dark:text-white capitalize">
            {{ gameStore.difficulty }}
          </span>
        </div>

        <!-- End Game Button -->
        <UiButton
          variant="danger"
          size="sm"
          @click="endGame"
        >
          <Icon
            icon="ph:x-bold"
            class="w-4 h-4"
          />
          End Game
        </UiButton>
      </div>

      <!-- Game Component -->
      <WhosThatPokemon />
    </div>
  </div>
</template>
