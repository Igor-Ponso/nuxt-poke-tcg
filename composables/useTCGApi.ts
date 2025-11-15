/**
 * Pokemon TCG API Composable
 *
 * Provides methods to fetch Pokemon TCG card data
 * Includes caching and error handling
 */

import type {
  TCGCard,
  TCGCardsResponse,
  TCGSet,
  TCGSetsResponse,
  TCGCardQueryParams,
  SimplifiedTCGCard,
} from '~/types'

export function useTCGApi() {
  // Use local proxy API to avoid CORS issues
  const baseUrl = '/api/tcg'

  /**
   * Fetches a single card by ID
   */
  async function fetchCard(id: string): Promise<TCGCard> {
    const cacheKey = `tcg_card_${id}`
    const cached = getFromCache<TCGCard>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/cards/${id}`
    const response = await $fetch<{ data: TCGCard }>(url)

    saveToCache(cacheKey, response.data)
    return response.data
  }

  /**
   * Searches cards with query parameters
   */
  async function searchCards(params: TCGCardQueryParams = {}): Promise<TCGCardsResponse> {
    const queryParams = buildQueryParams(params)
    const url = `${baseUrl}/cards?${queryParams}`

    return await $fetch<TCGCardsResponse>(url)
  }

  /**
   * Fetches cards by Pokemon name
   */
  async function fetchCardsByPokemon(pokemonName: string, page = 1, pageSize = 20): Promise<TCGCardsResponse> {
    return await searchCards({
      name: pokemonName,
      page,
      pageSize,
    })
  }

  /**
   * Fetches all sets
   */
  async function fetchSets(): Promise<TCGSet[]> {
    const cacheKey = 'tcg_sets'
    const cached = getFromCache<TCGSet[]>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/sets`
    const response = await $fetch<TCGSetsResponse>(url)

    saveToCache(cacheKey, response.data)
    return response.data
  }

  /**
   * Fetches a single set by ID
   */
  async function fetchSet(id: string): Promise<TCGSet> {
    const cacheKey = `tcg_set_${id}`
    const cached = getFromCache<TCGSet>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${baseUrl}/sets/${id}`
    const response = await $fetch<{ data: TCGSet }>(url)

    saveToCache(cacheKey, response.data)
    return response.data
  }

  /**
   * Fetches cards from a specific set
   */
  async function fetchCardsBySet(setId: string, page = 1, pageSize = 20): Promise<TCGCardsResponse> {
    return await searchCards({
      set: setId,
      page,
      pageSize,
    })
  }

  /**
   * Fetches rare cards (for showcasing special cards)
   */
  async function fetchRareCards(page = 1, pageSize = 20): Promise<TCGCardsResponse> {
    return await searchCards({
      rarity: 'Rare Holo',
      page,
      pageSize,
    })
  }

  /**
   * Converts TCG card to simplified format
   */
  function simplifyTCGCard(card: TCGCard): SimplifiedTCGCard {
    return {
      id: card.id,
      name: card.name,
      imageUrl: card.images.large,
      rarity: card.rarity,
      setName: card.set.name,
      number: card.number,
      types: card.types,
    }
  }

  /**
   * Gets card market price (average)
   */
  function getCardPrice(card: TCGCard): number | null {
    if (card.tcgplayer?.prices?.holofoil?.market) {
      return card.tcgplayer.prices.holofoil.market
    }
    if (card.tcgplayer?.prices?.normal?.market) {
      return card.tcgplayer.prices.normal.market
    }
    if (card.cardmarket?.prices?.averageSellPrice) {
      return card.cardmarket.prices.averageSellPrice
    }
    return null
  }

  /**
   * Checks if a card is holographic/special
   */
  function isHolographicCard(card: TCGCard): boolean {
    if (!card.rarity) return false

    const holoRarities = [
      'Rare Holo',
      'Rare Holo EX',
      'Rare Holo GX',
      'Rare Holo V',
      'Rare Holo VMAX',
      'Rare Holo VSTAR',
      'Rare Ultra',
      'Rare Secret',
      'Rare Rainbow',
      'Rare Shiny',
      'Amazing Rare',
      'Radiant Rare',
      'Illustration Rare',
      'Special Illustration Rare',
      'Hyper Rare',
    ]

    return holoRarities.some(rarity => card.rarity?.includes(rarity))
  }

  /**
   * Gets holographic effect type based on rarity
   */
  function getHolographicType(card: TCGCard): 'standard' | 'reverse' | 'cosmos' | 'radial' | 'prism' {
    if (!card.rarity) return 'standard'

    if (card.rarity.includes('Rainbow')) return 'prism'
    if (card.rarity.includes('Cosmos') || card.rarity.includes('Amazing')) return 'cosmos'
    if (card.rarity.includes('Radiant')) return 'radial'
    if (card.rarity.includes('Reverse')) return 'reverse'

    return 'standard'
  }

  return {
    fetchCard,
    searchCards,
    fetchCardsByPokemon,
    fetchSets,
    fetchSet,
    fetchCardsBySet,
    fetchRareCards,
    simplifyTCGCard,
    getCardPrice,
    isHolographicCard,
    getHolographicType,
  }
}

// ============================================================================
// QUERY BUILDER
// ============================================================================

function buildQueryParams(params: TCGCardQueryParams): string {
  const queryParts: string[] = []

  // Build q parameter (advanced search)
  const qParts: string[] = []

  // Only add parameters if they have actual values
  if (params.name && typeof params.name === 'string' && params.name.trim()) {
    qParts.push(`name:"${params.name}"`)
  }
  if (params.types && typeof params.types === 'string' && params.types.trim()) {
    qParts.push(`types:${params.types}`)
  }
  if (params.rarity && typeof params.rarity === 'string' && params.rarity.trim()) {
    qParts.push(`rarity:"${params.rarity}"`)
  }
  if (params.set && typeof params.set === 'string' && params.set.trim()) {
    qParts.push(`set.id:${params.set}`)
  }
  if (params.nationalPokedexNumbers) {
    qParts.push(`nationalPokedexNumbers:${params.nationalPokedexNumbers}`)
  }

  if (qParts.length > 0) {
    queryParts.push(`q=${encodeURIComponent(qParts.join(' '))}`)
  }

  // Add pagination
  if (params.page) {
    queryParts.push(`page=${params.page}`)
  }
  if (params.pageSize) {
    queryParts.push(`pageSize=${params.pageSize}`)
  }

  // Add ordering
  if (params.orderBy) {
    queryParts.push(`orderBy=${params.orderBy}`)
  }

  return queryParts.join('&')
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

function getFromCache<T>(key: string): T | null {
  if (import.meta.client) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp

      // Cache for 24 hours
      if (age < 24 * 60 * 60 * 1000) {
        return data as T
      }

      // Expired, remove from cache
      localStorage.removeItem(key)
    }
    catch (error) {
      console.warn('Cache read error:', error)
    }
  }

  return null
}

function saveToCache<T>(key: string, data: T): void {
  if (import.meta.client) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    }
    catch (error) {
      console.warn('Cache write error:', error)
    }
  }
}
