/**
 * Game Store
 *
 * Manages "Who's That Pokémon?" game state
 */

import { defineStore } from 'pinia'
import type { SimplifiedPokemon } from '~/types'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface GameStats {
  score: number
  streak: number
  bestStreak: number
  totalCorrect: number
  totalWrong: number
  accuracy: number
}

export interface GameRound {
  pokemon: SimplifiedPokemon
  options: SimplifiedPokemon[]
  revealed: boolean
  answered: boolean
  correct: boolean | null
  timeLeft: number
}

export const useGameStore = defineStore('game', {
  state: () => ({
    // Game state
    isPlaying: false,
    isPaused: false,
    difficulty: 'medium' as Difficulty,

    // Current round
    currentRound: null as GameRound | null,

    // Stats
    stats: {
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalWrong: 0,
      accuracy: 0,
    } as GameStats,

    // Settings
    soundEnabled: true,
    timeLimit: 15, // seconds per round
    selectedGenerations: [1, 2, 3, 4, 5, 6, 7, 8, 9] as number[], // All generations by default

    // Pokemon pool
    availablePokemons: [] as SimplifiedPokemon[], // Currently loaded Pokemon pool
    usedPokemonIds: new Set<number>(), // Track used Pokemon to avoid repetition

    // Lazy loading state per generation
    generationProgress: new Map<number, { loaded: number, total: number }>(), // Track how many loaded per gen
    loadedPokemonIds: new Map<number, Set<number>>(), // Track which specific Pokemon IDs loaded per generation
    isLoadingMore: false, // Prevent concurrent loads
  }),

  getters: {
    /**
     * Get difficulty settings
     */
    difficultySettings(): { options: number, time: number, pointsMultiplier: number } {
      const settings = {
        easy: { options: 2, time: 20, pointsMultiplier: 1 },
        medium: { options: 4, time: 15, pointsMultiplier: 1.5 },
        hard: { options: 6, time: 10, pointsMultiplier: 2 },
        expert: { options: 8, time: 8, pointsMultiplier: 3 },
      }
      return settings[this.difficulty]
    },

    /**
     * Calculate points for current round
     */
    roundPoints(): number {
      if (!this.currentRound) return 0

      const basePoints = 100
      const timeBonus = Math.floor((this.currentRound.timeLeft / this.timeLimit) * 50)
      const streakBonus = Math.min(this.stats.streak * 10, 100)
      const multiplier = this.difficultySettings.pointsMultiplier

      return Math.floor((basePoints + timeBonus + streakBonus) * multiplier)
    },

    /**
     * Get unused Pokemon (not yet shown in this game session)
     */
    unusedPokemons(): SimplifiedPokemon[] {
      return this.availablePokemons.filter(p => !this.usedPokemonIds.has(p.id))
    },

    /**
     * Check if player caught all Pokemon (completed all available Pokemon from all selected generations)
     */
    caughtEmAll(): boolean {
      // Check if all generations are fully loaded and all Pokemon used
      let allGenerationsComplete = true
      for (const progress of this.generationProgress.values()) {
        if (progress.loaded < progress.total) {
          allGenerationsComplete = false
          break
        }
      }

      // Only true if all generations fully loaded AND all Pokemon used
      return allGenerationsComplete && this.availablePokemons.length > 0 && this.usedPokemonIds.size === this.availablePokemons.length
    },

    /**
     * Get total Pokemon count across all selected generations
     */
    totalPokemonCount(): number {
      let total = 0
      for (const [_, progress] of this.generationProgress) {
        total += progress.total
      }
      return total
    },
  },

  actions: {
    /**
     * Initialize game - load initial batch of Pokemon from selected generations
     */
    async initialize() {
      const { GENERATIONS } = await import('~/utils/constants')
      const api = usePokemonApi()

      // Reset state
      this.availablePokemons = []
      this.generationProgress.clear()
      this.loadedPokemonIds.clear()

      // Initialize progress tracking for each selected generation
      for (const genId of this.selectedGenerations) {
        const gen = GENERATIONS.find(g => g.id === genId)
        if (gen) {
          const total = gen.range.end - gen.range.start + 1
          this.generationProgress.set(genId, { loaded: 0, total })
          this.loadedPokemonIds.set(genId, new Set<number>())
        }
      }

      // Load initial batch: 10 RANDOM Pokemon from each selected generation
      const initialIds: number[] = []

      for (const genId of this.selectedGenerations) {
        const gen = GENERATIONS.find(g => g.id === genId)
        if (gen) {
          const totalInGen = gen.range.end - gen.range.start + 1
          const batchSize = Math.min(10, totalInGen)
          const loadedIds = this.loadedPokemonIds.get(genId)!

          // Generate random Pokemon IDs from this generation
          while (loadedIds.size < batchSize) {
            const randomOffset = Math.floor(Math.random() * totalInGen)
            const randomId = gen.range.start + randomOffset
            loadedIds.add(randomId)
          }

          // Add to initial batch
          initialIds.push(...Array.from(loadedIds))

          // Update progress
          const progress = this.generationProgress.get(genId)
          if (progress) {
            progress.loaded = batchSize
          }
        }
      }

      // Fetch initial batch and simplify
      const pokemonData = await api.fetchPokemonBatch(initialIds)
      this.availablePokemons = pokemonData.map(p => api.simplifyPokemon(p))
    },

    /**
     * Load more RANDOM Pokemon from a specific generation when running low
     */
    async loadMoreFromGeneration(genId: number) {
      if (this.isLoadingMore) return

      const { GENERATIONS } = await import('~/utils/constants')
      const api = usePokemonApi()
      const gen = GENERATIONS.find(g => g.id === genId)
      const progress = this.generationProgress.get(genId)
      const loadedIds = this.loadedPokemonIds.get(genId)

      if (!gen || !progress || !loadedIds || progress.loaded >= progress.total) return

      this.isLoadingMore = true

      try {
        // Load next 10 RANDOM Pokemon from this generation (not yet loaded)
        const batchSize = Math.min(10, progress.total - progress.loaded)
        const totalInGen = gen.range.end - gen.range.start + 1
        const idsToLoad: number[] = []

        // Generate random Pokemon IDs that haven't been loaded yet
        while (idsToLoad.length < batchSize) {
          const randomOffset = Math.floor(Math.random() * totalInGen)
          const randomId = gen.range.start + randomOffset

          // Only add if not already loaded
          if (!loadedIds.has(randomId)) {
            idsToLoad.push(randomId)
            loadedIds.add(randomId)
          }
        }

        // Fetch new Pokemon and simplify
        const pokemonData = await api.fetchPokemonBatch(idsToLoad)
        const simplified = pokemonData.map(p => api.simplifyPokemon(p))
        this.availablePokemons.push(...simplified)

        // Update progress
        progress.loaded += batchSize
      }
      finally {
        this.isLoadingMore = false
      }
    },

    /**
     * Start new game
     */
    async startGame() {
      this.isPlaying = true
      this.isPaused = false
      this.usedPokemonIds.clear() // Reset used Pokemon
      this.stats = {
        score: 0,
        streak: 0,
        bestStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0,
      }
      await this.generateRound()
    },

    /**
     * Generate new round with smart lazy loading
     */
    async generateRound() {
      if (this.availablePokemons.length === 0) return

      // Get unused Pokemon for the correct answer
      const unusedPool = this.unusedPokemons

      // Check if we need to load more Pokemon
      // Load more when we have less than 5 unused Pokemon from any generation
      if (unusedPool.length < 5 && !this.isLoadingMore) {
        await this.checkAndLoadMore()
      }

      // After potential load, check again
      const currentUnusedPool = this.unusedPokemons

      // If all Pokemon have been used from all selected generations, player completed!
      if (currentUnusedPool.length === 0) {
        // Check if all generations are fully loaded
        let allGenerationsComplete = true
        for (const progress of this.generationProgress.values()) {
          if (progress.loaded < progress.total) {
            allGenerationsComplete = false
            break
          }
        }

        if (allGenerationsComplete) {
          // True completion - all Pokemon from all selected generations used
          return
        }
        else {
          // Some generations not fully loaded, try loading more
          await this.checkAndLoadMore()
          // Try again
          if (this.unusedPokemons.length === 0) return
        }
      }

      // Select random unused pokemon as the correct answer
      const finalUnusedPool = this.unusedPokemons
      const correctPokemon = finalUnusedPool[
        Math.floor(Math.random() * finalUnusedPool.length)
      ]

      if (!correctPokemon) return

      // Mark this Pokemon as used
      this.usedPokemonIds.add(correctPokemon.id)

      // Generate wrong options from ALL available Pokemon (can be used or unused)
      const optionsCount = this.difficultySettings.options
      const wrongOptions: SimplifiedPokemon[] = []

      while (wrongOptions.length < optionsCount - 1) {
        const randomPokemon = this.availablePokemons[
          Math.floor(Math.random() * this.availablePokemons.length)
        ]

        // Ensure it exists, it's not the correct answer and not already added
        if (
          randomPokemon
          && randomPokemon.id !== correctPokemon.id
          && !wrongOptions.find(p => p.id === randomPokemon.id)
        ) {
          wrongOptions.push(randomPokemon)
        }
      }

      // Combine and shuffle options
      const allOptions: SimplifiedPokemon[] = [correctPokemon, ...wrongOptions]
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)

      this.currentRound = {
        pokemon: correctPokemon,
        options: shuffledOptions,
        revealed: false,
        answered: false,
        correct: null,
        timeLeft: this.difficultySettings.time,
      }
    },

    /**
     * Check if we need to load more Pokemon and load them
     */
    async checkAndLoadMore() {
      // Find generations that have more Pokemon to load
      for (const genId of this.selectedGenerations) {
        const progress = this.generationProgress.get(genId)
        if (progress && progress.loaded < progress.total) {
          await this.loadMoreFromGeneration(genId)
          break // Load from one generation at a time to avoid overwhelming
        }
      }
    },

    /**
     * Submit answer
     */
    submitAnswer(selectedPokemon: SimplifiedPokemon) {
      if (!this.currentRound || this.currentRound.answered) return

      const isCorrect = selectedPokemon.id === this.currentRound.pokemon.id

      this.currentRound.answered = true
      this.currentRound.correct = isCorrect
      this.currentRound.revealed = true

      if (isCorrect) {
        // Correct answer
        this.stats.totalCorrect++
        this.stats.streak++
        this.stats.score += this.roundPoints

        if (this.stats.streak > this.stats.bestStreak) {
          this.stats.bestStreak = this.stats.streak
        }
      }
      else {
        // Wrong answer
        this.stats.totalWrong++
        this.stats.streak = 0
      }

      // Update accuracy
      const total = this.stats.totalCorrect + this.stats.totalWrong
      this.stats.accuracy = total > 0 ? (this.stats.totalCorrect / total) * 100 : 0
    },

    /**
     * Next round
     */
    async nextRound() {
      await this.generateRound()
    },

    /**
     * Decrease time for current round
     */
    decreaseTime() {
      if (!this.currentRound || this.currentRound.answered) return

      this.currentRound.timeLeft--

      if (this.currentRound.timeLeft <= 0) {
        // Time's up - count as wrong answer
        this.currentRound.answered = true
        this.currentRound.correct = false
        this.currentRound.revealed = true
        this.stats.totalWrong++
        this.stats.streak = 0

        const total = this.stats.totalCorrect + this.stats.totalWrong
        this.stats.accuracy = total > 0 ? (this.stats.totalCorrect / total) * 100 : 0
      }
    },

    /**
     * Pause/Resume game
     */
    togglePause() {
      this.isPaused = !this.isPaused
    },

    /**
     * End game
     */
    endGame() {
      this.isPlaying = false
      this.currentRound = null
    },

    /**
     * Change difficulty
     */
    setDifficulty(difficulty: Difficulty) {
      this.difficulty = difficulty
    },

    /**
     * Toggle sound
     */
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
    },

    /**
     * Reset stats
     */
    resetStats() {
      this.stats = {
        score: 0,
        streak: 0,
        bestStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0,
      }
    },

    /**
     * Toggle generation selection
     */
    toggleGeneration(generation: number) {
      const index = this.selectedGenerations.indexOf(generation)
      if (index === -1) {
        this.selectedGenerations.push(generation)
      }
      else {
        this.selectedGenerations.splice(index, 1)
      }
      // Sort generations
      this.selectedGenerations.sort((a, b) => a - b)
    },

    /**
     * Select all generations
     */
    selectAllGenerations() {
      this.selectedGenerations = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },

    /**
     * Deselect all generations
     */
    deselectAllGenerations() {
      this.selectedGenerations = []
    },
  },
})
