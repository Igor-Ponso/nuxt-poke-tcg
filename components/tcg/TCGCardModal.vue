<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { SimplifiedTCGCard } from '~/types'

defineProps<{
  card: SimplifiedTCGCard | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
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
        v-if="show && card"
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
            class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            @click.stop
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-colors"
              @click="handleClose"
            >
              <Icon icon="ph:x-bold" class="w-6 h-6" />
            </button>

            <!-- Modal Content -->
            <div class="grid md:grid-cols-2 gap-8 p-8">
              <!-- Card Image -->
              <div class="flex items-center justify-center">
                <img
                  :src="card.imageUrl"
                  :alt="card.name"
                  class="w-full max-w-md h-auto rounded-xl shadow-2xl"
                >
              </div>

              <!-- Card Details -->
              <div class="space-y-6">
                <!-- Header -->
                <div>
                  <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {{ card.name }}
                  </h2>
                  <p class="text-xl text-gray-600 dark:text-gray-400">
                    {{ card.setName }}
                  </p>
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Card Number -->
                  <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Card Number
                    </div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">
                      #{{ card.number }}
                    </div>
                  </div>

                  <!-- Rarity -->
                  <div v-if="card.rarity" class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Rarity
                    </div>
                    <div class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ card.rarity }}
                    </div>
                  </div>

                  <!-- Types -->
                  <div v-if="card.types && card.types.length > 0" class="col-span-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Types
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <!-- TODO: Create TCGTypeTag component - TCGType !== PokemonType -->
                      <span
                        v-for="type in card.types"
                        :key="type"
                        class="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-white"
                      >
                        {{ type }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    class="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:heart-fill" class="w-5 h-5" />
                    <span>Add to Favorites</span>
                  </button>
                  <button
                    type="button"
                    class="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex items-center justify-center"
                    title="Share"
                  >
                    <Icon icon="ph:share-network-bold" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
