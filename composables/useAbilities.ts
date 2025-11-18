/**
 * Abilities Composable
 *
 * Fetch and manage Pokemon abilities from PokeAPI
 */

import type { Ability, SimplifiedAbility, NamedAPIResourceList } from '~/types'

export function useAbilities() {
  const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

  /**
   * Fetch all abilities (paginated list)
   */
  async function fetchAllAbilities(limit = 1000, offset = 0): Promise<NamedAPIResourceList> {
    const response = await $fetch<NamedAPIResourceList>(`${POKEAPI_BASE}/ability`, {
      params: { limit, offset },
    })
    return response
  }

  /**
   * Fetch single ability by ID or name
   */
  async function fetchAbility(idOrName: string | number): Promise<Ability> {
    const response = await $fetch<Ability>(`${POKEAPI_BASE}/ability/${idOrName}`)
    return response
  }

  /**
   * Convert full Ability to SimplifiedAbility
   */
  function simplifyAbility(ability: Ability): SimplifiedAbility {
    // Get English effect
    const englishEffect = ability.effect_entries.find(entry => entry.language.name === 'en')
    const description = englishEffect?.effect || 'No description available'
    const shortEffect = englishEffect?.short_effect || description

    // Get generation name
    const generation = ability.generation.name.replace('generation-', 'Gen ').toUpperCase()

    return {
      id: ability.id,
      name: ability.name,
      description,
      shortEffect,
      generation,
      pokemonCount: ability.pokemon.length,
      isMainSeries: ability.is_main_series,
    }
  }

  /**
   * Fetch and simplify multiple abilities
   */
  async function fetchSimplifiedAbilities(ids: number[]): Promise<SimplifiedAbility[]> {
    const promises = ids.map(id => fetchAbility(id))
    const abilities = await Promise.all(promises)
    return abilities.map(simplifyAbility)
  }

  /**
   * Search abilities by name
   */
  function searchAbilities(abilities: SimplifiedAbility[], query: string): SimplifiedAbility[] {
    if (!query.trim())
      return abilities

    const lowerQuery = query.toLowerCase()
    return abilities.filter(ability =>
      ability.name.toLowerCase().includes(lowerQuery)
      || ability.description.toLowerCase().includes(lowerQuery)
      || ability.shortEffect.toLowerCase().includes(lowerQuery),
    )
  }

  /**
   * Filter abilities by generation
   */
  function filterByGeneration(abilities: SimplifiedAbility[], generation: string | null): SimplifiedAbility[] {
    if (!generation || generation === 'all')
      return abilities

    return abilities.filter(ability => ability.generation === generation)
  }

  /**
   * Sort abilities
   */
  function sortAbilities(
    abilities: SimplifiedAbility[],
    sortBy: 'name' | 'id' | 'pokemon-count' | 'generation',
  ): SimplifiedAbility[] {
    const sorted = [...abilities]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'id':
        return sorted.sort((a, b) => a.id - b.id)
      case 'pokemon-count':
        return sorted.sort((a, b) => b.pokemonCount - a.pokemonCount)
      case 'generation':
        return sorted.sort((a, b) => a.generation.localeCompare(b.generation))
      default:
        return sorted
    }
  }

  return {
    fetchAllAbilities,
    fetchAbility,
    simplifyAbility,
    fetchSimplifiedAbilities,
    searchAbilities,
    filterByGeneration,
    sortAbilities,
  }
}
