<script setup lang="ts">
/**
 * PokemonCard Component
 *
 * Displays a Pokemon card with 3D effect and optional holographic effect
 * Integrates use3DCard and useHolographic composables
 */

import { Icon } from '@iconify/vue'
import type { SimplifiedPokemon } from '~/types'

export interface PokemonCardProps {
  pokemon: SimplifiedPokemon
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  holographic?: boolean
  holographicType?: 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism'
  showStats?: boolean
  favorited?: boolean
  showShiny?: boolean
}

const shinyMode = ref(false)

const props = withDefaults(defineProps<PokemonCardProps>(), {
  size: 'md',
  clickable: true,
  holographic: false,
  holographicType: 'standard',
  showStats: false,
  favorited: false,
  showShiny: true,
})

const emit = defineEmits<{
  click: [pokemon: SimplifiedPokemon]
  favorite: [pokemon: SimplifiedPokemon]
  shinyToggle: [isShiny: boolean]
}>()

const cardRef = ref<HTMLElement | null>(null)

/**
 * 3D Card Effect - Enhanced for stronger hover
 */
const {
  transformStyle,
  shineStyle,
  isHovering,
} = use3DCard(cardRef, {
  maxRotate: 20,
  perspective: 1200,
  scale: 1.12,
})

/**
 * Holographic Effect (if enabled)
 */
const {
  cssVariables: holoVariables,
  holographicGradient,
  isActive: holoActive,
} = useHolographic(cardRef, {
  enabled: props.holographic,
  type: props.holographicType,
  intensity: 1,
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
 */
const cardClass = computed(() => {
  const baseClasses = [
    'relative',
    'rounded-2xl',
    'overflow-hidden',
    'transition-shadow',
    'duration-200',
  ]

  // Size - Increased significantly
  const sizeClasses = {
    sm: 'w-56',
    md: 'w-72',
    lg: 'w-96',
  }
  baseClasses.push(sizeClasses[props.size])

  // Clickable
  if (props.clickable) {
    baseClasses.push('cursor-pointer')
  }

  // Holographic
  if (props.holographic && holoActive.value) {
    baseClasses.push('shadow-2xl')
  } else if (isHovering.value) {
    baseClasses.push('shadow-xl')
  } else {
    baseClasses.push('shadow-lg')
  }

  return baseClasses.join(' ')
})

/**
 * Computed card style
 */
const cardStyle = computed(() => {
  const styles = {
    willChange: 'transform',
    ...transformStyle.value,
  }

  if (props.holographic) {
    Object.assign(styles, holoVariables.value)
  }

  return styles
})

/**
 * Computed image class - Increased Pokemon size
 */
const imageClass = computed(() => {
  const sizeClasses = {
    sm: 'w-40 h-40',
    md: 'w-56 h-56',
    lg: 'w-72 h-72',
  }
  return `mx-auto mt-4 ${sizeClasses[props.size]}`
})

/**
 * Computed sprite URL (shiny or normal)
 */
const spriteUrl = computed(() => {
  return shinyMode.value && props.pokemon.shinySprite
    ? props.pokemon.shinySprite
    : props.pokemon.sprite
})

/**
 * Handle card click
 */
function handleClick() {
  if (props.clickable) {
    emit('click', props.pokemon)
  }
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
    <div class="relative z-10 p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <!-- Pokemon ID -->
        <span class="text-sm font-bold text-white/80">
          #{{ pokemon.id.toString().padStart(3, '0') }}
        </span>

        <!-- Action buttons -->
        <div class="flex items-center gap-2">
          <!-- Shiny button -->
          <button
            v-if="showShiny && pokemon.shinySprite"
            class="p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm"
            :class="shinyMode ? 'bg-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-400/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
            type="button"
            aria-label="Toggle shiny"
            @click="handleShinyToggle"
          >
            <Icon icon="ph:sparkle-fill" class="w-5 h-5" />
          </button>

          <!-- Favorite button -->
          <button
            class="p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm"
            :class="favorited ? 'bg-red-500/30 text-red-400 shadow-lg shadow-red-500/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
            type="button"
            aria-label="Toggle favorite"
            @click="handleFavorite"
          >
            <Icon :icon="favorited ? 'ph:heart-fill' : 'ph:heart'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Pokemon Image -->
      <div :class="imageClass" class="relative">
        <img
          :src="spriteUrl"
          :alt="pokemon.name"
          class="w-full h-full object-contain drop-shadow-2xl transition-all duration-300"
          :class="{ 'animate-pulse': shinyMode }"
          loading="lazy"
        >
        <!-- Shiny sparkle effect -->
        <div
          v-if="shinyMode"
          class="absolute inset-0 pointer-events-none"
        >
          <Icon
            icon="ph:sparkle-fill"
            class="absolute top-0 right-0 w-6 h-6 text-yellow-300 animate-ping"
          />
          <Icon
            icon="ph:sparkle-fill"
            class="absolute bottom-4 left-4 w-4 h-4 text-yellow-300 animate-ping"
            style="animation-delay: 0.3s"
          />
          <Icon
            icon="ph:sparkle-fill"
            class="absolute top-8 left-8 w-5 h-5 text-yellow-300 animate-ping"
            style="animation-delay: 0.6s"
          />
        </div>
      </div>

      <!-- Pokemon Name -->
      <h3 class="mt-4 text-center text-xl font-bold text-white capitalize drop-shadow-lg">
        {{ formatPokemonName(pokemon.name) }}
      </h3>

      <!-- Types -->
      <div class="flex items-center justify-center gap-2 mt-2">
        <PokemonTypeTag
          v-for="type in pokemon.types"
          :key="type"
          :type="type"
          size="sm"
          variant="filled"
        />
      </div>

      <!-- Stats (optional) -->
      <div v-if="showStats" class="mt-4 space-y-2">
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
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
    />
  </div>
</template>
