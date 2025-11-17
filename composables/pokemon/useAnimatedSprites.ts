/**
 * Composable for accessing animated Pokemon sprites from Project Pokemon
 *
 * Source: https://projectpokemon.org
 * Credits: pkparaiso for the animations
 *
 * Supports all generations with 3D animated GIFs
 */

/**
 * Get animated sprite URL for a Pokemon
 *
 * @param pokemonName - Pokemon name (lowercase, hyphenated for multi-word names)
 * @param shiny - Whether to get shiny variant
 * @returns URL to the animated GIF sprite
 */
export function getAnimatedSpriteUrl(pokemonName: string, shiny = false): string {
  // Normalize name: lowercase and replace spaces with hyphens
  const normalizedName = pokemonName.toLowerCase().replace(/\s+/g, '-')

  // Project Pokemon hosts animated sprites for all generations
  // Pattern: /images/normal-sprite/ or /images/shiny-sprite/
  const spriteType = shiny ? 'shiny-sprite' : 'normal-sprite'

  return `https://projectpokemon.org/images/${spriteType}/${normalizedName}.gif`
}

/**
 * Composable to use animated sprites
 */
export function useAnimatedSprites() {
  /**
   * Get animated sprite from Pokemon object
   */
  function getAnimatedSprite(pokemon: { name: string }, shiny = false): string {
    return getAnimatedSpriteUrl(pokemon.name, shiny)
  }

  return {
    getAnimatedSprite,
    getAnimatedSpriteUrl,
  }
}
