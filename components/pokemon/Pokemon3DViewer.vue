<script setup lang="ts">
/**
 * Pokemon 3D Viewer Component
 *
 * Renders Pokemon 3D models using Google Model Viewer
 * Supports rotation, zoom, and all form types (shiny, mega, gmax, etc)
 */

import { Icon } from '@iconify/vue'
import type { Pokemon3DFormName } from '~/composables/pokemon/usePokemon3D'

// Dynamic import to avoid SSR issues
if (import.meta.client) {
  import('@google/model-viewer')
}

export interface Pokemon3DViewerProps {
  pokemonId: number
  pokemonName: string
  form?: Pokemon3DFormName
  modelUrl?: string // Direct model URL (overrides form-based URL)
  autoRotate?: boolean
  cameraControls?: boolean
  height?: string
  backgroundColor?: string
  showFormToggle?: boolean
  autoplayAnimation?: boolean
}

const props = withDefaults(defineProps<Pokemon3DViewerProps>(), {
  form: 'regular',
  autoRotate: true,
  cameraControls: true,
  height: '400px',
  backgroundColor: 'transparent',
  showFormToggle: true,
  autoplayAnimation: true,
})

const emit = defineEmits<{
  formChange: [form: Pokemon3DFormName]
  loaded: []
  error: [error: Error]
}>()

const { getModelUrl } = usePokemon3D()
const currentForm = ref(props.form)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const modelViewerRef = ref<HTMLElement | null>(null)
// Use 'auto' for automatic framing based on model dimensions
const cameraOrbit = ref('0deg 75deg auto')

/**
 * Computed model URL based on current form or direct URL
 */
const modelUrl = computed(() => {
  // Use direct model URL if provided (overrides form-based lookup)
  if (props.modelUrl) {
    return props.modelUrl
  }
  return getModelUrl(props.pokemonId, currentForm.value)
})

/**
 * Toggle between regular and shiny forms
 */
function toggleForm() {
  currentForm.value = currentForm.value === 'regular' ? 'shiny' : 'regular'
  emit('formChange', currentForm.value)
  isLoading.value = true
  hasError.value = false
}

/**
 * Handle model load event
 */
function handleLoad() {
  isLoading.value = false
  hasError.value = false

  if (modelViewerRef.value) {
    // Type cast to access model-viewer specific properties
    const modelViewer = modelViewerRef.value as unknown as {
      availableAnimations?: string[]
      animationName?: string
      play: (options: { repetitions: number }) => void
    }

    // Use requestAnimationFrame to avoid setting properties during Lit's update cycle
    // This prevents the "change-in-update" warning
    requestAnimationFrame(() => {
      // Model-viewer handles auto-framing with camera-orbit="auto"
      // Check if model has animations and handle them if autoplay is enabled
      const animations = modelViewer.availableAnimations
      if (props.autoplayAnimation && animations && animations.length > 0) {
        // Model has animations - play the first one
        modelViewer.animationName = animations[0]
        modelViewer.play({ repetitions: Infinity })
      }
      // If no animations available, model will remain static (which is fine)
    })
  }

  emit('loaded')
}

/**
 * Handle model error event
 */
function handleError(event: Event) {
  isLoading.value = false
  hasError.value = true
  errorMessage.value = 'Failed to load 3D model'
  emit('error', new Error(errorMessage.value))
  console.error('Model viewer error:', event)
}

/**
 * Watch for prop changes
 */
watch(() => props.pokemonId, () => {
  isLoading.value = true
  hasError.value = false
  currentForm.value = props.form
})
</script>

<template>
  <div
    class="pokemon-3d-viewer relative w-full"
    :style="{ height: height }"
  >
    <!-- Loading Spinner -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10"
    >
      <UiLoading
        type="pokeball"
        size="lg"
        message="Loading 3D model..."
      />
    </div>

    <!-- Error State -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10 p-6 text-center"
    >
      <Icon
        icon="ph:warning-circle-fill"
        class="w-16 h-16 text-yellow-500 mb-4"
      />
      <p class="text-white text-lg font-semibold mb-2">
        {{ errorMessage }}
      </p>
      <p class="text-gray-300 text-sm">
        This Pokemon may not have a 3D model available yet
      </p>
    </div>

    <!-- Model Viewer -->
    <model-viewer
      ref="modelViewerRef"
      :src="modelUrl"
      :alt="`${pokemonName} 3D model`"
      :auto-rotate="autoRotate"
      :camera-controls="cameraControls"
      :camera-orbit="cameraOrbit"
      :style="{
        backgroundColor: backgroundColor,
      }"
      class="w-full h-full rounded-2xl overflow-hidden"
      field-of-view="auto"
      min-field-of-view="20deg"
      max-field-of-view="60deg"
      min-camera-orbit="auto auto 50%"
      max-camera-orbit="auto auto 200%"
      shadow-intensity="1"
      exposure="1"
      tone-mapping="neutral"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Form Toggle Button -->
    <div
      v-if="showFormToggle"
      class="absolute bottom-4 right-4 z-20"
    >
      <button
        type="button"
        class="px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-lg"
        :class="currentForm === 'shiny'
          ? 'bg-yellow-400/30 text-yellow-300 shadow-yellow-400/50'
          : 'bg-white/20 text-white hover:bg-white/30'"
        @click="toggleForm"
      >
        <Icon
          :icon="currentForm === 'shiny' ? 'ph:sparkle-fill' : 'ph:sparkle'"
          class="w-5 h-5"
        />
        <span class="font-semibold text-sm">
          {{ currentForm === 'shiny' ? 'Shiny' : 'Regular' }}
        </span>
      </button>
    </div>

    <!-- Controls Info -->
    <div class="absolute bottom-4 left-4 z-20 text-white/70 text-xs backdrop-blur-sm bg-black/30 px-3 py-2 rounded-lg">
      <Icon
        icon="ph:mouse"
        class="w-4 h-4 inline mr-1"
      />
      Drag to rotate • Scroll to zoom
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for model-viewer */
model-viewer {
  --poster-color: transparent;
  --progress-bar-color: #3b82f6;
}

/* Ensure model-viewer is treated as block element */
model-viewer {
  display: block;
}
</style>
