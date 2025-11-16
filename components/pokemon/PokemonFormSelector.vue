<script setup lang="ts">
/**
 * Pokemon Form Selector Component
 *
 * Dropdown to select alternate Pokemon forms (Mega, Gmax, Regional variants, etc.)
 * Shows form icons and labels for available forms
 */

import { Icon } from '@iconify/vue'
import type { PokemonForm } from '~/composables/pokemon/usePokemonForms'

export interface PokemonFormSelectorProps {
  pokemonId: number
  pokemonName: string
  currentForm?: string | null // Current selected form name (e.g., "mega", "gmax")
}

const props = withDefaults(defineProps<PokemonFormSelectorProps>(), {
  currentForm: null,
})

const emit = defineEmits<{
  'update:form': [form: PokemonForm | null]
}>()

const { getAvailableFormsForPokemon, getEnglishFormName } = usePokemonForms()

const availableForms = ref<PokemonForm[]>([])
const isOpen = ref(false)
const isLoading = ref(false)

/**
 * Load available forms on mount
 */
onMounted(async () => {
  await loadForms()
})

/**
 * Load forms for this Pokemon
 */
async function loadForms() {
  isLoading.value = true
  try {
    const forms = await getAvailableFormsForPokemon(props.pokemonId)
    availableForms.value = forms
  }
  catch (error) {
    console.error('Failed to load Pokemon forms:', error)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * Get icon for a form type
 */
function getFormIcon(form: PokemonForm): string {
  const formName = form.form_name.toLowerCase()

  if (formName.includes('mega')) return 'ph:lightning-fill'
  if (formName.includes('gmax') || formName.includes('gigantamax')) return 'ph:arrow-up-bold'
  if (formName.includes('alola')) return 'ph:sun-bold'
  if (formName.includes('galar')) return 'ph:shield-fill'
  if (formName.includes('hisui')) return 'ph:mountains-fill'
  if (formName.includes('paldea')) return 'ph:star-fill'
  if (formName.includes('primal')) return 'ph:fire-fill'
  if (formName.includes('origin')) return 'ph:atom-bold'

  return 'ph:circle'
}

/**
 * Get form label for display
 */
function getFormLabel(form: PokemonForm): string {
  // Get English name if available
  const englishName = getEnglishFormName(form)

  // If it's the base form, just show "Regular"
  if (form.form_name === '' || (!form.is_mega && !form.form_name)) {
    return 'Regular'
  }

  return englishName
}

/**
 * Select a form
 */
function selectForm(form: PokemonForm) {
  emit('update:form', form)
  isOpen.value = false
}

/**
 * Reset to base form
 */
function resetForm() {
  emit('update:form', null)
  isOpen.value = false
}

/**
 * Toggle dropdown
 */
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

/**
 * Close dropdown when clicking outside
 */
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.form-selector')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * Filter out base/default forms - only show special forms
 */
const specialForms = computed(() => {
  return availableForms.value.filter(f => f.form_name !== '' && f.form_name !== props.pokemonName)
})

/**
 * Check if there are special forms (not just base form)
 */
const hasSpecialForms = computed(() => {
  return specialForms.value.length > 0
})
</script>

<template>
  <div
    v-if="hasSpecialForms"
    class="form-selector relative"
  >
    <!-- Trigger button -->
    <button
      type="button"
      class="p-2 sm:p-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
      :class="currentForm ? 'bg-purple-400/30 text-purple-200 shadow-lg shadow-purple-400/50' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'"
      aria-label="Select form"
      @click.stop="toggleDropdown"
    >
      <Icon
        icon="ph:shapes"
        class="w-5 h-5 sm:w-5 sm:h-5"
      />
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        @click.stop
      >
        <!-- Loading state -->
        <div
          v-if="isLoading"
          class="p-4 text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          Loading forms...
        </div>

        <!-- Forms list -->
        <div
          v-else
          class="max-h-64 overflow-y-auto"
        >
          <!-- Reset to base form -->
          <button
            type="button"
            class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            :class="!currentForm ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'"
            @click="resetForm"
          >
            <Icon
              icon="ph:circle"
              class="w-5 h-5 flex-shrink-0"
            />
            <span class="text-sm font-medium">Regular</span>
          </button>

          <!-- Special forms only (excludes base/default form) -->
          <button
            v-for="form in specialForms"
            :key="form.name"
            type="button"
            class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            :class="currentForm === form.name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'"
            @click="selectForm(form)"
          >
            <Icon
              :icon="getFormIcon(form)"
              class="w-5 h-5 flex-shrink-0"
            />
            <span class="text-sm font-medium">{{ getFormLabel(form) }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
