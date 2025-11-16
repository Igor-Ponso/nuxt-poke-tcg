<script setup lang="ts">
/**
 * Pokemon Modal Component
 *
 * Detailed Pokemon view with tabs: About, Base Stats, Evolution
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedPokemon } from '~/types'
import type { Tab } from '~/components/ui/UiTabs.vue'
import type { Pokemon3DModel } from '~/composables/pokemon/usePokemon3D'

const props = defineProps<{
  pokemon: SimplifiedPokemon | null
  show: boolean
  pokemonList?: SimplifiedPokemon[]
}>()

const emit = defineEmits<{
  close: []
  navigate: [pokemon: SimplifiedPokemon]
}>()

const pokemonStore = usePokemonStore()
const { getAllForms, getFormIcon } = usePokemon3D()
const show3D = ref(false)
const showShiny = ref(false)
const activeTab = ref('about')
const selectedForm = ref<Pokemon3DModel | null>(null)
const availableForms = ref<Pokemon3DModel[]>([])

/**
 * Tabs configuration
 */
const tabs: Tab[] = [
  { id: 'about', label: 'About', icon: 'ph:info' },
  { id: 'stats', label: 'Base Stats', icon: 'ph:chart-bar' },
  { id: 'evolution', label: 'Evolution', icon: 'ph:git-branch' },
]

const isFavorite = computed(() => {
  return props.pokemon ? pokemonStore.isFavorite(props.pokemon.id) : false
})

const currentSprite = computed(() => {
  if (!props.pokemon) return ''
  return showShiny.value && props.pokemon.shinySprite
    ? props.pokemon.shinySprite
    : props.pokemon.sprite
})

/**
 * Calculate total base stats
 */
const totalStats = computed(() => {
  if (!props.pokemon) return 0
  return Object.values(props.pokemon.stats).reduce((sum, val) => sum + val, 0)
})

function handleClose() {
  show3D.value = false
  showShiny.value = false
  activeTab.value = 'about'
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

function toggleFavorite() {
  if (props.pokemon) {
    pokemonStore.toggleFavorite(props.pokemon)
  }
}

function playCry() {
  if (!props.pokemon) return
  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${props.pokemon.id}.ogg`)
  audio.play()
}

/**
 * Get current pokemon index in the list
 */
const currentIndex = computed(() => {
  if (!props.pokemon || !props.pokemonList) return -1
  return props.pokemonList.findIndex(p => p.id === props.pokemon!.id)
})

/**
 * Check if there's a previous pokemon
 */
const hasPrevious = computed(() => {
  return currentIndex.value > 0
})

/**
 * Check if there's a next pokemon
 */
const hasNext = computed(() => {
  if (!props.pokemonList) return false
  return currentIndex.value >= 0 && currentIndex.value < props.pokemonList.length - 1
})

/**
 * Navigate to previous pokemon
 */
function navigatePrevious() {
  if (!hasPrevious.value || !props.pokemonList) return
  const previousPokemon = props.pokemonList[currentIndex.value - 1]
  emit('navigate', previousPokemon)
}

/**
 * Navigate to next pokemon
 */
function navigateNext() {
  if (!hasNext.value || !props.pokemonList) return
  const nextPokemon = props.pokemonList[currentIndex.value + 1]
  emit('navigate', nextPokemon)
}

/**
 * Handle keyboard navigation
 */
function handleKeydown(event: KeyboardEvent) {
  if (!props.show) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigatePrevious()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateNext()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    handleClose()
  }
}

/**
 * Load available 3D forms when pokemon changes
 */
watch(() => props.pokemon?.id, async (newId) => {
  if (!newId) {
    availableForms.value = []
    return
  }

  try {
    const forms = await getAllForms(newId)
    availableForms.value = forms
    // Reset to regular form when pokemon changes
    selectedForm.value = forms.find(f => f.formName === 'regular') || forms[0] || null
  }
  catch (error) {
    console.error('Failed to load Pokemon 3D forms:', error)
    availableForms.value = []
    selectedForm.value = null
  }
}, { immediate: true })

/**
 * Update selected form based on shiny toggle (for backward compatibility)
 */
watch(showShiny, (isShiny) => {
  // Only auto-switch between regular and shiny if those are the only forms
  if (availableForms.value.length <= 2) {
    const targetFormName = isShiny ? 'shiny' : 'regular'
    selectedForm.value = availableForms.value.find(f => f.formName === targetFormName) || availableForms.value[0] || null
  }
})

// Add keyboard listener
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
        v-if="show && pokemon"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
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
            class="relative w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl"
            @click.stop
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2.5 sm:p-2 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              @click="handleClose"
            >
              <Icon icon="ph:x-bold" class="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <!-- Navigation Arrows -->
            <button
              v-if="hasPrevious"
              type="button"
              class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              @click="navigatePrevious"
              aria-label="Previous Pokémon"
            >
              <Icon icon="ph:caret-left-bold" class="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <button
              v-if="hasNext"
              type="button"
              class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              @click="navigateNext"
              aria-label="Next Pokémon"
            >
              <Icon icon="ph:caret-right-bold" class="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <!-- Modal Content -->
            <div class="p-4 sm:p-6 md:p-8">
              <!-- Header -->
              <div class="mb-4 sm:mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <!-- Left: ID + Name + Types -->
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <!-- ID Badge -->
                    <span class="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 w-fit">
                      #{{ pokemon.id.toString().padStart(3, '0') }}
                    </span>

                    <!-- Name + Types -->
                    <div class="flex flex-col gap-2">
                      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white capitalize leading-none">
                        {{ formatPokemonName(pokemon.name) }}
                      </h2>
                      <div class="flex items-center gap-1.5 sm:gap-2">
                        <PokemonTypeTag
                          v-for="type in pokemon.types"
                          :key="type"
                          :type="type"
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image / 3D Model Viewer -->
              <div class="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <!-- View Toggle Buttons -->
                <div class="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    class="px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm min-h-[44px] sm:min-h-0"
                    :class="!show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                    @click="show3D = false"
                  >
                    <Icon icon="ph:image" class="w-4 h-4" />
                    <span class="hidden xs:inline">2D</span>
                  </button>
                  <button
                    type="button"
                    class="px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm min-h-[44px] sm:min-h-0"
                    :class="show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                    @click="show3D = true"
                  >
                    <Icon icon="ph:cube" class="w-4 h-4" />
                    <span class="hidden xs:inline">3D</span>
                  </button>
                </div>

                <!-- Action Buttons (Bottom) -->
                <div class="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  <!-- Shiny Toggle -->
                  <button
                    v-if="pokemon.shinySprite"
                    type="button"
                    class="px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm min-h-[44px] sm:min-h-0"
                    :class="showShiny
                      ? 'bg-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-400/50'
                      : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                    @click="showShiny = !showShiny"
                  >
                    <Icon icon="ph:sparkle-fill" class="w-4 h-4" />
                    <span class="hidden xs:inline">Shiny</span>
                  </button>

                  <!-- Cry Button -->
                  <button
                    type="button"
                    class="px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm min-h-[44px] sm:min-h-0 bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30"
                    @click="playCry"
                  >
                    <Icon icon="ph:speaker-high-bold" class="w-4 h-4" />
                    <span class="hidden xs:inline">Cry</span>
                  </button>

                  <!-- Add to Team Button -->
                  <button
                    type="button"
                    class="px-2.5 py-2 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm min-h-[44px] sm:min-h-0"
                    :class="isFavorite
                      ? 'bg-red-500/30 text-red-300 shadow-lg shadow-red-500/50'
                      : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                    @click="toggleFavorite"
                  >
                    <Icon :icon="isFavorite ? 'ph:heart-fill' : 'ph:heart'" class="w-4 h-4" />
                    <span class="hidden xs:inline">{{ isFavorite ? 'Team' : 'Add' }}</span>
                  </button>
                </div>

                <!-- 2D Sprite View -->
                <div v-if="!show3D" class="text-center py-6 sm:py-8">
                  <div class="relative inline-block">
                    <img
                      :src="currentSprite"
                      :alt="pokemon.name"
                      class="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto object-contain drop-shadow-2xl transition-all duration-300"
                    >
                    <!-- Shiny sparkles for 2D -->
                    <div
                      v-if="showShiny"
                      class="absolute inset-0 pointer-events-none"
                    >
                      <Icon
                        icon="ph:sparkle-fill"
                        class="absolute top-0 right-0 w-8 h-8 text-yellow-300 animate-ping"
                      />
                      <Icon
                        icon="ph:sparkle-fill"
                        class="absolute bottom-8 left-8 w-6 h-6 text-yellow-300 animate-ping"
                        style="animation-delay: 0.3s"
                      />
                      <Icon
                        icon="ph:sparkle-fill"
                        class="absolute top-12 left-12 w-7 h-7 text-yellow-300 animate-ping"
                        style="animation-delay: 0.6s"
                      />
                    </div>
                  </div>
                </div>

                <!-- 3D Model View -->
                <div v-else class="min-h-[400px]">
                  <!-- Form Selector (if multiple forms available) -->
                  <div
                    v-if="availableForms.length > 1"
                    class="absolute top-14 sm:top-16 left-2 right-2 sm:left-4 sm:right-4 z-20 flex flex-wrap gap-1.5 sm:gap-2 justify-center"
                  >
                    <button
                      v-for="form in availableForms"
                      :key="form.model"
                      type="button"
                      class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 text-xs sm:text-sm font-medium min-h-[36px] sm:min-h-0"
                      :class="selectedForm?.model === form.model
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'"
                      @click="selectedForm = form"
                    >
                      <Icon :icon="getFormIcon(form.formName)" class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span class="hidden xs:inline">{{ form.name }}</span>
                    </button>
                  </div>

                  <ClientOnly>
                    <Transition
                      mode="out-in"
                      enter-active-class="transition duration-300 ease-out"
                      enter-from-class="opacity-0 scale-95"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition duration-200 ease-in"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-95"
                    >
                      <Pokemon3DViewer
                        v-if="selectedForm"
                        :key="selectedForm.model"
                        :pokemon-id="pokemon.id"
                        :pokemon-name="pokemon.name"
                        :model-url="selectedForm.model"
                        height="400px"
                        :auto-rotate="true"
                        :camera-controls="true"
                        :show-form-toggle="false"
                      />
                    </Transition>
                    <template #fallback>
                      <div class="flex items-center justify-center h-[400px] text-gray-500">
                        <Icon icon="ph:circle-notch" class="w-8 h-8 animate-spin" />
                      </div>
                    </template>
                  </ClientOnly>
                </div>
              </div>

              <!-- Tabs -->
              <UiTabs v-model="activeTab" :tabs="tabs">
                <template #default="{ activeTab: currentTab }">
                  <!-- About Tab -->
                  <div v-show="currentTab === 'about'" class="space-y-4 sm:space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <!-- Physical Info -->
                      <div class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                          Physical Info
                        </h3>
                        <div class="space-y-3">
                          <!-- Height -->
                          <div class="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <div class="flex items-center gap-3">
                              <Icon icon="ph:arrows-vertical-bold" class="w-5 h-5 text-blue-500" />
                              <span class="font-medium text-gray-700 dark:text-gray-300">Height</span>
                            </div>
                            <span class="font-bold text-gray-900 dark:text-white">
                              Coming Soon
                            </span>
                          </div>

                          <!-- Weight -->
                          <div class="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <div class="flex items-center gap-3">
                              <Icon icon="ph:scales-bold" class="w-5 h-5 text-purple-500" />
                              <span class="font-medium text-gray-700 dark:text-gray-300">Weight</span>
                            </div>
                            <span class="font-bold text-gray-900 dark:text-white">
                              Coming Soon
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Abilities -->
                      <div class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                          Abilities
                        </h3>
                        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                          <p class="text-gray-600 dark:text-gray-400">
                            Ability information coming soon...
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="space-y-4">
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                        Description
                      </h3>
                      <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                        <p class="text-gray-600 dark:text-gray-400">
                          Pokemon description and flavor text coming soon...
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Stats Tab -->
                  <div v-show="currentTab === 'stats'" class="space-y-6">
                    <div class="space-y-4">
                      <div v-for="(value, stat) in pokemon.stats" :key="stat" class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                          <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {{ stat }}
                          </span>
                          <span class="font-bold text-gray-900 dark:text-white">
                            {{ value }}
                          </span>
                        </div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            :style="{ width: `${Math.min((value / 255) * 100, 100)}%` }"
                          />
                        </div>
                      </div>

                      <!-- Total Stats -->
                      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                          <span class="text-lg font-bold text-gray-900 dark:text-white">
                            Total
                          </span>
                          <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {{ totalStats }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Evolution Tab -->
                  <div v-show="currentTab === 'evolution'" class="space-y-6">
                    <div class="p-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                      <Icon icon="ph:git-branch-bold" class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <p class="text-gray-600 dark:text-gray-400">
                        Evolution chain coming soon...
                      </p>
                    </div>
                  </div>
                </template>
              </UiTabs>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
