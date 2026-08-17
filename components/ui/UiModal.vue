<script setup lang="ts">
/**
 * UiModal Component
 *
 * Reusable modal/dialog component with backdrop, animations, and accessibility
 * Follows WCAG guidelines for dialog patterns
 */

export interface UiModalProps {
  modelValue?: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  hideClose?: boolean
  hideHeader?: boolean
  hideFooter?: boolean
  scrollable?: boolean
  centered?: boolean
  teleportTo?: string
}

const props = withDefaults(defineProps<UiModalProps>(), {
  modelValue: false,
  size: 'md',
  persistent: false,
  hideClose: false,
  hideHeader: false,
  hideFooter: false,
  scrollable: true,
  centered: true,
  teleportTo: 'body',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
  'clickOutside': []
}>()

const modalRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.modelValue)

/**
 * Computed class for modal wrapper
 */
const modalWrapperClass = computed(() => {
  const classes = [
    'fixed',
    'inset-0',
    'z-50',
    'flex',
    'p-4',
    'overflow-auto',
  ]

  if (props.centered) {
    classes.push('items-center', 'justify-center')
  }
  else {
    classes.push('items-start', 'justify-center', 'pt-20')
  }

  return classes.join(' ')
})

/**
 * Computed class for modal content
 */
const modalContentClass = computed(() => {
  const baseClasses = [
    'relative',
    'w-full',
    'bg-white',
    'dark:bg-gray-900',
    'rounded-2xl',
    'shadow-2xl',
    'backdrop-blur-md',
    'border',
    'border-gray-200',
    'dark:border-gray-700',
    'transform',
    'transition-all',
    'duration-300',
  ]

  // Size
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  }
  baseClasses.push(sizeClasses[props.size])

  // Scrollable
  if (props.scrollable) {
    baseClasses.push('max-h-[90vh]', 'flex', 'flex-col')
  }

  return baseClasses.join(' ')
})

/**
 * Close modal
 */
function close() {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

/**
 * Handle backdrop click
 */
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('clickOutside')
    if (!props.persistent) {
      close()
    }
  }
}

/**
 * Handle escape key
 */
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.persistent) {
    close()
  }
}

/**
 * Trap focus within modal
 */
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !modalRef.value) return

  const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (import.meta.client) {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    }
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }
}

/**
 * Watch for modal open/close
 */
watch(isOpen, (value) => {
  if (import.meta.client) {
    if (value) {
      emit('open')
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      // Focus first focusable element
      nextTick(() => {
        const firstFocusable = modalRef.value?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        firstFocusable?.focus()
      })
    }
    else {
      // Restore body scroll
      document.body.style.overflow = ''
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport :to="teleportTo">
    <Transition
      name="modal"
      @after-enter="$emit('open')"
      @after-leave="$emit('close')"
    >
      <div
        v-if="isOpen"
        :class="modalWrapperClass"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        @click="handleBackdropClick"
        @keydown="handleEscape"
        @keydown.tab="trapFocus"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        <!-- Modal content -->
        <div
          ref="modalRef"
          :class="modalContentClass"
        >
          <!-- Header -->
          <div
            v-if="!hideHeader"
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h2
              v-if="title || $slots.header"
              id="modal-title"
              class="text-xl font-semibold text-gray-900 dark:text-white"
            >
              <slot name="header">
                {{ title }}
              </slot>
            </h2>

            <!-- Close button -->
            <button
              v-if="!hideClose"
              type="button"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
              @click="close"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div
            :class="[
              'px-6 py-4',
              scrollable ? 'overflow-y-auto flex-1' : '',
            ]"
          >
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="!hideFooter && $slots.footer"
            class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from > div:last-child {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.modal-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>
