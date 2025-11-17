<script setup lang="ts">
/**
 * Pokemon Modal Component
 *
 * Detailed Pokemon view with tabs: About, Base Stats, Evolution
 */

import { Icon } from '@iconify/vue'
import type { Tab } from '~/components/ui/UiTabs.vue'
import type { Pokemon3DModel } from '~/composables/pokemon/usePokemon3D'
import type { PokemonForm } from '~/composables/pokemon/usePokemonForms'
import type { SimplifiedPokemon } from '~/types'

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
const formsStore = usePokemonFormsStore()
const { getAllForms } = usePokemon3D()
const { getAvailableFormsForPokemon, getEnglishFormName } = usePokemonForms()
const { fetchPokemon, formatHeight, formatWeight } = usePokemonDetails()
const show3D = ref(false)
const showShiny = ref(false)
const activeTab = ref('about')
const selected3DForm = ref<Pokemon3DModel | null>(null)
const available3DForms = ref<Pokemon3DModel[]>([])
const available2DForms = ref<PokemonForm[]>([])

// Pokemon details data
const pokemonDetails = ref<{
  height: { metric: string, imperial: string } | null
  weight: { metric: string, imperial: string } | null
  loading: boolean
}>({
  height: null,
  weight: null,
  loading: false,
})

// Get selected 2D form from store with computed getter/setter
const selected2DForm = computed({
  get: () => props.pokemon ? formsStore.getSelectedForm(props.pokemon.id) : null,
  set: (value) => {
    if (props.pokemon) {
      formsStore.setSelectedForm(props.pokemon.id, value)
    }
  },
})

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

  // If a 2D form is selected, use its sprite
  if (selected2DForm.value?.sprites) {
    const sprites = selected2DForm.value.sprites
    const officialArtwork = sprites.other?.['official-artwork']

    // Prefer official artwork if available
    if (officialArtwork) {
      return showShiny.value && officialArtwork.front_shiny
        ? officialArtwork.front_shiny
        : officialArtwork.front_default || sprites.front_default || props.pokemon.sprite
    }

    // Fallback to regular sprites
    return showShiny.value && sprites.front_shiny
      ? sprites.front_shiny
      : sprites.front_default || props.pokemon.sprite
  }

  // Otherwise, use base Pokemon sprite
  return showShiny.value && props.pokemon.shinySprite
    ? props.pokemon.shinySprite
    : props.pokemon.sprite
})

/**
 * Get current 3D form name for the Pokemon3DViewer component
 */
const current3DFormName = computed(() => {
  const formName = selected3DForm.value?.formName || 'regular'
  console.log('[PokemonModal] current3DFormName computed:', formName)
  return formName
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
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateNext()
  }
  else if (event.key === 'Escape') {
    event.preventDefault()
    handleClose()
  }
}

/**
 * Get Pokemon height in meters for visual comparison
 */
const pokemonHeightInMeters = computed(() => {
  if (!pokemonDetails.value.height) return 0
  // Extract numeric value from metric string (e.g., "1.70 m" -> 1.70)
  return Number.parseFloat(pokemonDetails.value.height.metric)
})

/**
 * Load available forms when pokemon changes
 */
watch(() => props.pokemon?.id, async (newId) => {
  if (!newId) {
    available3DForms.value = []
    available2DForms.value = []
    return
  }

  try {
    // Load 3D forms
    console.log(`[PokemonModal] Loading 3D forms for Pokemon #${newId}`)
    const forms3D = await getAllForms(newId)
    console.log(`[PokemonModal] 3D forms loaded:`, forms3D)
    available3DForms.value = forms3D
    selected3DForm.value = forms3D.find(f => f.formName === 'regular') || forms3D[0] || null
    console.log(`[PokemonModal] Selected 3D form:`, selected3DForm.value)

    // Load 2D forms (filter out the base/default form since we have a separate "Regular" option)
    const forms2D = await getAvailableFormsForPokemon(newId)
    // Filter forms similar to PokemonFormSelector: keep only special forms (non-empty form_name)
    available2DForms.value = forms2D.filter(f => f.form_name !== '' && f.form_name !== props.pokemon?.name)
  }
  catch (error) {
    console.error('[PokemonModal] Failed to load Pokemon forms:', error)
    available3DForms.value = []
    available2DForms.value = []
    selected3DForm.value = null
  }
}, { immediate: true })

/**
 * Update selected form based on shiny toggle (for backward compatibility)
 */
watch(showShiny, (isShiny) => {
  // Only auto-switch between regular and shiny if those are the only forms
  if (available3DForms.value.length <= 2) {
    const targetFormName = isShiny ? 'shiny' : 'regular'
    selected3DForm.value = available3DForms.value.find(f => f.formName === targetFormName) || available3DForms.value[0] || null
  }
})

/**
 * Fetch Pokemon details (height, weight, abilities, etc.) when modal opens
 */
watch(() => props.pokemon?.id, async (newId) => {
  if (!newId) {
    pokemonDetails.value = { height: null, weight: null, loading: false }
    return
  }

  try {
    pokemonDetails.value.loading = true
    const fullPokemon = await fetchPokemon(newId)

    if (fullPokemon) {
      pokemonDetails.value.height = formatHeight(fullPokemon.height)
      pokemonDetails.value.weight = formatWeight(fullPokemon.weight)
    }
  }
  catch (error) {
    console.error('[PokemonModal] Failed to fetch Pokemon details:', error)
  }
  finally {
    pokemonDetails.value.loading = false
  }
}, { immediate: true })

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
              <Icon
                icon="ph:x-bold"
                class="w-5 h-5 sm:w-6 sm:h-6"
              />
            </button>

            <!-- Navigation Arrows -->
            <button
              v-if="hasPrevious"
              type="button"
              class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label="Previous Pokémon"
              @click="navigatePrevious"
            >
              <Icon
                icon="ph:caret-left-bold"
                class="w-6 h-6 sm:w-7 sm:h-7"
              />
            </button>

            <button
              v-if="hasNext"
              type="button"
              class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label="Next Pokémon"
              @click="navigateNext"
            >
              <Icon
                icon="ph:caret-right-bold"
                class="w-6 h-6 sm:w-7 sm:h-7"
              />
            </button>

            <!-- Modal Content -->
            <div class="p-4 sm:p-6 md:p-8">
              <!-- Compact Inline Header with Gradient Background -->
              <div class="relative -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 mb-6 overflow-hidden rounded-b-2xl">
                <!-- Dynamic Gradient Background based on Pokemon type -->
                <div
                  class="absolute inset-0 opacity-15 dark:opacity-25 bg-gradient-to-r"
                  :style="{
                    background: `linear-gradient(90deg, var(--type-${pokemon.types[0]}) 0%, var(--type-${pokemon.types[pokemon.types.length - 1]}) 100%)`,
                  }"
                />

                <!-- Pattern Overlay -->
                <div
                  class="absolute inset-0 opacity-5"
                  style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 32px 32px;"
                />

                <!-- Compact Content - Everything in one line -->
                <div class="relative px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                  <div class="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
                    <!-- Left: Icon + ID + Name + Types (all inline) -->
                    <div class="flex items-center gap-2 sm:gap-3 flex-wrap flex-1 min-w-0">
                      <!-- ID Badge -->
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
                        <Icon
                          icon="ph:hash"
                          class="w-3.5 h-3.5 opacity-50"
                        />
                        {{ pokemon.id.toString().padStart(3, '0') }}
                      </span>

                      <!-- Name -->
                      <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white capitalize leading-none tracking-tight drop-shadow-lg flex-shrink-0">
                        {{ formatPokemonName(pokemon.name) }}
                      </h2>

                      <!-- Types -->
                      <div class="flex items-center gap-1.5 sm:gap-2">
                        <PokemonTypeTag
                          v-for="type in pokemon.types"
                          :key="type"
                          :type="type"
                          size="md"
                          class="shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image / 3D Model Viewer with Controls -->
              <div class="flex flex-col md:flex-row gap-4 mb-4 sm:mb-6">
                <!-- Left Sidebar: Controls -->
                <div class="flex flex-row md:flex-col gap-2 md:w-48 flex-shrink-0">
                  <!-- View Toggle Buttons -->
                  <div class="flex md:flex-col gap-1.5 sm:gap-2 flex-1 md:flex-none">
                    <button
                      type="button"
                      class="flex-1 md:flex-none px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm font-medium min-h-[44px]"
                      :class="!show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      @click="show3D = false"
                    >
                      <Icon
                        icon="ph:image"
                        class="w-5 h-5"
                      />
                      <span class="hidden sm:inline">2D</span>
                    </button>
                    <button
                      type="button"
                      class="flex-1 md:flex-none px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm font-medium min-h-[44px]"
                      :class="show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      @click="show3D = true"
                    >
                      <Icon
                        icon="ph:cube"
                        class="w-5 h-5"
                      />
                      <span class="hidden sm:inline">3D</span>
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="hidden md:block h-px bg-gray-200 dark:bg-gray-700 my-2" />

                  <!-- Action Buttons -->
                  <div class="flex md:flex-col gap-1.5 sm:gap-2 flex-1 md:flex-none">
                    <!-- Shiny Toggle -->
                    <button
                      v-if="pokemon.shinySprite && (!show3D || available3DForms.length <= 2)"
                      type="button"
                      class="flex-1 md:flex-none px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm font-medium min-h-[44px]"
                      :class="showShiny
                        ? 'bg-yellow-400/20 dark:bg-yellow-400/30 text-yellow-700 dark:text-yellow-300 shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      @click="showShiny = !showShiny"
                    >
                      <Icon
                        icon="ph:sparkle-fill"
                        class="w-5 h-5"
                      />
                      <span class="hidden sm:inline">Shiny</span>
                    </button>

                    <!-- Cry Button -->
                    <button
                      type="button"
                      class="flex-1 md:flex-none px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm font-medium min-h-[44px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      @click="playCry"
                    >
                      <Icon
                        icon="ph:speaker-high-bold"
                        class="w-5 h-5"
                      />
                      <span class="hidden sm:inline">Cry</span>
                    </button>

                    <!-- Add to Team Button -->
                    <button
                      type="button"
                      class="flex-1 md:flex-none px-3 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 text-sm font-medium min-h-[44px]"
                      :class="isFavorite
                        ? 'bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300 shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      @click="toggleFavorite"
                    >
                      <Icon
                        :icon="isFavorite ? 'ph:heart-fill' : 'ph:heart'"
                        class="w-5 h-5"
                      />
                      <span class="hidden sm:inline">{{ isFavorite ? 'Team' : 'Add' }}</span>
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="hidden md:block h-px bg-gray-200 dark:bg-gray-700 my-2" />

                  <!-- Form Selector Dropdown (2D Mode) -->
                  <div
                    v-if="!show3D"
                    class="flex-1 md:flex-none"
                  >
                    <select
                      v-model="selected2DForm"
                      class="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium min-h-[44px]"
                    >
                      <option :value="null">
                        Regular
                      </option>
                      <option
                        v-for="form in available2DForms"
                        :key="form.name"
                        :value="form"
                      >
                        {{ getEnglishFormName(form) }}
                      </option>
                    </select>
                  </div>

                  <!-- Form Selector Dropdown (3D Mode) -->
                  <div
                    v-if="show3D && available3DForms.length > 0"
                    class="flex-1 md:flex-none"
                  >
                    <select
                      v-model="selected3DForm"
                      class="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium min-h-[44px]"
                    >
                      <option
                        v-for="form in available3DForms"
                        :key="form.formName"
                        :value="form"
                      >
                        {{ form.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Right: Pokemon Image/Model -->
                <div class="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 flex-1 min-h-[400px] sm:min-h-[500px]">
                  <!-- 2D Sprite View -->
                  <div
                    v-if="!show3D"
                    class="flex items-center justify-center h-full"
                  >
                    <div class="relative inline-block">
                      <!-- Shiny sparkles effect -->
                      <ShinySparkles
                        :active="showShiny"
                        size="lg"
                      />

                      <img
                        :src="currentSprite"
                        :alt="pokemon.name"
                        class="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] mx-auto object-contain drop-shadow-2xl transition-all duration-300"
                      >
                    </div>
                  </div>

                  <!-- 3D Model View -->
                  <div
                    v-else
                    class="flex items-center justify-center h-full"
                  >
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
                          v-if="selected3DForm"
                          :key="current3DFormName"
                          :pokemon-id="pokemon.id"
                          :pokemon-name="pokemon.name"
                          :form="current3DFormName"
                          height="100%"
                          :auto-rotate="true"
                          :camera-controls="true"
                          :show-form-toggle="false"
                        />
                      </Transition>
                      <template #fallback>
                        <div class="flex items-center justify-center h-full text-gray-500">
                          <Icon
                            icon="ph:circle-notch"
                            class="w-8 h-8 animate-spin"
                          />
                        </div>
                      </template>
                    </ClientOnly>
                  </div>
                </div>
              </div>

              <!-- Tabs -->
              <UiTabs
                v-model="activeTab"
                :tabs="tabs"
              >
                <template #default="{ activeTab: currentTab }">
                  <!-- About Tab -->
                  <div
                    v-show="currentTab === 'about'"
                    class="space-y-4 sm:space-y-6"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <!-- Physical Info -->
                      <div class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                          Physical Info
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <!-- Height with Visual Comparison -->
                          <div class="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div class="relative p-4 space-y-3">
                              <!-- Header -->
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                  <div class="p-2 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Icon
                                      icon="ph:arrows-vertical-bold"
                                      class="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    />
                                  </div>
                                  <span class="font-semibold text-gray-700 dark:text-gray-300">Height</span>
                                </div>
                                <Transition
                                  mode="out-in"
                                  enter-active-class="transition duration-200 ease-out"
                                  enter-from-class="opacity-0 scale-90"
                                  enter-to-class="opacity-100 scale-100"
                                  leave-active-class="transition duration-150 ease-in"
                                  leave-from-class="opacity-100 scale-100"
                                  leave-to-class="opacity-0 scale-90"
                                >
                                  <div
                                    v-if="pokemonDetails.loading"
                                    class="flex items-center gap-2"
                                  >
                                    <div class="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                                    <span class="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                                  </div>
                                  <div
                                    v-else-if="pokemonDetails.height"
                                    class="text-right"
                                  >
                                    <div class="font-bold text-lg text-gray-900 dark:text-white">
                                      {{ pokemonDetails.height.metric }}
                                    </div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">
                                      {{ pokemonDetails.height.imperial }}
                                    </div>
                                  </div>
                                  <span
                                    v-else
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                  >
                                    N/A
                                  </span>
                                </Transition>
                              </div>

                              <!-- Visual Height Comparison (Trainer vs Pokemon silhouettes) -->
                              <div
                                v-if="pokemonDetails.height && pokemon"
                                class="relative h-32 bg-gradient-to-t from-blue-100/50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg p-3 pb-6"
                              >
                                <!-- Ground line -->
                                <div class="absolute bottom-6 left-0 right-0 h-0.5 bg-blue-300 dark:bg-blue-700" />

                                <!-- Trainer silhouette (1.7m reference) -->
                                <div
                                  class="absolute bottom-6 left-6 flex flex-col items-center gap-1 transition-transform duration-300 group-hover:scale-105"
                                  :style="{ height: `${Math.min(90, (1.7 / Math.max(pokemonHeightInMeters, 1.7)) * 90)}px` }"
                                >
                                  <img
                                    src="~/assets/images/sprite_red_trainer.png"
                                    alt="Trainer Red"
                                    class="w-full h-full object-contain brightness-0 dark:brightness-100 opacity-80 pixelated"
                                  >
                                  <span class="text-[10px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">1.7m</span>
                                </div>

                                <!-- Pokemon silhouette -->
                                <div
                                  class="absolute bottom-6 right-6 flex flex-col items-center gap-1 transition-transform duration-300 group-hover:scale-105"
                                  :style="{ height: `${Math.min(90, (pokemonHeightInMeters / Math.max(pokemonHeightInMeters, 1.7)) * 90)}px` }"
                                >
                                  <img
                                    :src="currentSprite"
                                    :alt="pokemon.name"
                                    class="w-full h-full object-contain brightness-0 dark:brightness-100 opacity-80"
                                  >
                                  <span class="text-[10px] font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    {{ pokemonDetails.height.metric }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Weight -->
                          <div class="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                            <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div class="relative flex items-center justify-between">
                              <div class="flex items-center gap-3">
                                <div class="p-2 rounded-lg bg-purple-500/20 dark:bg-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                                  <Icon
                                    icon="ph:scales-bold"
                                    class="w-5 h-5 text-purple-600 dark:text-purple-400"
                                  />
                                </div>
                                <span class="font-semibold text-gray-700 dark:text-gray-300">Weight</span>
                              </div>
                              <div class="text-right">
                                <Transition
                                  mode="out-in"
                                  enter-active-class="transition duration-200 ease-out"
                                  enter-from-class="opacity-0 scale-90"
                                  enter-to-class="opacity-100 scale-100"
                                  leave-active-class="transition duration-150 ease-in"
                                  leave-from-class="opacity-100 scale-100"
                                  leave-to-class="opacity-0 scale-90"
                                >
                                  <div
                                    v-if="pokemonDetails.loading"
                                    class="flex items-center gap-2"
                                  >
                                    <div class="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                                    <span class="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                                  </div>
                                  <div
                                    v-else-if="pokemonDetails.weight"
                                    class="space-y-0.5"
                                  >
                                    <div class="font-bold text-lg text-gray-900 dark:text-white">
                                      {{ pokemonDetails.weight.metric }}
                                    </div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">
                                      {{ pokemonDetails.weight.imperial }}
                                    </div>
                                  </div>
                                  <span
                                    v-else
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                  >
                                    N/A
                                  </span>
                                </Transition>
                              </div>
                            </div>
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
                  <div
                    v-show="currentTab === 'stats'"
                    class="space-y-6"
                  >
                    <div class="space-y-4">
                      <div
                        v-for="(value, stat) in pokemon.stats"
                        :key="stat"
                        class="space-y-2"
                      >
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
                  <div
                    v-show="currentTab === 'evolution'"
                    class="space-y-6"
                  >
                    <div class="p-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                      <Icon
                        icon="ph:git-branch-bold"
                        class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                      />
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

<style scoped>
/* Preserve pixel art crispness for trainer and Pokemon sprites */
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
