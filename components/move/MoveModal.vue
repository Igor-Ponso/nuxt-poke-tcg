<script setup lang="ts">
/**
 * MoveModal Component
 *
 * Display detailed move information in a modal dialog
 */

import { Icon } from '@iconify/vue'
import type { Move, PokemonType } from '~/types'

interface Props {
  move: Move | null
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

/**
 * Get category icon and color
 */
const categoryConfig = computed(() => {
  if (!props.move) return null

  const configs = {
    physical: {
      icon: 'ph:sword-bold',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      label: 'Physical',
    },
    special: {
      icon: 'ph:sparkle-bold',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      label: 'Special',
    },
    status: {
      icon: 'ph:gear-bold',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500',
      label: 'Status',
    },
  }

  const damageClass = props.move.damage_class.name as keyof typeof configs
  return configs[damageClass] || configs.status
})

/**
 * Format move name for display
 */
const displayName = computed(() => {
  if (!props.move) return ''
  return props.move.name.replace(/-/g, ' ')
})

/**
 * Get English effect text
 */
const effectText = computed(() => {
  if (!props.move) return ''
  const englishEffect = props.move.effect_entries.find(entry => entry.language.name === 'en')
  return englishEffect?.effect || 'No description available'
})

/**
 * Get English short effect
 */
const shortEffect = computed(() => {
  if (!props.move) return ''
  const englishEffect = props.move.effect_entries.find(entry => entry.language.name === 'en')
  return englishEffect?.short_effect || effectText.value
})

/**
 * Get generation name
 */
const generation = computed(() => {
  if (!props.move) return ''
  return props.move.generation.name.replace('generation-', 'Gen ').toUpperCase()
})

/**
 * Get flavor text (description from games)
 */
const flavorText = computed(() => {
  if (!props.move || !props.move.flavor_text_entries) return ''
  const englishFlavor = props.move.flavor_text_entries
    .filter(entry => entry.language.name === 'en')
    .slice(-1)[0] // Get the most recent one
  return englishFlavor?.flavor_text || ''
})

/**
 * Handle modal close
 */
function handleClose() {
  emit('close')
}

/**
 * Handle backdrop click
 */
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

/**
 * Handle escape key
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
  }
}

// Add/remove event listener for escape key
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleKeydown)
  }
  else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && move"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="handleClose"
            >
              <Icon
                icon="ph:x-bold"
                class="w-6 h-6 text-gray-600 dark:text-gray-400"
              />
            </button>

            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-gray-900 dark:text-white capitalize mb-2">
                    {{ displayName }}
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    #{{ move.id.toString().padStart(4, '0') }} • {{ generation }}
                  </p>
                </div>

                <!-- Type and Category -->
                <div class="flex flex-col gap-2">
                  <PokemonTypeTag
                    :type="move.type.name as PokemonType"
                    size="md"
                  />
                  <div
                    v-if="categoryConfig"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-bold"
                    :class="categoryConfig.bgColor"
                  >
                    <Icon
                      :icon="categoryConfig.icon"
                      class="w-4 h-4"
                    />
                    <span>{{ categoryConfig.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Stats Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Power -->
                <UiCard
                  variant="glass"
                  padding="md"
                >
                  <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Power
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ move.power ?? '—' }}
                    </div>
                  </div>
                </UiCard>

                <!-- Accuracy -->
                <UiCard
                  variant="glass"
                  padding="md"
                >
                  <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Accuracy
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ move.accuracy ? `${move.accuracy}%` : '—' }}
                    </div>
                  </div>
                </UiCard>

                <!-- PP -->
                <UiCard
                  variant="glass"
                  padding="md"
                >
                  <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      PP
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ move.pp }}
                    </div>
                  </div>
                </UiCard>

                <!-- Priority -->
                <UiCard
                  variant="glass"
                  padding="md"
                >
                  <div class="text-center">
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Priority
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ move.priority > 0 ? `+${move.priority}` : move.priority }}
                    </div>
                  </div>
                </UiCard>
              </div>

              <!-- Short Effect -->
              <UiCard variant="glass">
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon
                      icon="ph:info-bold"
                      class="w-5 h-5"
                    />
                    Effect
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ shortEffect }}
                  </p>
                </div>
              </UiCard>

              <!-- Full Description -->
              <UiCard variant="glass">
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon
                      icon="ph:book-open-bold"
                      class="w-5 h-5"
                    />
                    Description
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {{ effectText }}
                  </p>
                </div>
              </UiCard>

              <!-- Flavor Text -->
              <UiCard
                v-if="flavorText"
                variant="glass"
              >
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon
                      icon="ph:game-controller-bold"
                      class="w-5 h-5"
                    />
                    In-Game Description
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 text-sm italic">
                    "{{ flavorText }}"
                  </p>
                </div>
              </UiCard>

              <!-- Additional Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Target -->
                <UiCard
                  variant="glass"
                  padding="sm"
                >
                  <div class="flex items-center gap-2">
                    <Icon
                      icon="ph:crosshair-bold"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                    />
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Target
                      </div>
                      <div class="font-semibold text-gray-900 dark:text-white capitalize">
                        {{ move.target.name.replace(/-/g, ' ') }}
                      </div>
                    </div>
                  </div>
                </UiCard>

                <!-- Effect Chance -->
                <UiCard
                  v-if="move.effect_chance"
                  variant="glass"
                  padding="sm"
                >
                  <div class="flex items-center gap-2">
                    <Icon
                      icon="ph:percent-bold"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                    />
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Effect Chance
                      </div>
                      <div class="font-semibold text-gray-900 dark:text-white">
                        {{ move.effect_chance }}%
                      </div>
                    </div>
                  </div>
                </UiCard>
              </div>

              <!-- Learned By Pokemon -->
              <UiCard variant="glass">
                <div class="space-y-3">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon
                      icon="ph:pokemon-logo-fill"
                      class="w-5 h-5"
                    />
                    Learned By {{ move.learned_by_pokemon.length }} Pokémon
                  </h3>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    This move can be learned by {{ move.learned_by_pokemon.length }} different Pokémon through various methods like leveling up, TMs, breeding, or tutors.
                  </div>
                </div>
              </UiCard>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
