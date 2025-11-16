<script setup lang="ts">
/**
 * UiTabs Component
 *
 * Modern tab system with smooth transitions
 * Follows glassmorphism design pattern
 */

import { Icon } from '@iconify/vue'

export interface Tab {
  id: string
  label: string
  icon?: string
}

interface Props {
  tabs: Tab[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Active tab (uses first tab as default)
 */
const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.id || '',
  set: (value) => emit('update:modelValue', value),
})

/**
 * Select tab
 */
function selectTab(tabId: string) {
  activeTab.value = tabId
}

/**
 * Check if tab is active
 */
function isActive(tabId: string): boolean {
  return activeTab.value === tabId
}
</script>

<template>
  <div class="space-y-4">
    <!-- Tab Navigation -->
    <div class="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="flex-1 relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="isActive(tab.id)
          ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'"
        @click="selectTab(tab.id)"
      >
        <span class="flex items-center justify-center gap-2">
          <Icon v-if="tab.icon" :icon="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="relative">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>
