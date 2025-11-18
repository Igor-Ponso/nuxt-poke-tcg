<script setup lang="ts">
/**
 * PokemonCard Component
 *
 * Displays a Pokemon card with 3D effect and optional holographic effect
 * Integrates use3DCard and useHolographic composables
 * Supports alternate forms (Mega, Gmax, Regional variants)
 */

import { Icon } from '@iconify/vue'
import type { PokemonForm } from '~/composables/pokemon/usePokemonForms'
import type { Pokemon, SimplifiedPokemon } from '~/types'

export interface PokemonCardProps {
  pokemon: SimplifiedPokemon
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  holographic?: boolean
  holographicType?: 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism'
  showStats?: boolean
  favorited?: boolean
  showShiny?: boolean
  showForms?: boolean
}

const shinyMode = ref(false)
const formsStore = usePokemonFormsStore()
const pokemonStore = usePokemonStore()
const { getGameSprite } = useGameSprites()

// Full Pokemon data (needed for game sprites)
const fullPokemon = ref<Pokemon | null>(null)
const isCardVisible = ref(false)

const props = withDefaults(defineProps<PokemonCardProps>(), {
  size: 'md',
  clickable: true,
  holographic: false,
  holographicType: 'standard',
  showStats: false,
  favorited: false,
  showShiny: true,
  showForms: true,
})

// Computed property to get selected form from store
const selectedForm = computed(() => formsStore.getSelectedForm(props.pokemon.id))

const emit = defineEmits<{
  click: [pokemon: SimplifiedPokemon, selectedForm: PokemonForm | null]
  favorite: [pokemon: SimplifiedPokemon]
  shinyToggle: [isShiny: boolean]
  formChange: [form: PokemonForm | null]
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlayingCry = ref(false)

const cardRef = ref<HTMLElement | null>(null)

/**
 * Card Visibility - Manages when effects should be active
 * This prevents off-screen cards from running expensive animations
 */
const { shouldRenderEffects } = useCardVisibility(cardRef, {
  rootMargin: '300px', // Start loading effects 300px before visible
  threshold: 0.01,
  disableDelay: 200, // Wait 200ms before disabling to prevent flickering
})

/**
 * 3D Card Effect - Enhanced for stronger hover
 * Now controlled by visibility state for performance
 */
const {
  transformStyle,
  shineStyle,
  isHovering,
} = use3DCard(cardRef, {
  maxRotate: 20,
  perspective: 1200,
  scale: 1.12,
  enabled: shouldRenderEffects, // Disable when card is off-screen
})

/**
 * Holographic Effect (if enabled)
 * Now controlled by visibility state for performance
 */
// Computed enabled state for holographic effect
const holoEnabled = computed(() => props.holographic && shouldRenderEffects.value)

const {
  cssVariables: holoVariables,
  holographicGradient,
  isActive: holoActive,
} = useHolographic(cardRef, {
  enabled: holoEnabled,
  type: props.holographicType,
  intensity: 1,
  speed: 1,
})

/**
 * Intersection Observer - Lazy load full Pokemon data
 * Only fetch when card is actually in viewport to reduce API calls
 */
const { stop } = useIntersectionObserver(
  cardRef,
  ([entry]) => {
    if (entry?.isIntersecting && !isCardVisible.value) {
      isCardVisible.value = true
      // Fetch full Pokemon data when card becomes visible and game version is selected
      if (pokemonStore.selectedGameVersion && !fullPokemon.value) {
        fetchFullPokemon()
      }
    }
  },
  {
    rootMargin: '200px', // Start loading before card is visible for smoother experience
    threshold: 0.01, // Trigger as soon as 1% is visible
  },
)

// Fetch full Pokemon data
async function fetchFullPokemon() {
  try {
    const api = usePokemonApi()
    fullPokemon.value = await api.fetchPokemon(props.pokemon.id)
  }
  catch (error) {
    console.error('Failed to fetch full Pokemon data:', error)
  }
}

// Watch for game version changes
watch(() => pokemonStore.selectedGameVersion, async (newVersion) => {
  if (newVersion && !fullPokemon.value && isCardVisible.value) {
    await fetchFullPokemon()
  }
})

// Cleanup observer on unmount
onUnmounted(() => {
  stop()
})

/**
 * Computed type gradient
 */
const typeGradient = computed(() => {
  return getTypeGradient(props.pokemon.types, {
    direction: '135deg',
  })
})

/**
 * Computed card class
 * Added CSS containment for better rendering performance
 */
const cardClass = computed(() => {
  const baseClasses = [
    'relative',
    'rounded-2xl',
    'overflow-hidden',
    'transition-shadow',
    'duration-200',
    'w-full',
    // Performance optimizations
    'will-change-auto', // Only use will-change when hovering
    '[contain:layout_style_paint]', // CSS containment for better performance
  ]

  // Size - Responsive with max-width
  const sizeClasses = {
    sm: 'max-w-[220px]',
    md: 'max-w-xs',
    lg: 'max-w-sm',
  }
  baseClasses.push(sizeClasses[props.size])

  // Clickable
  if (props.clickable) {
    baseClasses.push('cursor-pointer')
  }

  // Holographic
  if (props.holographic && holoActive.value) {
    baseClasses.push('shadow-2xl')
  }
  else if (isHovering.value) {
    baseClasses.push('shadow-xl')
  }
  else {
    baseClasses.push('shadow-lg')
  }

  return baseClasses.join(' ')
})

/**
 * Computed card style
 */
const cardStyle = computed(() => {
  const styles = {
    ...transformStyle.value,
  }

  if (props.holographic) {
    Object.assign(styles, holoVariables.value)
  }

  return styles
})

/**
 * Computed image class - Responsive Pokemon size
 */
const imageClass = computed(() => {
  const sizeClasses = {
    sm: 'w-32 h-32 sm:w-40 sm:h-40',
    md: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56',
    lg: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64',
  }
  return `mx-auto mt-4 ${sizeClasses[props.size]}`
})

/**
 * Computed sprite URL (shiny or normal, with form and game version support)
 * Priority: Forms always use official artwork > Game sprites for base form > Default sprites
 */
const spriteUrl = computed(() => {
  // If a form is selected, ALWAYS use official artwork (forms didn't exist in old games)
  if (selectedForm.value?.sprites) {
    const sprites = selectedForm.value.sprites
    const officialArtwork = sprites.other?.['official-artwork']

    // Prefer official artwork if available
    if (officialArtwork) {
      return shinyMode.value && officialArtwork.front_shiny
        ? officialArtwork.front_shiny
        : officialArtwork.front_default || sprites.front_default || props.pokemon.sprite
    }

    // Fallback to regular sprites
    return shinyMode.value && sprites.front_shiny
      ? sprites.front_shiny
      : sprites.front_default || props.pokemon.sprite
  }

  // For base Pokemon: if a game version is selected and we have full Pokemon data, use game sprites
  if (pokemonStore.selectedGameVersion && fullPokemon.value) {
    return getGameSprite(fullPokemon.value, pokemonStore.selectedGameVersion, shinyMode.value)
  }

  // Otherwise, use base Pokemon sprite (official artwork)
  return shinyMode.value && props.pokemon.shinySprite
    ? props.pokemon.shinySprite
    : props.pokemon.sprite
})

/**
 * Pokeball background image URL (SVG watermark to avoid opaque square)
 */
const pokeballBgUrl = computed(() => '/images/pokeball-white-removebg-preview.png')

/**
 * Dynamic watermark sizing per card size (larger on smaller cards for visibility)
 */
const watermarkClass = computed(() => {
  // Uniform 20% downward translation per request.
  const sizeMap = {
    sm: 'w-[120%] h-auto',
    md: 'w-[110%] h-auto',
    lg: 'w-[96%] h-auto',
  }
  // Added -translate-x-[10%] to shift watermark 10% left; changed rotation from 45deg to 30deg per request.
  return `absolute bottom-0 right-0 ${sizeMap[props.size]} translate-y-[20%] -translate-x-[10%] opacity-[0.14] dark:opacity-[0.18] select-none pointer-events-none origin-bottom-right rotate-[30deg]`
})

/**
 * Handle card click
 */
function handleClick() {
  if (props.clickable) {
    emit('click', props.pokemon, selectedForm.value)
  }
}

/**
 * Handle form change
 */
function handleFormChange(form: PokemonForm | null) {
  formsStore.setSelectedForm(props.pokemon.id, form)
  emit('formChange', form)
}

/**
 * Handle favorite toggle
 */
function handleFavorite(event: Event) {
  event.stopPropagation()
  emit('favorite', props.pokemon)
}

/**
 * Handle shiny toggle
 */
function handleShinyToggle(event: Event) {
  event.stopPropagation()
  shinyMode.value = !shinyMode.value
  emit('shinyToggle', shinyMode.value)
}

/**
 * Play Pokemon cry
 */
function playCry(event: Event) {
  event.stopPropagation()
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    isPlayingCry.value = true
    audioRef.value.play()
  }
}

/**
 * Handle audio end
 */
function handleAudioEnd() {
  isPlayingCry.value = false
}

/**
 * Handle audio error
 */
function handleAudioError() {
  isPlayingCry.value = false
}
</script>

<template>
  <div
    ref="cardRef"
    :class="cardClass"
    :style="cardStyle"
    @click="handleClick"
  >
    <!-- Background gradient -->
    <div
      class="absolute inset-0 opacity-90"
      style="will-change: auto; transform: translateZ(0);"
      :style="{ background: typeGradient }"
    />

    <!-- Holographic layer -->
    <div
      v-if="holographic"
      class="absolute inset-0 opacity-75 mix-blend-color-dodge pointer-events-none"
      style="will-change: background-position; transform: translateZ(0); backface-visibility: hidden;"
      :style="{
        background: holographicGradient,
        backgroundSize: '400% 400%',
        backgroundPosition: holoVariables['--bg-position'],
      }"
    />

    <!-- Shine effect -->
    <div
      class="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style="will-change: opacity; transform: translateZ(0);"
      :style="shineStyle"
    />

    <!-- Card content -->
    <div class="relative z-10 p-4 sm:p-5 md:p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <!-- Pokemon ID -->
        <span class="text-xs sm:text-sm font-bold text-white/80">
          #{{ pokemon.id.toString().padStart(3, '0') }}
        </span>

        <!-- Action buttons -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Cry button with audio wave -->
          <button
            class="relative p-2 sm:p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            :class="isPlayingCry ? 'bg-blue-400/30 text-blue-200 shadow-lg shadow-blue-400/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
            type="button"
            aria-label="Play cry"
            @click="playCry"
          >
            <Icon
              icon="ph:speaker-high-bold"
              class="w-5 h-5 sm:w-5 sm:h-5"
            />

            <!-- Audio wave visualization -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-75"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-75"
            >
              <div
                v-if="isPlayingCry"
                class="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5"
              >
                <div
                  class="w-0.5 h-2 bg-blue-300 rounded-full animate-pulse"
                  style="animation-delay: 0ms"
                />
                <div
                  class="w-0.5 h-3 bg-blue-300 rounded-full animate-pulse"
                  style="animation-delay: 100ms"
                />
                <div
                  class="w-0.5 h-2.5 bg-blue-300 rounded-full animate-pulse"
                  style="animation-delay: 200ms"
                />
              </div>
            </Transition>
          </button>

          <!-- Shiny button -->
          <button
            v-if="showShiny && pokemon.shinySprite"
            class="p-2 sm:p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            :class="shinyMode ? 'bg-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-400/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
            type="button"
            aria-label="Toggle shiny"
            @click="handleShinyToggle"
          >
            <Icon
              icon="ph:sparkle-fill"
              class="w-5 h-5 sm:w-5 sm:h-5"
            />
          </button>

          <!-- Form selector -->
          <PokemonFormSelector
            v-if="showForms"
            :pokemon-id="pokemon.id"
            :pokemon-name="pokemon.name"
            :current-form="selectedForm?.name"
            @update:form="handleFormChange"
          />

          <!-- Favorite button -->
          <button
            class="p-2 sm:p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            :class="favorited ? 'bg-red-500/30 text-red-400 shadow-lg shadow-red-500/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
            type="button"
            aria-label="Toggle favorite"
            @click="handleFavorite"
          >
            <Icon
              :icon="favorited ? 'ph:heart-fill' : 'ph:heart'"
              class="w-5 h-5 sm:w-5 sm:h-5"
            />
          </button>
        </div>
      </div>

      <!-- Hidden audio element for cry -->
      <audio
        ref="audioRef"
        :src="`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`"
        preload="none"
        @ended="handleAudioEnd"
        @error="handleAudioError"
      />

      <!-- Pokemon Image -->
      <div
        :class="imageClass"
        class="relative"
      >
        <!-- (Watermark relocated to card container bottom-right) -->

        <!-- Shiny sparkles effect -->
        <ShinySparkles
          :active="shinyMode"
          :size="size"
        />

        <!-- Pokemon sprite with fade transition -->
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <img
            :key="spriteUrl"
            :src="spriteUrl"
            :alt="pokemon.name"
            class="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            loading="lazy"
          >
        </Transition>
        <!-- Shiny sparkle effect -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 scale-0"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="shinyMode"
            class="absolute inset-0 pointer-events-none"
          >
            <!-- Radial gradient glow -->
            <div class="absolute inset-0 bg-gradient-radial from-yellow-300/30 via-yellow-400/20 to-transparent animate-pulse" />

            <!-- Multiple sparkles with ping animation -->
            <Icon
              icon="ph:sparkle-fill"
              class="absolute top-2 right-2 w-8 h-8 text-yellow-200 animate-ping drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
            />
            <Icon
              icon="ph:sparkle-fill"
              class="absolute top-1/4 left-4 w-5 h-5 text-yellow-300 animate-ping drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
              style="animation-delay: 0.2s"
            />
            <Icon
              icon="ph:sparkle-fill"
              class="absolute top-1/2 right-8 w-6 h-6 text-yellow-200 animate-ping drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
              style="animation-delay: 0.4s"
            />
            <Icon
              icon="ph:sparkle-fill"
              class="absolute bottom-1/4 left-1/3 w-4 h-4 text-yellow-300 animate-ping drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
              style="animation-delay: 0.6s"
            />
            <Icon
              icon="ph:sparkle-fill"
              class="absolute bottom-4 right-1/4 w-7 h-7 text-yellow-200 animate-ping drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
              style="animation-delay: 0.8s"
            />

            <!-- Star with ping animation instead of spin -->
            <Icon
              icon="ph:star-fill"
              class="absolute top-1/3 right-1/3 w-5 h-5 text-yellow-100 animate-ping drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]"
              style="animation-delay: 0.3s"
            />
          </div>
        </Transition>
      </div>

      <!-- Pokemon Name -->
      <h3 class="mt-3 sm:mt-4 text-center text-lg sm:text-xl font-bold text-white capitalize drop-shadow-lg">
        {{ formatPokemonName(pokemon.name) }}
      </h3>

      <!-- Types -->
      <div class="flex items-center justify-center gap-1.5 sm:gap-2 mt-2">
        <PokemonTypeTag
          v-for="type in pokemon.types"
          :key="type"
          :type="type"
          size="sm"
          variant="filled"
        />
      </div>

      <!-- Stats (optional) -->
      <div
        v-if="showStats"
        class="mt-4 space-y-2"
      >
        <div
          v-for="(value, stat) in pokemon.stats"
          :key="stat"
          class="flex items-center gap-2"
        >
          <span class="text-xs font-medium text-white/80 capitalize w-16">
            {{ stat }}
          </span>
          <div class="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-white rounded-full transition-all duration-500"
              :style="{ width: `${Math.min((value / 255) * 100, 100)}%` }"
            />
          </div>
          <span class="text-xs font-bold text-white w-8 text-right">
            {{ value }}
          </span>
        </div>
      </div>
    </div>

    <!-- Glass overlay effect -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

    <!-- Card watermark (bottom-right of entire card) -->
    <img
      :src="pokeballBgUrl"
      alt=""
      :class="watermarkClass + ' z-0'"
      aria-hidden="true"
      decoding="async"
      loading="lazy"
    >
  </div>
</template>
