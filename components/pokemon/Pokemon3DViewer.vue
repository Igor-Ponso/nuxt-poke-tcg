<script setup lang="ts">
/**
 * Pokemon 3D Viewer Component
 *
 * Renders Pokemon 3D models using Google Model Viewer
 * Supports rotation, zoom, and form switching (regular/shiny)
 */

import { Icon } from '@iconify/vue'

// Dynamic import to avoid SSR issues
if (import.meta.client) {
  import('@google/model-viewer')
}

export interface Pokemon3DViewerProps {
  pokemonId: number
  pokemonName: string
  form?: 'regular' | 'shiny'
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
  formChange: [form: 'regular' | 'shiny']
  loaded: []
  error: [error: Error]
}>()

const { getModelUrl } = usePokemon3D()
const currentForm = ref(props.form)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const modelViewerRef = ref<any>(null)
const cameraOrbit = ref('0deg 75deg 2.5m')

/**
 * Computed model URL based on current form
 */
const modelUrl = computed(() => {
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
    const modelViewer = modelViewerRef.value

    // Wait for model to be ready
    nextTick(() => {
      // Auto-frame the model to fit nicely in view
      if (modelViewer.getDimensions) {
        const dimensions = modelViewer.getDimensions()
        const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z)

        // Calculate optimal distance based on model size
        // Larger models need more distance
        const distance = maxDimension * 2.5
        const clampedDistance = Math.max(1.5, Math.min(distance, 8)) // Between 1.5m and 8m

        cameraOrbit.value = `0deg 75deg ${clampedDistance}m`

        // Update camera orbit
        modelViewer.cameraOrbit = cameraOrbit.value
        modelViewer.fieldOfView = '30deg'
      }

      // Play animation if available and autoplay is enabled
      if (props.autoplayAnimation) {
        if (modelViewer.availableAnimations && modelViewer.availableAnimations.length > 0) {
          modelViewer.autoplay = true
          modelViewer.animationName = modelViewer.availableAnimations[0]
          modelViewer.play()
        }
      }
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
  <div class="pokemon-3d-viewer relative">
    <!-- Loading Spinner -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10"
    >
      <UiLoading type="pokeball" size="lg" message="Loading 3D model..." />
    </div>

    <!-- Error State -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10 p-6 text-center"
    >
      <Icon icon="ph:warning-circle-fill" class="w-16 h-16 text-yellow-500 mb-4" />
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
        width: '100%',
        height: height,
        backgroundColor: backgroundColor,
      }"
      class="rounded-2xl overflow-hidden"
      field-of-view="30deg"
      min-camera-orbit="auto auto 0.5m"
      max-camera-orbit="auto auto 10m"
      shadow-intensity="1"
      exposure="1"
      tone-mapping="neutral"
      autoplay
      @load="handleLoad"
      @error="handleError"
    >
      <!-- Loading slot -->
      <div slot="poster" class="flex items-center justify-center w-full h-full bg-gray-800/50">
        <UiLoading type="pokeball" size="md" />
      </div>
    </model-viewer>

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
      <Icon icon="ph:mouse" class="w-4 h-4 inline mr-1" />
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
