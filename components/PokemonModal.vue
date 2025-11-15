<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { SimplifiedPokemon } from '~/types'

const props = defineProps<{
  pokemon: SimplifiedPokemon | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const pokemonStore = usePokemonStore()
const show3D = ref(false)
const showShiny = ref(false)

const isFavorite = computed(() => {
  return props.pokemon ? pokemonStore.isFavorite(props.pokemon.id) : false
})

const currentSprite = computed(() => {
  if (!props.pokemon) return ''
  return showShiny.value && props.pokemon.shinySprite
    ? props.pokemon.shinySprite
    : props.pokemon.sprite
})

function handleClose() {
  show3D.value = false
  showShiny.value = false
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
            class="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            @click.stop
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute top-4 right-4 z-30 p-2 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-colors"
              @click="handleClose"
            >
              <Icon icon="ph:x-bold" class="w-6 h-6" />
            </button>

            <!-- Modal Content -->
            <div class="p-8">
              <!-- Header -->
              <div class="flex items-start justify-between mb-6">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      #{{ pokemon.id.toString().padStart(3, '0') }}
                    </span>
                  </div>
                  <h2 class="text-4xl font-bold text-gray-900 dark:text-white capitalize">
                    {{ formatPokemonName(pokemon.name) }}
                  </h2>
                  <div class="flex items-center gap-2 mt-3">
                    <PokemonTypeTag
                      v-for="type in pokemon.types"
                      :key="type"
                      :type="type"
                      size="md"
                    />
                  </div>
                </div>
              </div>

              <!-- Main Content Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Image / 3D Model Viewer -->
                <div class="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
                  <!-- View Toggle Buttons -->
                  <div class="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                      type="button"
                      class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
                      :class="!show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                      @click="show3D = false"
                    >
                      <Icon icon="ph:image" class="w-4 h-4" />
                      2D
                    </button>
                    <button
                      type="button"
                      class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
                      :class="show3D ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                      @click="show3D = true"
                    >
                      <Icon icon="ph:cube" class="w-4 h-4" />
                      3D
                    </button>
                  </div>

                  <!-- Shiny Toggle -->
                  <div class="absolute top-4 left-4 z-20">
                    <button
                      v-if="pokemon.shinySprite"
                      type="button"
                      class="px-3 py-2 rounded-lg backdrop-blur-md transition-all duration-300 flex items-center gap-2"
                      :class="showShiny
                        ? 'bg-yellow-400/30 text-yellow-300 shadow-lg shadow-yellow-400/50'
                        : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'"
                      @click="showShiny = !showShiny"
                    >
                      <Icon icon="ph:sparkle-fill" class="w-4 h-4" />
                      Shiny
                    </button>
                  </div>

                  <!-- 2D Sprite View -->
                  <div v-if="!show3D" class="text-center py-8">
                    <div class="relative inline-block">
                      <img
                        :src="currentSprite"
                        :alt="pokemon.name"
                        class="w-64 h-64 mx-auto object-contain drop-shadow-2xl transition-all duration-300"
                        :class="{ 'animate-pulse': showShiny }"
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
                    <ClientOnly>
                      <Pokemon3DViewer
                        :pokemon-id="pokemon.id"
                        :pokemon-name="pokemon.name"
                        :form="showShiny ? 'shiny' : 'regular'"
                        height="400px"
                        :auto-rotate="true"
                        :camera-controls="true"
                        :show-form-toggle="false"
                      />
                      <template #fallback>
                        <div class="flex items-center justify-center h-[400px] text-gray-500">
                          <Icon icon="ph:circle-notch" class="w-8 h-8 animate-spin" />
                        </div>
                      </template>
                    </ClientOnly>
                  </div>
                </div>

                <!-- Stats -->
                <div class="space-y-6">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Base Stats
                    </h3>
                    <div class="space-y-3">
                      <div v-for="(value, stat) in pokemon.stats" :key="stat" class="space-y-1">
                        <div class="flex items-center justify-between text-sm">
                          <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {{ stat }}
                          </span>
                          <span class="font-bold text-gray-900 dark:text-white">
                            {{ value }}
                          </span>
                        </div>
                        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            :style="{ width: `${Math.min((value / 255) * 100, 100)}%` }"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      class="w-full px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      :class="isFavorite
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'"
                      @click="toggleFavorite"
                    >
                      <Icon :icon="isFavorite ? 'ph:heart-fill' : 'ph:heart'" class="w-5 h-5" />
                      <span>{{ isFavorite ? 'Remove from' : 'Add to' }} Team</span>
                    </button>
                    <button
                      type="button"
                      class="w-full px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center justify-center gap-2"
                      @click="playCry"
                    >
                      <Icon icon="ph:speaker-high-bold" class="w-5 h-5" />
                      <span>Play Cry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
