/**
 * UI Store (Pinia)
 *
 * Manages global UI state (modals, toasts, loading, dark mode, etc.)
 */

import { defineStore } from 'pinia'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

interface Modal {
  id: string
  component: string
  props?: Record<string, unknown>
  onClose?: () => void
}

interface UIState {
  // Loading states
  globalLoading: boolean
  loadingMessage: string | null

  // Modals
  modals: Modal[]

  // Toasts/Notifications
  toasts: Toast[]

  // Dark mode
  darkMode: boolean

  // Sidebar/Menu
  sidebarOpen: boolean
  mobileMenuOpen: boolean

  // Scroll position
  scrollY: number
  scrollDirection: 'up' | 'down' | null

  // Window size
  windowWidth: number
  windowHeight: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // Animations
  reduceMotion: boolean
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    globalLoading: false,
    loadingMessage: null,

    modals: [],
    toasts: [],

    darkMode: true, // Default to dark mode

    sidebarOpen: false,
    mobileMenuOpen: false,

    scrollY: 0,
    scrollDirection: null,

    windowWidth: 0,
    windowHeight: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,

    reduceMotion: false,
  }),

  getters: {
    /**
     * Check if any modal is open
     */
    hasOpenModal(state): boolean {
      return state.modals.length > 0
    },

    /**
     * Get the top modal (most recent)
     */
    topModal(state): Modal | null {
      return state.modals[state.modals.length - 1] || null
    },

    /**
     * Get breakpoint name
     */
    breakpoint(state): 'mobile' | 'tablet' | 'desktop' {
      if (state.isMobile) return 'mobile'
      if (state.isTablet) return 'tablet'
      return 'desktop'
    },
  },

  actions: {
    /**
     * Sets global loading state
     */
    setLoading(loading: boolean, message?: string) {
      this.globalLoading = loading
      this.loadingMessage = message || null
    },

    /**
     * Opens a modal
     */
    openModal(component: string, props?: Record<string, unknown>, onClose?: () => void) {
      if (import.meta.client) {
        const modal: Modal = {
          id: `modal_${Date.now()}_${Math.random()}`,
          component,
          props,
          onClose,
        }

        this.modals.push(modal)
      }
    },

    /**
     * Closes the top modal
     */
    closeModal() {
      const modal = this.modals.pop()
      if (modal && modal.onClose) {
        modal.onClose()
      }
    },

    /**
     * Closes a specific modal by ID
     */
    closeModalById(id: string) {
      const index = this.modals.findIndex(m => m.id === id)
      if (index >= 0) {
        const modal = this.modals[index]
        this.modals.splice(index, 1)
        if (modal && modal.onClose) {
          modal.onClose()
        }
      }
    },

    /**
     * Closes all modals
     */
    closeAllModals() {
      this.modals.forEach((modal) => {
        if (modal && modal.onClose) {
          modal.onClose()
        }
      })
      this.modals = []
    },

    /**
     * Shows a toast notification
     */
    showToast(
      message: string,
      type: Toast['type'] = 'info',
      duration = 3000,
    ) {
      if (import.meta.client) {
        const toast: Toast = {
          id: `toast_${Date.now()}_${Math.random()}`,
          message,
          type,
          duration,
        }

        this.toasts.push(toast)

        // Auto-remove after duration
        if (duration > 0) {
          setTimeout(() => {
            this.removeToast(toast.id)
          }, duration)
        }
      }
    },

    /**
     * Removes a toast
     */
    removeToast(id: string) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index >= 0) {
        this.toasts.splice(index, 1)
      }
    },

    /**
     * Toggles dark mode
     */
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.saveDarkModePreference()
      this.applyDarkMode()
    },

    /**
     * Sets dark mode
     */
    setDarkMode(enabled: boolean) {
      this.darkMode = enabled
      this.saveDarkModePreference()
      this.applyDarkMode()
    },

    /**
     * Applies dark mode to document
     */
    applyDarkMode() {
      if (import.meta.client) {
        if (this.darkMode) {
          document.documentElement.classList.add('dark')
        }
        else {
          document.documentElement.classList.remove('dark')
        }
      }
    },

    /**
     * Saves dark mode preference
     */
    saveDarkModePreference() {
      if (import.meta.client) {
        localStorage.setItem('dark_mode', String(this.darkMode))
      }
    },

    /**
     * Loads dark mode preference
     */
    loadDarkModePreference() {
      if (import.meta.client) {
        const stored = localStorage.getItem('dark_mode')
        if (stored !== null) {
          this.darkMode = stored === 'true'
        }
        else {
          // Check system preference
          this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        this.applyDarkMode()
      }
    },

    /**
     * Toggles sidebar
     */
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    /**
     * Toggles mobile menu
     */
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },

    /**
     * Closes mobile menu
     */
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },

    /**
     * Updates scroll position
     */
    updateScroll(y: number) {
      const previous = this.scrollY
      this.scrollY = y

      // Detect scroll direction
      if (y > previous) {
        this.scrollDirection = 'down'
      }
      else if (y < previous) {
        this.scrollDirection = 'up'
      }
    },

    /**
     * Updates window size
     */
    updateWindowSize(width: number, height: number) {
      this.windowWidth = width
      this.windowHeight = height

      // Update breakpoints
      this.isMobile = width < 768
      this.isTablet = width >= 768 && width < 1024
      this.isDesktop = width >= 1024
    },

    /**
     * Checks for reduced motion preference
     */
    checkReduceMotion() {
      if (import.meta.client) {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
    },

    /**
     * Initialize UI store
     */
    initialize() {
      if (import.meta.client) {
        // Load preferences
        this.loadDarkModePreference()
        this.checkReduceMotion()

        // Set up window size listener
        this.updateWindowSize(window.innerWidth, window.innerHeight)
        window.addEventListener('resize', () => {
          this.updateWindowSize(window.innerWidth, window.innerHeight)
        })

        // Set up scroll listener
        window.addEventListener('scroll', () => {
          this.updateScroll(window.scrollY)
        })

        // Set up reduced motion listener
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
          this.checkReduceMotion()
        })
      }
    },
  },
})
