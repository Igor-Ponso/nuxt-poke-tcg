<script setup lang="ts">
/**
 * AppHeader Component
 *
 * Main navigation header with search, theme toggle, and TCG mode
 */

import { Icon } from '@iconify/vue'

const uiStore = useUIStore()
const tcgStore = useTCGStore()
const pokemonStore = usePokemonStore()
const route = useRoute()

const searchQuery = ref('')
const showSearch = ref(false)

/**
 * Navigation links
 */
const navLinks = computed(() => [
  {
    path: '/',
    label: 'Home',
    icon: 'ph:house',
    active: route.path === '/',
  },
  {
    path: '/pokedex',
    label: 'Pokédex',
    icon: 'ph:books',
    active: route.path.startsWith('/pokedex'),
  },
  {
    path: '/tcg',
    label: 'TCG Gallery',
    icon: 'ph:cards',
    active: route.path.startsWith('/tcg'),
  },
  {
    path: '/team',
    label: 'My Team',
    icon: 'ph:star',
    badge: pokemonStore.favoriteCount,
    active: route.path === '/team',
  },
])

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  uiStore.toggleDarkMode()
  uiStore.showToast(
    uiStore.darkMode ? 'Dark mode enabled' : 'Light mode enabled',
    'success',
    2000
  )
}

/**
 * Toggle TCG mode
 */
function toggleTCGMode() {
  tcgStore.toggleTCGMode()
  uiStore.showToast(
    tcgStore.tcgMode ? 'TCG Mode activated!' : 'TCG Mode deactivated',
    tcgStore.tcgMode ? 'success' : 'info',
    2000
  )
}

/**
 * Handle search
 */
function handleSearch() {
  if (!searchQuery.value.trim()) return

  // Navigate to pokedex with search query
  navigateTo({
    path: '/pokedex',
    query: { search: searchQuery.value },
  })

  // Close search on mobile
  if (uiStore.isMobile) {
    showSearch.value = false
  }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  uiStore.toggleMobileMenu()
}
</script>

<template>
  <header
    class="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 transition-colors"
  >
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group"
          aria-label="Home"
        >
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          >
            <Icon icon="ph:lightning" class="w-6 h-6 text-white" />
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              PokéTCG
            </h1>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Gotta catch 'em all!
            </p>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="
              link.active
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            "
          >
            <span class="inline-flex items-center gap-2">
              <Icon :icon="link.icon" class="w-4 h-4" />
              <span>{{ link.label }}</span>
              <span
                v-if="link.badge"
                class="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white"
              >
                {{ link.badge }}
              </span>
            </span>
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Search (Desktop) -->
          <div class="hidden md:block relative">
            <form @submit.prevent="handleSearch">
              <UiInput
                v-model="searchQuery"
                type="search"
                placeholder="Search Pokémon..."
                icon="ph:magnifying-glass"
                icon-position="left"
                clearable
                :full-width="false"
                class="w-64"
                @clear="searchQuery = ''"
              />
            </form>
          </div>

          <!-- Search Toggle (Mobile) -->
          <UiButton
            variant="ghost"
            size="sm"
            class="md:hidden"
            aria-label="Toggle search"
            @click="showSearch = !showSearch"
          >
            <Icon icon="ph:magnifying-glass" class="w-5 h-5" />
          </UiButton>

          <!-- TCG Mode Toggle -->
          <UiButton
            :variant="tcgStore.tcgMode ? 'primary' : 'ghost'"
            size="sm"
            aria-label="Toggle TCG Mode"
            @click="toggleTCGMode"
          >
            <Icon icon="ph:cards" class="w-5 h-5" />
          </UiButton>

          <!-- Dark Mode Toggle -->
          <UiButton
            variant="ghost"
            size="sm"
            aria-label="Toggle dark mode"
            @click="toggleDarkMode"
          >
            <Icon :icon="uiStore.darkMode ? 'ph:moon' : 'ph:sun'" class="w-5 h-5" />
          </UiButton>

          <!-- Mobile Menu Toggle -->
          <UiButton
            variant="ghost"
            size="sm"
            class="lg:hidden"
            aria-label="Toggle menu"
            @click="toggleMobileMenu"
          >
            <Icon :icon="uiStore.mobileMenuOpen ? 'ph:x' : 'ph:list'" class="w-5 h-5" />
          </UiButton>
        </div>
      </div>

      <!-- Mobile Search (Client-only to prevent hydration mismatch) -->
      <ClientOnly>
        <Transition name="slide-down">
          <div v-if="showSearch && uiStore.isMobile" class="py-4 border-t border-gray-200 dark:border-gray-700">
            <form @submit.prevent="handleSearch">
              <UiInput
                v-model="searchQuery"
                type="search"
                placeholder="Search Pokémon..."
                icon="ph:magnifying-glass"
                icon-position="left"
                clearable
                @clear="searchQuery = ''"
              />
            </form>
          </div>
        </Transition>
      </ClientOnly>

      <!-- Mobile Navigation (Client-only to prevent hydration mismatch) -->
      <ClientOnly>
        <Transition name="slide-down">
          <nav
            v-if="uiStore.mobileMenuOpen"
            class="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700"
          >
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all"
              :class="
                link.active
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              "
              @click="uiStore.closeMobileMenu()"
            >
              <span class="flex items-center gap-3">
                <Icon :icon="link.icon" class="w-5 h-5" />
                <span>{{ link.label }}</span>
              </span>
              <span
                v-if="link.badge"
                class="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white"
              >
                {{ link.badge }}
              </span>
            </NuxtLink>
          </div>
        </nav>
        </Transition>
      </ClientOnly>
    </div>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
