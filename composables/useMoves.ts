/**
 * Moves Composable
 *
 * Fetch and manage Pokemon moves from PokeAPI
 */

import type { Move, SimplifiedMove, NamedAPIResourceList, PokemonType } from '~/types'

export function useMoves() {
  const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

  /**
   * Fetch all moves (paginated list)
   */
  async function fetchAllMoves(limit = 1000, offset = 0): Promise<NamedAPIResourceList> {
    const response = await $fetch<NamedAPIResourceList>(`${POKEAPI_BASE}/move`, {
      params: { limit, offset },
    })
    return response
  }

  /**
   * Fetch single move by ID or name
   */
  async function fetchMove(idOrName: string | number): Promise<Move> {
    const response = await $fetch<Move>(`${POKEAPI_BASE}/move/${idOrName}`)
    return response
  }

  /**
   * Convert full Move to SimplifiedMove
   */
  function simplifyMove(move: Move): SimplifiedMove {
    // Get English effect
    const englishEffect = move.effect_entries.find(entry => entry.language.name === 'en')
    const description = englishEffect?.effect || 'No description available'
    const shortEffect = englishEffect?.short_effect || description

    // Get generation name
    const generation = move.generation.name.replace('generation-', 'Gen ').toUpperCase()

    // Determine category based on damage_class
    let category: 'physical' | 'special' | 'status' = 'status'
    if (move.damage_class.name === 'physical') {
      category = 'physical'
    }
    else if (move.damage_class.name === 'special') {
      category = 'special'
    }

    return {
      id: move.id,
      name: move.name,
      type: move.type.name as PokemonType,
      category,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp || 0,
      description,
      shortEffect,
      generation,
      learnedByCount: move.learned_by_pokemon.length,
    }
  }

  /**
   * Fetch and simplify multiple moves
   */
  async function fetchSimplifiedMoves(ids: number[]): Promise<SimplifiedMove[]> {
    const promises = ids.map(id => fetchMove(id))
    const moves = await Promise.all(promises)
    return moves.map(simplifyMove)
  }

  /**
   * Search moves by name or description
   */
  function searchMoves(moves: SimplifiedMove[], query: string): SimplifiedMove[] {
    if (!query.trim())
      return moves

    const lowerQuery = query.toLowerCase()
    return moves.filter(move =>
      move.name.toLowerCase().includes(lowerQuery)
      || move.description.toLowerCase().includes(lowerQuery)
      || move.shortEffect.toLowerCase().includes(lowerQuery),
    )
  }

  /**
   * Filter moves by type
   */
  function filterByType(moves: SimplifiedMove[], type: PokemonType | 'all'): SimplifiedMove[] {
    if (!type || type === 'all')
      return moves

    return moves.filter(move => move.type === type)
  }

  /**
   * Filter moves by category
   */
  function filterByCategory(moves: SimplifiedMove[], category: 'physical' | 'special' | 'status' | 'all'): SimplifiedMove[] {
    if (!category || category === 'all')
      return moves

    return moves.filter(move => move.category === category)
  }

  /**
   * Filter moves by generation
   */
  function filterByGeneration(moves: SimplifiedMove[], generation: string | null): SimplifiedMove[] {
    if (!generation || generation === 'all')
      return moves

    return moves.filter(move => move.generation === generation)
  }

  /**
   * Filter moves by power range
   */
  function filterByPower(moves: SimplifiedMove[], minPower: number | null, maxPower: number | null): SimplifiedMove[] {
    return moves.filter((move) => {
      // If move has no power (status moves), only include if both min and max are null
      if (move.power === null) {
        return minPower === null && maxPower === null
      }

      const meetsMin = minPower === null || move.power >= minPower
      const meetsMax = maxPower === null || move.power <= maxPower

      return meetsMin && meetsMax
    })
  }

  /**
   * Sort moves
   */
  function sortMoves(
    moves: SimplifiedMove[],
    sortBy: 'name' | 'id' | 'power' | 'accuracy' | 'pp' | 'type',
  ): SimplifiedMove[] {
    const sorted = [...moves]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'id':
        return sorted.sort((a, b) => a.id - b.id)
      case 'power':
        return sorted.sort((a, b) => {
          // Null power moves go to the end
          if (a.power === null) return 1
          if (b.power === null) return -1
          return b.power - a.power
        })
      case 'accuracy':
        return sorted.sort((a, b) => {
          // Null accuracy moves go to the end
          if (a.accuracy === null) return 1
          if (b.accuracy === null) return -1
          return b.accuracy - a.accuracy
        })
      case 'pp':
        return sorted.sort((a, b) => b.pp - a.pp)
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type))
      default:
        return sorted
    }
  }

  return {
    fetchAllMoves,
    fetchMove,
    simplifyMove,
    fetchSimplifiedMoves,
    searchMoves,
    filterByType,
    filterByCategory,
    filterByGeneration,
    filterByPower,
    sortMoves,
  }
}
