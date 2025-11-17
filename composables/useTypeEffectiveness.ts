/**
 * Type Effectiveness Composable
 *
 * Calculate type advantages and weaknesses for Pokemon battles
 */

import type { PokemonType } from '~/types'

// Type effectiveness chart (attacking type -> defending types)
const TYPE_CHART: Record<PokemonType, { strong: PokemonType[], weak: PokemonType[], noEffect: PokemonType[] }> = {
  normal: {
    strong: [],
    weak: ['rock', 'steel'],
    noEffect: ['ghost'],
  },
  fire: {
    strong: ['grass', 'ice', 'bug', 'steel'],
    weak: ['fire', 'water', 'rock', 'dragon'],
    noEffect: [],
  },
  water: {
    strong: ['fire', 'ground', 'rock'],
    weak: ['water', 'grass', 'dragon'],
    noEffect: [],
  },
  electric: {
    strong: ['water', 'flying'],
    weak: ['electric', 'grass', 'dragon'],
    noEffect: ['ground'],
  },
  grass: {
    strong: ['water', 'ground', 'rock'],
    weak: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    noEffect: [],
  },
  ice: {
    strong: ['grass', 'ground', 'flying', 'dragon'],
    weak: ['fire', 'water', 'ice', 'steel'],
    noEffect: [],
  },
  fighting: {
    strong: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weak: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    noEffect: ['ghost'],
  },
  poison: {
    strong: ['grass', 'fairy'],
    weak: ['poison', 'ground', 'rock', 'ghost'],
    noEffect: ['steel'],
  },
  ground: {
    strong: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weak: ['grass', 'bug'],
    noEffect: ['flying'],
  },
  flying: {
    strong: ['grass', 'fighting', 'bug'],
    weak: ['electric', 'rock', 'steel'],
    noEffect: [],
  },
  psychic: {
    strong: ['fighting', 'poison'],
    weak: ['psychic', 'steel'],
    noEffect: ['dark'],
  },
  bug: {
    strong: ['grass', 'psychic', 'dark'],
    weak: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    noEffect: [],
  },
  rock: {
    strong: ['fire', 'ice', 'flying', 'bug'],
    weak: ['fighting', 'ground', 'steel'],
    noEffect: [],
  },
  ghost: {
    strong: ['psychic', 'ghost'],
    weak: ['dark'],
    noEffect: ['normal'],
  },
  dragon: {
    strong: ['dragon'],
    weak: ['steel'],
    noEffect: ['fairy'],
  },
  dark: {
    strong: ['psychic', 'ghost'],
    weak: ['fighting', 'dark', 'fairy'],
    noEffect: [],
  },
  steel: {
    strong: ['ice', 'rock', 'fairy'],
    weak: ['fire', 'water', 'electric', 'steel'],
    noEffect: [],
  },
  fairy: {
    strong: ['fighting', 'dragon', 'dark'],
    weak: ['fire', 'poison', 'steel'],
    noEffect: [],
  },
}

export function useTypeEffectiveness() {
  /**
   * Get types that the given types are strong against (offensive)
   */
  function getStrongAgainst(types: PokemonType[]): PokemonType[] {
    const strongTypes = new Set<PokemonType>()

    types.forEach((type) => {
      TYPE_CHART[type].strong.forEach(t => strongTypes.add(t))
    })

    return Array.from(strongTypes)
  }

  /**
   * Get types that the given types are weak against (offensive)
   */
  function getWeakAgainst(types: PokemonType[]): PokemonType[] {
    const weakTypes = new Set<PokemonType>()

    types.forEach((type) => {
      TYPE_CHART[type].weak.forEach(t => weakTypes.add(t))
    })

    return Array.from(weakTypes)
  }

  /**
   * Get types that the given types have no effect against
   */
  function getNoEffectAgainst(types: PokemonType[]): PokemonType[] {
    const noEffectTypes = new Set<PokemonType>()

    types.forEach((type) => {
      TYPE_CHART[type].noEffect.forEach(t => noEffectTypes.add(t))
    })

    return Array.from(noEffectTypes)
  }

  /**
   * Get types that are super effective AGAINST your team (defensive weaknesses)
   * This inverts the offensive chart: if Fire is strong against Grass, then Grass is weak to Fire
   */
  function getWeakTo(types: PokemonType[]): PokemonType[] {
    const weakToTypes = new Set<PokemonType>()

    // For each type in the team
    types.forEach((defenderType) => {
      // Check all types to see which ones are strong against this defender
      const allTypes = Object.keys(TYPE_CHART) as PokemonType[]
      allTypes.forEach((attackerType) => {
        // If this attacker is strong against our defender, we're weak to it
        if (TYPE_CHART[attackerType].strong.includes(defenderType)) {
          weakToTypes.add(attackerType)
        }
      })
    })

    return Array.from(weakToTypes)
  }

  /**
   * Get offensive coverage score (0-18, higher is better)
   */
  function getCoverageScore(types: PokemonType[]): number {
    return getStrongAgainst(types).length
  }

  return {
    getStrongAgainst,
    getWeakAgainst,
    getNoEffectAgainst,
    getWeakTo,
    getCoverageScore,
  }
}
