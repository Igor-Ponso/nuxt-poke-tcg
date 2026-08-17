<script setup lang="ts">
/**
 * Who's That Pokémon Game Component
 *
 * Interactive guessing game with silhouette reveal and floating animation
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedPokemon } from '~/types'

const gameStore = useGameStore()

// Timer
let timerInterval: NodeJS.Timeout | null = null

// Animation state
const titleWords = ['Who\'s', 'That', 'Pokémon?']
const revealedWords = ref<number>(0)

// Certificate modal
const showCertificate = ref(false)

// Pokemon Cry Audio
const pokemonCryAudio = ref<HTMLAudioElement | null>(null)
const isPlayingCry = ref(false)

// Quick answer confetti effect
const showQuickAnswerConfetti = ref(false)
const wasQuickAnswer = ref(false)
const QUICK_ANSWER_THRESHOLD = 2 // seconds

// Pokemon details modal
const showPokemonDetails = ref(false)
const selectedPokemon = ref<SimplifiedPokemon | null>(null)

/**
 * Play Pokemon cry sound
 */
function playPokemonCry(pokemonId: number) {
  // Stop any currently playing cry
  if (pokemonCryAudio.value) {
    pokemonCryAudio.value.pause()
    pokemonCryAudio.value.currentTime = 0
  }

  // Create new audio instance
  const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`
  const audio = new Audio(cryUrl)
  audio.volume = 0.5 // Set volume to 50%

  audio.play().catch((error) => {
    console.warn('Failed to play Pokemon cry:', error)
  })

  // Track playing state
  isPlayingCry.value = true
  audio.onended = () => {
    isPlayingCry.value = false
  }

  pokemonCryAudio.value = audio
}

// Start title animation when game starts
watch(() => gameStore.currentRound, (newRound) => {
  if (newRound && !newRound.answered) {
    // Reset and animate title
    revealedWords.value = 0
    wasQuickAnswer.value = false // Reset quick answer badge
    animateTitle()
    // Delay timer start by 1 second to allow image to load
    setTimeout(() => {
      if (gameStore.currentRound && !gameStore.currentRound.answered) {
        startTimer()
      }
    }, 1000)
  }
  else {
    stopTimer()
  }
}, { immediate: true })

function animateTitle() {
  revealedWords.value = 0
  const interval = setInterval(() => {
    if (revealedWords.value < titleWords.length) {
      revealedWords.value++
    }
    else {
      clearInterval(interval)
    }
  }, 200) // 200ms between each word
}

function startTimer() {
  stopTimer()
  timerInterval = setInterval(() => {
    if (!gameStore.isPaused) {
      gameStore.decreaseTime()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function handleAnswer(pokemon: SimplifiedPokemon) {
  if (gameStore.currentRound?.answered) return

  const isCorrect = pokemon.id === gameStore.currentRound?.pokemon.id
  const timeElapsed = gameStore.difficultySettings.time - (gameStore.currentRound?.timeLeft || 0)
  const isQuickAnswer = timeElapsed <= QUICK_ANSWER_THRESHOLD

  gameStore.submitAnswer(pokemon)
  stopTimer()

  // Play Pokemon cry if answer is correct
  if (isCorrect && gameStore.currentRound?.pokemon.id) {
    // Track if it was a quick answer for badge display
    wasQuickAnswer.value = isQuickAnswer

    // Trigger confetti for quick answers!
    if (isQuickAnswer) {
      showQuickAnswerConfetti.value = true
      setTimeout(() => {
        showQuickAnswerConfetti.value = false
      }, 3500) // Allow full confetti animation to complete
    }

    // Small delay to let the reveal animation start
    setTimeout(() => {
      playPokemonCry(gameStore.currentRound!.pokemon.id)
    }, 300)
  }
  else {
    wasQuickAnswer.value = false
  }
}

function handleNextRound() {
  // Check if player completed all Pokemon before generating next round
  if (gameStore.caughtEmAll) {
    showCertificate.value = true
    return
  }

  gameStore.nextRound()
}

function handleCertificateClose() {
  showCertificate.value = false
  gameStore.endGame()
}

function handlePlayAgain() {
  showCertificate.value = false
  gameStore.startGame()
}

function viewPokemonDetails() {
  if (gameStore.currentRound?.pokemon) {
    selectedPokemon.value = gameStore.currentRound.pokemon
    showPokemonDetails.value = true
  }
}

function closePokemonDetails() {
  showPokemonDetails.value = false
  selectedPokemon.value = null
}

// Get pokemon image
function getPokemonImage(pokemon: SimplifiedPokemon) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
}

// Background image URL with baseURL support
const { app } = useRuntimeConfig()
const backgroundImageUrl = computed(() => `url('${app.baseURL}images/whos_that_pokemon_bg.webp')`)

// Dev tools hack to show certificate for testing
onMounted(() => {
  (window as unknown as Record<string, unknown>).showPokemonCertificate = () => {
    showCertificate.value = true
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopTimer()
  // Clean up audio
  if (pokemonCryAudio.value) {
    pokemonCryAudio.value.pause()
    pokemonCryAudio.value = null
  }
  // Clean up dev tools command
  delete (window as unknown as Record<string, unknown>).showPokemonCertificate
})

// Time percentage for progress bar
const timePercentage = computed(() => {
  if (!gameStore.currentRound) return 100
  return (gameStore.currentRound.timeLeft / gameStore.difficultySettings.time) * 100
})

// Time color based on remaining time
const timeColor = computed(() => {
  const percentage = timePercentage.value
  if (percentage > 50) return 'bg-green-500'
  if (percentage > 25) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Game Header - Stats Bar -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <!-- Score -->
      <div class="flex-1 min-w-[140px] bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-500/20 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-400/30 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2">
            <Icon
              icon="ph:star-fill"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
            <div class="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Score
            </div>
          </div>
          <div class="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
            {{ gameStore.stats.score }}
          </div>
        </div>
      </div>

      <!-- Streak -->
      <div class="flex-1 min-w-[140px] bg-gradient-to-br from-orange-500/10 to-red-600/10 dark:from-orange-400/20 dark:to-red-500/20 backdrop-blur-sm border-2 border-orange-500/30 dark:border-orange-400/30 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2">
            <Icon
              icon="ph:fire-fill"
              class="w-5 h-5 text-orange-600 dark:text-orange-400"
              :class="{ 'animate-pulse': gameStore.stats.streak > 0 }"
            />
            <div class="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
              Streak
            </div>
          </div>
          <div class="text-3xl font-black text-orange-600 dark:text-orange-400 tabular-nums flex items-center justify-center gap-2">
            {{ gameStore.stats.streak }}
          </div>
        </div>
      </div>

      <!-- Accuracy -->
      <div class="flex-1 min-w-[140px] bg-gradient-to-br from-green-500/10 to-emerald-600/10 dark:from-green-400/20 dark:to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30 dark:border-green-400/30 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2">
            <Icon
              icon="ph:target-fill"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
            <div class="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
              Accuracy
            </div>
          </div>
          <div class="text-3xl font-black text-green-600 dark:text-green-400 tabular-nums">
            {{ gameStore.stats.accuracy.toFixed(0) }}%
          </div>
        </div>
      </div>

      <!-- Best Streak -->
      <div class="flex-1 min-w-[140px] bg-gradient-to-br from-purple-500/10 to-pink-600/10 dark:from-purple-400/20 dark:to-pink-500/20 backdrop-blur-sm border-2 border-purple-500/30 dark:border-purple-400/30 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2">
            <Icon
              icon="ph:trophy-fill"
              class="w-5 h-5 text-purple-600 dark:text-purple-400"
            />
            <div class="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
              Best Streak
            </div>
          </div>
          <div class="text-3xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
            {{ gameStore.stats.bestStreak }}
          </div>
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <UiCard
      v-if="gameStore.currentRound"
      variant="elevated"
      padding="none"
      class="overflow-hidden"
    >
      <!-- Background Image -->
      <div
        class="relative bg-cover bg-center min-h-[600px]"
        :style="{ backgroundImage: backgroundImageUrl }"
      >
        <!-- Overlay for better readability - lighter on desktop to show background animation -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40 md:from-black/20 md:via-black/5 md:to-black/30 pointer-events-none" />

        <!-- Content Container -->
        <div class="relative z-10 p-8 space-y-8">
          <!-- Timer Bar -->
          <div class="max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-white drop-shadow-lg">
                Time Left
              </span>
              <span class="text-lg font-bold text-white drop-shadow-lg">
                {{ gameStore.currentRound.timeLeft }}s
              </span>
            </div>
            <div class="w-full bg-black/50 backdrop-blur-sm rounded-full h-4 overflow-hidden border-2 border-white/30">
              <div
                class="h-full transition-all duration-1000 ease-linear rounded-full"
                :class="timeColor"
                :style="{ width: `${timePercentage}%` }"
              />
            </div>
          </div>

          <!-- Pokemon Display & Title - Side by Side -->
          <div class="flex items-center justify-center gap-8 lg:gap-16 flex-col lg:flex-row">
            <!-- Pokemon Image with Float Animation (Left Side) -->
            <div class="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center flex-shrink-0">
              <Transition
                enter-active-class="transition duration-500 ease-out"
                enter-from-class="scale-0 rotate-180 opacity-0"
                enter-to-class="scale-100 rotate-0 opacity-100"
                leave-active-class="transition duration-300 ease-in"
                leave-from-class="scale-100 rotate-0 opacity-100"
                leave-to-class="scale-0 -rotate-180 opacity-0"
                mode="out-in"
              >
                <img
                  :key="gameStore.currentRound.pokemon.id"
                  :src="getPokemonImage(gameStore.currentRound.pokemon)"
                  :alt="gameStore.currentRound.revealed ? gameStore.currentRound.pokemon.name : '???'"
                  class="w-full h-full object-contain transition-all duration-500"
                  :class="{
                    'pokemon-silhouette float-animation': !gameStore.currentRound.revealed,
                    'drop-shadow-2xl scale-110 reveal-animation': gameStore.currentRound.revealed && gameStore.currentRound.correct,
                    'drop-shadow-2xl float-animation': gameStore.currentRound.revealed,
                  }"
                >
              </Transition>
            </div>

            <!-- Title (Right Side) -->
            <div class="flex items-center justify-center">
              <Transition
                enter-active-class="transition duration-500"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                mode="out-in"
              >
                <div
                  v-if="!gameStore.currentRound.revealed"
                  class="flex flex-col items-start gap-2"
                >
                  <div
                    v-for="(word, index) in titleWords"
                    :key="index"
                    class="pokemon-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none"
                    :class="{ 'word-reveal': index < revealedWords }"
                    style="color: #FFCB05; text-shadow: 4px 4px 0 #3B4CCA, -2px -2px 0 #000000;"
                  >
                    {{ word }}
                  </div>
                </div>
                <div
                  v-else
                  class="space-y-3 text-center lg:text-left"
                >
                  <!-- Pokemon Name Reveal (larger, two lines) -->
                  <div class="space-y-1">
                    <p class="text-3xl sm:text-4xl text-white drop-shadow-lg">
                      It's
                    </p>
                    <p
                      class="text-5xl sm:text-6xl md:text-7xl font-bold capitalize pokemon-title drop-shadow-2xl"
                      style="color: #FFCB05; text-shadow: 3px 3px 0 #3B4CCA, -2px -2px 0 #000000;"
                    >
                      {{ gameStore.currentRound.pokemon.name }}!
                    </p>
                  </div>

                  <div
                    v-if="gameStore.currentRound.correct"
                    class="space-y-3"
                  >
                    <!-- Quick Answer Lightning Badge -->
                    <LightningBadge :show="wasQuickAnswer" />

                    <!-- Points -->
                    <div class="text-xl text-yellow-300 font-semibold drop-shadow-lg">
                      +{{ gameStore.roundPoints }} points!
                    </div>

                    <!-- View Details Button -->
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
                      @click="viewPokemonDetails"
                    >
                      <Icon
                        icon="ph:info-fill"
                        class="w-5 h-5"
                      />
                      <span class="font-semibold">View Details</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Options Section -->
      <div class="p-6 bg-gray-50 dark:bg-gray-900">
        <div class="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <button
            v-for="option in gameStore.currentRound.options"
            :key="option.id"
            type="button"
            :disabled="gameStore.currentRound.answered"
            class="group relative p-4 rounded-xl border-2 transition-all duration-300 disabled:cursor-not-allowed"
            :class="{
              'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105': !gameStore.currentRound.answered,
              'border-green-500 bg-green-50 dark:bg-green-900/30 ring-4 ring-green-500/20 scale-105': gameStore.currentRound.revealed && option.id === gameStore.currentRound.pokemon.id,
              'border-red-500 bg-red-50 dark:bg-red-900/30 opacity-50': gameStore.currentRound.revealed && gameStore.currentRound.correct === false && option.id !== gameStore.currentRound.pokemon.id,
              'border-gray-300 dark:border-gray-600 opacity-50': gameStore.currentRound.revealed && option.id !== gameStore.currentRound.pokemon.id && gameStore.currentRound.correct !== false,
            }"
            @click="handleAnswer(option)"
          >
            <div class="flex items-center gap-3">
              <!-- Pokemon mini sprite - Hidden on HARD and EXPERT -->
              <img
                v-if="gameStore.difficulty !== 'hard' && gameStore.difficulty !== 'expert'"
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${option.id}.png`"
                :alt="option.name"
                class="w-12 h-12 object-contain"
              >

              <!-- Pokemon name -->
              <span
                class="text-base sm:text-lg font-semibold capitalize text-gray-900 dark:text-white"
                :class="{ 'text-center w-full': gameStore.difficulty === 'hard' || gameStore.difficulty === 'expert' }"
              >
                {{ option.name }}
              </span>
            </div>

            <!-- Correct indicator with Cry button -->
            <div
              v-if="gameStore.currentRound.revealed && option.id === gameStore.currentRound.pokemon.id"
              class="absolute top-2 right-2 flex items-center gap-2"
            >
              <Icon
                icon="ph:check-circle-fill"
                class="w-6 h-6 text-green-600"
              />
              <!-- Cry replay button -->
              <button
                type="button"
                class="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-110 shadow-md"
                :class="{ 'animate-pulse': isPlayingCry }"
                :title="'Play ' + option.name + ' cry'"
                @click.stop="playPokemonCry(option.id)"
              >
                <Icon
                  icon="ph:speaker-high-fill"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </button>
        </div>

        <!-- Next Round / Start New Game Button -->
        <Transition
          enter-active-class="transition duration-500"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="gameStore.currentRound.answered"
            class="mt-6 flex justify-center"
          >
            <!-- Show "Next Round" if answer was correct -->
            <UiButton
              v-if="gameStore.currentRound.correct"
              variant="primary"
              size="lg"
              @click="handleNextRound"
            >
              <Icon
                icon="ph:arrow-right-bold"
                class="w-5 h-5"
              />
              Next Round
            </UiButton>

            <!-- Show "Start New Game" if answer was wrong -->
            <UiButton
              v-else
              variant="primary"
              size="lg"
              @click="handlePlayAgain"
            >
              <Icon
                icon="ph:play-fill"
                class="w-5 h-5"
              />
              Start New Game
            </UiButton>
          </div>
        </Transition>
      </div>
    </UiCard>

    <!-- No round active -->
    <UiCard
      v-else
      variant="elevated"
      padding="lg"
    >
      <div class="text-center py-12">
        <Icon
          icon="ph:game-controller-duotone"
          class="w-24 h-24 mx-auto mb-4 text-gray-400"
        />
        <p class="text-xl text-gray-600 dark:text-gray-400">
          No active round. Start a new game!
        </p>
      </div>
    </UiCard>

    <!-- Pokemon Master Certificate Modal -->
    <PokemonMasterCertificate
      :show="showCertificate"
      :pokemon-count="gameStore.totalPokemonCount"
      :selected-generations="gameStore.selectedGenerations"
      :score="gameStore.stats.score"
      :accuracy="gameStore.stats.accuracy"
      @close="handleCertificateClose"
      @play-again="handlePlayAgain"
    />

    <!-- Quick Answer Confetti Effect -->
    <ConfettiEffect :show="showQuickAnswerConfetti" />

    <!-- Pokemon Details Modal -->
    <PokemonModal
      :pokemon="selectedPokemon"
      :show="showPokemonDetails"
      @close="closePokemonDetails"
    />
  </div>
</template>

<style>
@font-face {
  font-family: 'Pokemon Solid';
  src: url('/fonts/PokemonSolid.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>

<style scoped>
.pokemon-title {
  font-family: 'Pokemon Solid', sans-serif !important;
  letter-spacing: 2px;
}

/* Pokemon silhouette style - official anime style */
.pokemon-silhouette {
  filter: brightness(0) saturate(100%) invert(20%) sepia(15%) saturate(1500%) hue-rotate(180deg) drop-shadow(6px 6px 0px rgba(0, 0, 0, 0.6)) drop-shadow(8px 8px 2px rgba(0, 0, 0, 0.4));
}

/* Float animation for Pokemon silhouette */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

/* Reveal animation */
@keyframes reveal {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.reveal-animation {
  animation: reveal 0.6s ease-out forwards;
}

/* Word reveal animation */
.word-reveal {
  animation: wordPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

@keyframes wordPop {
  0% {
    transform: scale(0) translateY(20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
