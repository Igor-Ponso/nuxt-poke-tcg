<script setup lang="ts">
/**
 * TCG Card Component - With Simon Goellner Holographic Effect
 *
 * Complete implementation of photorealistic holographic foil effect
 * Based on https://poke-holo.simey.me/ and pokemon-cards-css-main
 *
 * Features:
 * - 4-layer structure: card → translater → rotator → front
 * - Shine and glare layers with pseudo-elements
 * - mix-blend-mode: color-dodge for realistic foil
 * - Giant gradients (400%) for parallax effect
 * - Spring physics animation
 * - Multiple card types
 */

import type { SimplifiedTCGCard } from '~/types'
import type { CardType } from '~/composables/effects/useHolographicCard'

export interface TCGCardProps {
  card: SimplifiedTCGCard
  cardType?: CardType
  holographicEnabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<TCGCardProps>(), {
  cardType: 'regular-holo',
  holographicEnabled: true,
  size: 'md',
})

const emit = defineEmits<{
  click: [card: SimplifiedTCGCard]
}>()

const cardRef = ref<HTMLElement | null>(null)

// Use holographic card composable
const { cssVariables, isInteractive } = useHolographicCard(cardRef, {
  cardType: props.cardType,
  enabled: props.holographicEnabled,
  intensity: 1,
})

const cardSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-40 h-56'
    case 'lg':
      return 'w-72 h-[28rem]'
    case 'md':
    default:
      return 'w-56 h-80'
  }
})

function handleClick() {
  emit('click', props.card)
}
</script>

<template>
  <div
    ref="cardRef"
    class="tcg-card"
    :class="[
      cardSizeClasses,
      holographicEnabled ? 'interactive' : '',
      isInteractive ? 'active' : '',
      cardType,
    ]"
    :style="cssVariables"
    @click="handleClick"
  >
    <!-- Translater: Perspective container -->
    <div class="tcg-card__translater">
      <!-- Rotator: 3D rotation container -->
      <div class="tcg-card__rotator">
        <!-- Back of card (optional) -->
        <div class="tcg-card__back">
          <div class="pokemon-back-pattern" />
        </div>

        <!-- Front of card -->
        <div class="tcg-card__front">
          <!-- Base card image -->
          <img
            :src="card.imageUrl"
            :alt="card.name"
            class="tcg-card__image"
            loading="lazy"
            decoding="async"
          >

          <!-- Holographic shine layer (3 layers: base, :before, :after) -->
          <div v-if="holographicEnabled" class="tcg-card__shine" />

          <!-- Glare/reflection layer -->
          <div v-if="holographicEnabled" class="tcg-card__glare" />
        </div>
      </div>
    </div>

    <!-- Card info overlay (shown on hover) -->
    <Transition name="fade">
      <div v-if="isInteractive" class="tcg-card__info">
        <p class="font-bold text-white text-sm truncate">
          {{ card.name }}
        </p>
        <p v-if="card.rarity" class="text-xs text-white/80">
          {{ card.rarity }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ============================================================================
   BASE CARD STRUCTURE
   ============================================================================ */

.tcg-card {
  /* Force GPU acceleration */
  transform: translate3d(0, 0, 0.01px);
  transform-style: preserve-3d;
  will-change: transform;

  position: relative;
  cursor: pointer;
  border-radius: 0.75rem;

  /* Smooth transitions */
  transition: transform 0.3s ease;
}

.tcg-card.interactive {
  transform: scale(var(--card-scale, 1)) translate3d(0, 0, 0.01px);
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}

/* ============================================================================
   TRANSLATER - Perspective Container
   ============================================================================ */

.tcg-card__translater {
  width: 100%;
  height: 100%;
  position: relative;

  /* Perspective for 3D effect */
  perspective: 600px;
  transform-style: preserve-3d;

  border-radius: inherit;
}

/* ============================================================================
   ROTATOR - 3D Rotation Container
   ============================================================================ */

.tcg-card__rotator {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;

  /* 3D rotation - ORDER MATTERS! Y then X = natural tilt */
  transform: rotateY(var(--rotate-x, 0deg)) rotateX(var(--rotate-y, 0deg));
  transition: transform 0.1s ease-out;

  border-radius: inherit;
}

/* ============================================================================
   CARD BACK (Optional)
   ============================================================================ */

.tcg-card__back {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  backface-visibility: hidden;
  transform: rotateY(180deg) translateZ(0.01px);

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pokemon-back-pattern {
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
}

/* ============================================================================
   CARD FRONT
   ============================================================================ */

.tcg-card__front {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  backface-visibility: hidden;

  border-radius: inherit;
  overflow: hidden;

  /* Subtle shadow */
  box-shadow:
    0 10px 30px -5px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.tcg-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;

  /* Image on base layer */
  position: relative;
  transform: translateZ(0.01px);

  /* High quality rendering */
  image-rendering: optimizeQuality;

  /* Prevent user selection */
  user-select: none;
  pointer-events: none;
}

/* ============================================================================
   SHINE LAYER - The HEART of the holographic effect
   ============================================================================ */

.tcg-card__shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;

  /* Z-depth layering */
  transform: translateZ(1px);

  /* Opacity controlled by JS */
  opacity: var(--card-opacity, 0);
  transition: opacity 0.3s ease;

  /* Anti-aliasing hack */
  outline: 1px solid transparent;
}

/* LAYER 1: Rainbow Gradient Base */
.tcg-card.regular-holo .tcg-card__shine {
  /* Giant repeating rainbow gradient (400% for parallax scrolling) */
  background-image: repeating-linear-gradient(
    110deg,
    #a068fa 0%,
    #4299e1 10%,
    #48bb78 20%,
    #ecc94b 30%,
    #f56565 40%,
    #a068fa 50%,
    #4299e1 60%,
    #48bb78 70%,
    #ecc94b 80%,
    #f56565 90%,
    #a068fa 100%
  );

  /* GIANT size for parallax effect */
  background-size: 400% 400%;

  /* Position follows mouse (CSS variables from JS) */
  background-position: var(--background-x, 50%) var(--background-y, 50%);

  /* COLOR-DODGE = The magic blend mode! */
  mix-blend-mode: color-dodge;

  /* Enhance the effect */
  filter: brightness(1.1) contrast(1.1) saturate(1.2);
}

/* LAYER 2: Vertical Metallic Bars (via :before) */
.tcg-card.regular-holo .tcg-card__shine::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;

  /* Repeating vertical bars */
  background-image: repeating-linear-gradient(
    90deg,
    hsla(0, 0%, 100%, 0) 0%,
    hsla(0, 0%, 100%, 0.03) 3%,
    hsla(0, 0%, 100%, 0.08) 6%,
    hsla(0, 0%, 100%, 0.1) 9%,
    hsla(0, 0%, 100%, 0.08) 12%,
    hsla(0, 0%, 100%, 0.03) 15%,
    hsla(0, 0%, 100%, 0) 18%,
    hsla(0, 0%, 100%, 0) 24%,
    hsla(0, 0%, 100%, 0.03) 27%,
    hsla(0, 0%, 100%, 0.08) 30%,
    hsla(0, 0%, 100%, 0.1) 33%,
    hsla(0, 0%, 100%, 0.08) 36%,
    hsla(0, 0%, 100%, 0.03) 39%,
    hsla(0, 0%, 100%, 0) 42%
  );

  background-size: 100% 100%;
  background-position: center;

  /* Hard-light for metallic contrast */
  mix-blend-mode: hard-light;

  transform: translateZ(1px);
}

/* LAYER 3: Focused Shine Spot (via :after) */
.tcg-card.regular-holo .tcg-card__shine::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;

  /* Radial gradient following pointer */
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
    hsla(0, 0%, 90%, 0.8) 0%,
    hsla(0, 0%, 80%, 0.4) 30%,
    hsla(0, 0%, 0%, 0.6) 70%,
    hsla(0, 0%, 0%, 1) 90%
  );

  /* Luminosity preserves colors while adding brightness */
  mix-blend-mode: luminosity;

  /* High contrast for focused effect */
  filter: brightness(0.6) contrast(4);

  transform: translateZ(1.2px);
}

/* ============================================================================
   GLARE LAYER - Light Reflection
   ============================================================================ */

.tcg-card__glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;

  /* Higher Z-depth than shine */
  transform: translateZ(1.41px);

  /* Radial highlight */
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 20%,
    transparent 60%
  );

  /* Overlay for subtle reflection */
  mix-blend-mode: overlay;

  opacity: var(--card-opacity, 0);
  transition: opacity 0.3s ease;
}

/* Additional glare highlight */
.tcg-card__glare::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;

  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
    rgba(255, 255, 255, 0.5) 0%,
    transparent 40%
  );

  mix-blend-mode: soft-light;
  transform: translateZ(0.5px);
}

/* ============================================================================
   CARD INFO OVERLAY
   ============================================================================ */

.tcg-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  border-radius: 0 0 0.75rem 0.75rem;
  z-index: 10;
  transform: translateZ(2px);
}

/* ============================================================================
   COSMOS CARD TYPE - Galaxy Effect
   ============================================================================ */

.tcg-card.cosmos .tcg-card__shine {
  /* Multiple radial gradients for galaxy effect */
  background-image:
    radial-gradient(
      farthest-corner circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
      rgba(0, 0, 0, 0.1) 12%,
      rgba(0, 0, 0, 0.15) 20%,
      rgba(0, 0, 0, 0.25) 120%
    ),
    radial-gradient(
      farthest-corner circle at 40% 50%,
      hsla(200, 100%, 50%, 1),
      hsla(200, 100%, 50%, 0) 50%
    ),
    radial-gradient(
      farthest-corner circle at 60% 50%,
      hsla(300, 100%, 50%, 1),
      hsla(300, 100%, 50%, 0) 50%
    );

  mix-blend-mode: color-burn;
  filter: brightness(1.2) contrast(1.3);
}

/* ============================================================================
   FULL ART CARD TYPE - Diagonal Bars
   ============================================================================ */

.tcg-card.full-art .tcg-card__shine {
  background-image: repeating-linear-gradient(
    133deg,
    rgba(255, 119, 115, 0.8) 0%,
    rgba(255, 237, 95, 0.8) 10%,
    rgba(168, 255, 95, 0.8) 20%,
    rgba(131, 255, 247, 0.8) 30%,
    rgba(120, 148, 255, 0.8) 40%,
    rgba(216, 117, 255, 0.8) 50%
  );

  background-size: 300% 300%;
  background-position: var(--background-x, 50%) var(--background-y, 50%);
  mix-blend-mode: exclusion;
}

/* ============================================================================
   TRANSITIONS
   ============================================================================ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
