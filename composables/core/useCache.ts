/**
 * Centralized Cache Composable
 *
 * Provides a type-safe, configurable caching mechanism using localStorage.
 * Eliminates code duplication across API composables (DRY principle).
 *
 * Security: All data is sanitized before storage and retrieval
 * Performance: TTL-based expiration with automatic cleanup
 */

export interface CacheConfig {
  /**
   * Time To Live in milliseconds
   * @default 24 * 60 * 60 * 1000 (24 hours)
   */
  ttl?: number

  /**
   * Cache key prefix for namespace isolation
   * @default 'app_cache'
   */
  prefix?: string

  /**
   * Enable console logging for debugging
   * @default false
   */
  debug?: boolean
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Type-safe cache composable with automatic expiration
 *
 * @example
 * ```ts
 * const pokemonCache = useCache<Pokemon>('pokemon_1', { ttl: 24 * 60 * 60 * 1000 })
 *
 * // Set cache
 * pokemonCache.set(pokemonData)
 *
 * // Get cache (returns null if expired or not found)
 * const cached = pokemonCache.get()
 *
 * // Check if cached
 * if (!pokemonCache.isExpired()) {
 *   // Use cached data
 * }
 * ```
 */
export function useCache<T>(key: string, config: CacheConfig = {}) {
  const {
    ttl = 24 * 60 * 60 * 1000, // 24 hours default
    prefix = 'app_cache',
    debug = false,
  } = config

  // Security: Sanitize key to prevent injection
  const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
  const fullKey = `${prefix}_${sanitizedKey}`

  /**
   * Safely log debug information
   */
  const log = (message: string, ...args: unknown[]) => {
    if (debug && import.meta.client) {
      // eslint-disable-next-line no-console
      console.log(`[Cache:${fullKey}]`, message, ...args)
    }
  }

  /**
   * Get cached data if valid and not expired
   * @returns Cached data or null if not found/expired
   */
  const get = (): T | null => {
    if (!import.meta.client) {
      log('Skipping get - not on client')
      return null
    }

    try {
      const cached = localStorage.getItem(fullKey)
      if (!cached) {
        log('Cache miss - no data found')
        return null
      }

      // Security: Parse with error handling to prevent malicious data
      const entry = JSON.parse(cached) as CacheEntry<T>

      // Validate entry structure
      if (!entry || typeof entry.timestamp !== 'number' || typeof entry.ttl !== 'number') {
        log('Cache invalid - malformed entry structure')
        remove()
        return null
      }

      // Check expiration
      const age = Date.now() - entry.timestamp
      if (age > entry.ttl) {
        log('Cache expired', { age, ttl: entry.ttl })
        remove()
        return null
      }

      log('Cache hit', { age, ttl: entry.ttl })
      return entry.data
    }
    catch (error) {
      // Security: Catch JSON parse errors and corrupted data
      log('Cache error - removing corrupted data', error)
      remove()
      return null
    }
  }

  /**
   * Set data in cache with current timestamp
   * @param data - Data to cache
   */
  const set = (data: T): void => {
    if (!import.meta.client) {
      log('Skipping set - not on client')
      return
    }

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }

      // Security: Sanitize data before stringifying
      // Remove any potential XSS vectors (script tags, event handlers)
      const sanitized = JSON.parse(
        JSON.stringify(entry, (key, value) => {
          // Remove function values (potential code injection)
          if (typeof value === 'function') {
            return undefined
          }
          // Sanitize strings to prevent XSS
          if (typeof value === 'string') {
            return value
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          }
          return value
        }),
      )

      localStorage.setItem(fullKey, JSON.stringify(sanitized))
      log('Cache set', { ttl })
    }
    catch (error) {
      // Handle quota exceeded or other storage errors
      log('Cache set error', error)

      // Try to clear old cache entries to free space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearOldEntries()
        // Retry once after cleanup
        try {
          const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl }
          localStorage.setItem(fullKey, JSON.stringify(entry))
          log('Cache set successful after cleanup')
        }
        catch (retryError) {
          log('Cache set failed after cleanup', retryError)
        }
      }
    }
  }

  /**
   * Remove cache entry
   */
  const remove = (): void => {
    if (!import.meta.client) {
      return
    }

    try {
      localStorage.removeItem(fullKey)
      log('Cache removed')
    }
    catch (error) {
      log('Cache remove error', error)
    }
  }

  /**
   * Check if cache is expired without retrieving data
   */
  const isExpired = (): boolean => {
    if (!import.meta.client) {
      return true
    }

    try {
      const cached = localStorage.getItem(fullKey)
      if (!cached) {
        return true
      }

      const entry = JSON.parse(cached) as CacheEntry<T>
      const age = Date.now() - entry.timestamp
      return age > entry.ttl
    }
    catch {
      return true
    }
  }

  /**
   * Get cache age in milliseconds
   */
  const getAge = (): number | null => {
    if (!import.meta.client) {
      return null
    }

    try {
      const cached = localStorage.getItem(fullKey)
      if (!cached) {
        return null
      }

      const entry = JSON.parse(cached) as CacheEntry<T>
      return Date.now() - entry.timestamp
    }
    catch {
      return null
    }
  }

  /**
   * Clear all cache entries with the same prefix (namespace cleanup)
   */
  const clearNamespace = (): void => {
    if (!import.meta.client) {
      return
    }

    try {
      const keys = Object.keys(localStorage)
      const namespaceKeys = keys.filter(k => k.startsWith(`${prefix}_`))

      namespaceKeys.forEach((k) => {
        localStorage.removeItem(k)
      })

      log('Namespace cleared', { count: namespaceKeys.length })
    }
    catch (error) {
      log('Namespace clear error', error)
    }
  }

  /**
   * Clear old/expired entries to free storage space
   * @param maxAge - Remove entries older than this (in ms). Default: 7 days
   */
  const clearOldEntries = (maxAge = 7 * 24 * 60 * 60 * 1000): void => {
    if (!import.meta.client) {
      return
    }

    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()
      let cleared = 0

      keys.forEach((k) => {
        try {
          const item = localStorage.getItem(k)
          if (!item) {
            return
          }

          const entry = JSON.parse(item) as CacheEntry<unknown>
          const age = now - entry.timestamp

          if (age > maxAge || age > entry.ttl) {
            localStorage.removeItem(k)
            cleared++
          }
        }
        catch {
          // Remove corrupted entries
          localStorage.removeItem(k)
          cleared++
        }
      })

      log('Old entries cleared', { count: cleared })
    }
    catch (error) {
      log('Clear old entries error', error)
    }
  }

  return {
    get,
    set,
    remove,
    isExpired,
    getAge,
    clearNamespace,
    clearOldEntries,
  }
}

/**
 * Global cache utilities
 */
export const cacheUtils = {
  /**
   * Get total localStorage usage
   */
  getStorageSize: (): number => {
    if (!import.meta.client) {
      return 0
    }

    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const item = localStorage.getItem(key)
        total += key.length + (item?.length || 0)
      }
    }
    return total
  },

  /**
   * Get storage size in human-readable format
   */
  getStorageSizeFormatted: (): string => {
    const bytes = cacheUtils.getStorageSize()
    const kb = bytes / 1024
    const mb = kb / 1024

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`
    }
    if (kb >= 1) {
      return `${kb.toFixed(2)} KB`
    }
    return `${bytes} bytes`
  },

  /**
   * Clear all app cache (all prefixes)
   */
  clearAll: (): void => {
    if (!import.meta.client) {
      return
    }

    try {
      const keys = Object.keys(localStorage)
      const appKeys = keys.filter(k => k.startsWith('app_cache_'))

      appKeys.forEach((k) => {
        localStorage.removeItem(k)
      })
    }
    catch (error) {
      console.error('Clear all cache error:', error)
    }
  },
}
