<script setup lang="ts">
/**
 * UiInput Component
 *
 * Reusable input component with multiple types and validation states
 * Follows glassmorphism design pattern from architecture
 */

export interface UiInputProps {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  clearable?: boolean
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
  step?: number
  autocomplete?: string
  name?: string
  id?: string
  ariaLabel?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<UiInputProps>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  iconPosition: 'left',
  clearable: false,
  fullWidth: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
  enter: [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

/**
 * Generate stable ID for SSR/hydration using Nuxt's useId
 */
const inputId = computed(() => props.id || useId())

/**
 * Computed class for container
 */
const containerClass = computed(() => {
  const classes = ['relative', 'flex', 'flex-col', 'gap-1.5']
  if (props.fullWidth) classes.push('w-full')
  return classes.join(' ')
})

/**
 * Computed class for input wrapper
 */
const inputWrapperClass = computed(() => {
  const baseClasses = [
    'relative',
    'flex',
    'items-center',
    'gap-2',
    'px-4',
    'py-2.5',
    'rounded-xl',
    'border',
    'transition-all',
    'duration-200',
    'backdrop-blur-md',
  ]

  // State classes
  if (props.error) {
    baseClasses.push(
      'border-red-500',
      'bg-red-50/50',
      'dark:bg-red-900/20',
      'focus-within:ring-2',
      'focus-within:ring-red-500'
    )
  }
  else if (isFocused.value) {
    baseClasses.push(
      'border-blue-500',
      'bg-white/50',
      'dark:bg-gray-800/50',
      'ring-2',
      'ring-blue-500/50'
    )
  }
  else {
    baseClasses.push(
      'border-gray-300',
      'dark:border-gray-600',
      'bg-white/30',
      'dark:bg-gray-800/30',
      'hover:border-gray-400',
      'dark:hover:border-gray-500'
    )
  }

  // Disabled state
  if (props.disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed')
  }

  return baseClasses.join(' ')
})

/**
 * Computed class for input element
 */
const inputClass = computed(() => {
  return [
    'flex-1',
    'bg-transparent',
    'border-0',
    'outline-none',
    'text-gray-900',
    'dark:text-white',
    'placeholder-gray-500',
    'dark:placeholder-gray-400',
    'disabled:cursor-not-allowed',
  ].join(' ')
})

/**
 * Handle input event
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

/**
 * Handle focus event
 */
function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

/**
 * Handle blur event
 */
function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

/**
 * Handle clear button
 */
function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

/**
 * Handle Enter key
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('enter', event)
  }
}

/**
 * Focus the input programmatically
 */
function focus() {
  inputRef.value?.focus()
}

/**
 * Blur the input programmatically
 */
function blur() {
  inputRef.value?.blur()
}

// Expose methods
defineExpose({
  focus,
  blur,
  inputRef,
})
</script>

<template>
  <div :class="containerClass">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input wrapper -->
    <div :class="inputWrapperClass">
      <!-- Icon (left) -->
      <span
        v-if="icon && iconPosition === 'left'"
        class="flex-shrink-0 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      >
        <slot name="icon-left">
          {{ icon }}
        </slot>
      </span>

      <!-- Input element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxLength"
        :minlength="minLength"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :aria-label="ariaLabel || label"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        :class="inputClass"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >

      <!-- Clear button -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        aria-label="Clear input"
        @click="handleClear"
      >
        <svg
          class="w-4 h-4"
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

      <!-- Icon (right) -->
      <span
        v-if="icon && iconPosition === 'right'"
        class="flex-shrink-0 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      >
        <slot name="icon-right">
          {{ icon }}
        </slot>
      </span>
    </div>

    <!-- Hint text -->
    <p
      v-if="hint && !error"
      :id="`${inputId}-hint`"
      class="text-xs text-gray-600 dark:text-gray-400"
    >
      {{ hint }}
    </p>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="text-xs text-red-600 dark:text-red-400 font-medium"
      role="alert"
    >
      {{ error }}
    </p>

    <!-- Character count -->
    <p
      v-if="maxLength && modelValue"
      class="text-xs text-gray-600 dark:text-gray-400 text-right"
    >
      {{ String(modelValue).length }} / {{ maxLength }}
    </p>
  </div>
</template>
