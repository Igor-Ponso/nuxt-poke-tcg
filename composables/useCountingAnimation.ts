/**
 * Counting Animation Composable
 *
 * Animates numbers counting from 0 to a target value
 */

export function useCountingAnimation() {
  /**
   * Animate a number counting from 0 to target
   */
  function animateCount(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: (t: number) => number = t => t, // Linear by default
  ) {
    const startTime = performance.now()

    function update(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)
      const current = from + (to - from) * easedProgress

      onUpdate(current)

      if (progress < 1) {
        requestAnimationFrame(update)
      }
      else {
        onUpdate(to) // Ensure we end exactly at target
      }
    }

    requestAnimationFrame(update)
  }

  /**
   * Ease-out cubic easing function
   */
  function easeOutCubic(t: number): number {
    return 1 - (1 - t) ** 3
  }

  /**
   * Ease-in-out cubic easing function
   */
  function easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - (-2 * t + 2) ** 3 / 2
  }

  return {
    animateCount,
    easeOutCubic,
    easeInOutCubic,
  }
}
