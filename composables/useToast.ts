/**
 * Toast Notification Composable
 *
 * Global toast notification system for user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  icon?: string
}

// Global state for toasts
const toasts = ref<Toast[]>([])

export function useToast() {
  /**
   * Show a toast notification
   */
  function showToast(
    message: string,
    type: ToastType = 'info',
    duration = 3000,
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Determine icon based on type
    const iconMap: Record<ToastType, string> = {
      success: 'ph:check-circle-fill',
      error: 'ph:x-circle-fill',
      warning: 'ph:warning-fill',
      info: 'ph:info-fill',
    }

    const toast: Toast = {
      id,
      message,
      type,
      duration,
      icon: iconMap[type],
    }

    // Add toast to list
    toasts.value.push(toast)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  /**
   * Remove a toast by ID
   */
  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  function clearAllToasts() {
    toasts.value = []
  }

  // Convenience methods for specific types
  const success = (message: string, duration?: number) =>
    showToast(message, 'success', duration)

  const error = (message: string, duration?: number) =>
    showToast(message, 'error', duration)

  const warning = (message: string, duration?: number) =>
    showToast(message, 'warning', duration)

  const info = (message: string, duration?: number) =>
    showToast(message, 'info', duration)

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  }
}
