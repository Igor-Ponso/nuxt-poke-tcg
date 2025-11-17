/**
 * Game Sprites Composable
 *
 * Helper to get Pokemon sprites from different game versions
 */

import type { Pokemon } from '~/types'
import { getAnimatedSpriteUrl } from './useAnimatedSprites'

/**
 * Map of game version IDs to their generation and game path in the API
 */
const GAME_VERSION_MAP: Record<string, { generation: string, game: string }> = {
  'red-blue': { generation: 'generation-i', game: 'red-blue' },
  'yellow': { generation: 'generation-i', game: 'yellow' },
  'gold': { generation: 'generation-ii', game: 'gold' },
  'silver': { generation: 'generation-ii', game: 'silver' },
  'crystal': { generation: 'generation-ii', game: 'crystal' },
  'ruby-sapphire': { generation: 'generation-iii', game: 'ruby-sapphire' },
  'emerald': { generation: 'generation-iii', game: 'emerald' },
  'firered-leafgreen': { generation: 'generation-iii', game: 'firered-leafgreen' },
  'diamond-pearl': { generation: 'generation-iv', game: 'diamond-pearl' },
  'platinum': { generation: 'generation-iv', game: 'platinum' },
  'heartgold-soulsilver': { generation: 'generation-iv', game: 'heartgold-soulsilver' },
  'black-white': { generation: 'generation-v', game: 'black-white' },
  'omegaruby-alphasapphire': { generation: 'generation-vi', game: 'omegaruby-alphasapphire' },
  'ultra-sun-ultra-moon': { generation: 'generation-vii', game: 'ultra-sun-ultra-moon' },
  'icons': { generation: 'generation-viii', game: 'icons' },
}

export function useGameSprites() {
  /**
   * Gets the sprite URL for a specific game version
   */
  function getGameSprite(
    pokemon: Pokemon,
    gameVersionId: string | null,
    shiny = false,
  ): string {
    // If no game version selected, use official artwork
    if (!gameVersionId) {
      const officialArtwork = pokemon.sprites.other?.['official-artwork']
      if (shiny && officialArtwork?.front_shiny) {
        return officialArtwork.front_shiny
      }
      return officialArtwork?.front_default || pokemon.sprites.front_default || ''
    }

    // Special case: Animated sprites from Project Pokemon
    if (gameVersionId === 'animated') {
      return getAnimatedSpriteUrl(pokemon.name, shiny)
    }

    // Get the generation and game path
    const versionInfo = GAME_VERSION_MAP[gameVersionId]
    if (!versionInfo) {
      // Fallback to official artwork if invalid version
      const officialArtwork = pokemon.sprites.other?.['official-artwork']
      return officialArtwork?.front_default || pokemon.sprites.front_default || ''
    }

    // Access sprites.versions[generation][game]
    const versions = pokemon.sprites.versions
    if (!versions) {
      return pokemon.sprites.front_default || ''
    }

    const generationSprites = versions[versionInfo.generation]
    if (!generationSprites) {
      return pokemon.sprites.front_default || ''
    }

    const gameSprites = generationSprites[versionInfo.game]
    if (!gameSprites) {
      return pokemon.sprites.front_default || ''
    }

    // Try to get the shiny sprite if requested
    if (shiny && 'front_shiny' in gameSprites && gameSprites.front_shiny) {
      return gameSprites.front_shiny
    }

    // Get the default sprite (prefer front_default, fallback to front_transparent, then front_gray)
    if ('front_default' in gameSprites && gameSprites.front_default) {
      return gameSprites.front_default
    }

    if ('front_transparent' in gameSprites && gameSprites.front_transparent) {
      return gameSprites.front_transparent as string
    }

    if ('front_gray' in gameSprites && gameSprites.front_gray) {
      return gameSprites.front_gray as string
    }

    // Final fallback
    return pokemon.sprites.front_default || ''
  }

  return {
    getGameSprite,
  }
}
