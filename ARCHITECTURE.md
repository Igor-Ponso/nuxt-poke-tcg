# Nuxt Poké TCG - Documentação de Arquitetura

## Visão Geral do Projeto

Uma aplicação moderna de Pokédex com modo TCG, desenvolvida em Nuxt 3, que combina a experiência visual dos jogos modernos de Pokémon (Sword & Shield) com a beleza dos cards físicos do TCG.

## Princípios Fundamentais

### 1. REGRAS DE OURO - SEMPRE CONSULTAR ANTES DE QUALQUER IMPLEMENTAÇÃO

1. **DRY (Don't Repeat Yourself)**
   - Antes de criar qualquer componente, função ou lógica, SEMPRE verificar se já existe algo similar
   - Reutilizar e compor componentes existentes
   - Extrair lógica repetida em composables
   - Nunca duplicar código ou funcionalidade

2. **SOLID Principles**
   - Single Responsibility: Cada componente/função tem uma única responsabilidade
   - Open/Closed: Componentes abertos para extensão, fechados para modificação
   - Liskov Substitution: Subtipos devem ser substituíveis por seus tipos base
   - Interface Segregation: Interfaces específicas melhor que genéricas
   - Dependency Inversion: Depender de abstrações, não de implementações concretas

3. **Verificação de Contexto**
   - SEMPRE ler a estrutura de pastas antes de criar novos arquivos
   - SEMPRE verificar composables existentes antes de criar novos
   - SEMPRE verificar componentes existentes antes de criar novos
   - SEMPRE verificar utilities existentes antes de criar novas

4. **Clean Code**
   - Código elegante, limpo e legível
   - Nomes descritivos e auto-explicativos
   - Funções pequenas e focadas
   - Comentários apenas quando necessário (código deve ser auto-explicativo)

## Stack Tecnológica

### Core
- **Nuxt 3** (versão mais recente)
- **Vue 3** com Composition API
- **TypeScript** (tipagem forte em todo projeto)
- **Tailwind CSS** (configuração customizada para tema Pokémon)

### Gerenciamento de Estado
- **Pinia** (store para estado global)
- **VueUse** (composables utilitários)

### APIs
1. **Pokémon TCG Developer Portal** (API primária)
   - Endpoint: https://api.pokemontcg.io/v2
   - Uso: Cards físicos, artwork, sets, raridades

2. **PokéAPI v3** (API secundária, se necessário)
   - Endpoint: https://pokeapi.co/api/v3
   - Uso: Dados de Pokémon, sprites, stats, moves

### Performance
- **Lazy Loading**: Carregar apenas cards visíveis na tela
- **Virtual Scrolling**: Para listas longas
- **Image Optimization**: Nuxt Image para otimização automática
- **Cache Strategy**: Cache agressivo de dados de API
- **Suspense & Async Components**: Carregamento assíncrono

## Arquitetura de Pastas

```
nuxt-poke-tcg/
├── .nuxt/                      # Build artifacts (git ignored)
├── assets/                     # Assets não-compilados
│   ├── css/
│   │   └── main.css           # Imports do Tailwind + custom CSS
│   └── images/                # Imagens estáticas
├── components/                # Componentes Vue reutilizáveis
│   ├── pokemon/               # Componentes específicos de Pokémon
│   │   ├── PokemonCard.vue
│   │   ├── PokemonCardTCG.vue
│   │   ├── PokemonModal.vue
│   │   ├── PokemonStats.vue
│   │   ├── PokemonMoves.vue
│   │   └── Pokemon3DViewer.vue
│   ├── ui/                    # Componentes UI genéricos
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   ├── Card.vue
│   │   ├── Loading.vue
│   │   └── Skeleton.vue
│   ├── layout/                # Componentes de layout
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── Container.vue
│   └── generation/            # Componentes de seleção
│       └── GenerationSelector.vue
├── composables/               # Composables reutilizáveis
│   ├── usePokemon.ts         # Lógica de Pokémon
│   ├── usePokemonTCG.ts      # Lógica de TCG
│   ├── usePokemonAPI.ts      # Cliente da PokéAPI
│   ├── useGeneration.ts      # Lógica de geração/região
│   ├── useIntersectionObserver.ts  # Lazy loading
│   ├── use3DCard.ts          # Efeitos 3D de hover
│   └── useFoilEffect.ts      # Efeito foil do TCG
├── layouts/                   # Layouts do Nuxt
│   └── default.vue
├── pages/                     # Páginas (rotas)
│   └── index.vue             # Landing page principal
├── plugins/                   # Plugins do Nuxt
│   └── api.ts                # Setup de clientes API
├── public/                    # Arquivos públicos estáticos
│   └── favicon.ico
├── server/                    # Server API (se necessário)
│   └── api/
├── stores/                    # Pinia stores
│   ├── pokemon.ts            # Store de Pokémon
│   ├── generation.ts         # Store de geração
│   └── ui.ts                 # Store de UI (modo TCG, etc)
├── types/                     # TypeScript types
│   ├── pokemon.ts
│   ├── tcg.ts
│   └── api.ts
├── utils/                     # Funções utilitárias
│   ├── colors.ts             # Cores dos types
│   ├── formatters.ts         # Formatação de dados
│   └── constants.ts          # Constantes do projeto
├── ARCHITECTURE.md           # Este arquivo (SEMPRE CONSULTAR)
├── nuxt.config.ts            # Configuração do Nuxt
├── tailwind.config.ts        # Configuração do Tailwind
├── tsconfig.json             # Configuração do TypeScript
└── package.json              # Dependências

```

## Sistema de Cores por Type

### Conceito de Dual-Color System
Cada tipo de Pokémon tem **duas cores**:
- **Color Light** (`--color-{type}`): Cor mais clara para backgrounds e gradientes
- **Color Dark** (`--color-type-{type}`): Cor mais escura para acentos e badges

### Lógica de Gradientes
- **Pokémon de 1 tipo**: Gradient da cor light para a cor dark do mesmo tipo
- **Pokémon de 2 tipos**: Gradient da cor light do tipo 1 para a cor light do tipo 2

**Exemplo:**
```typescript
// Pikachu (Electric apenas)
background: linear-gradient(135deg, var(--color-electric), var(--color-type-electric))
// Resultado: Amarelo claro → Amarelo escuro

// Bulbasaur (Grass/Poison)
background: linear-gradient(135deg, var(--color-grass), var(--color-poison))
// Resultado: Verde → Roxo
```

### Paleta de Cores (baseada no Pokedex-vue)

```typescript
// utils/colors.ts - Sistema Dual-Color
export const TYPE_COLORS = {
  normal: {
    light: '#dcdcdc',  // Background
    dark: '#a0a29f'    // Accent/Badge
  },
  fire: {
    light: '#ffb971',
    dark: '#dc872f'
  },
  water: {
    light: '#8cc4e2',
    dark: '#539ddf'
  },
  electric: {
    light: '#ffe662',
    dark: '#d9b803'
  },
  grass: {
    light: '#78dd81',
    dark: '#59b153'
  },
  ice: {
    light: '#8cf5e4',
    dark: '#75d0c1'
  },
  fighting: {
    light: '#da7589',
    dark: '#d3425f'
  },
  poison: {
    light: '#d881ef',
    dark: '#b763cf'
  },
  ground: {
    light: '#e69a74',
    dark: '#da7c4d'
  },
  flying: {
    light: '#99ccff',
    dark: '#80a0dd'
  },
  psychic: {
    light: '#f57ec3',
    dark: '#db1d8c'
  },
  bug: {
    light: '#bfe760',
    dark: '#92bc2c'
  },
  rock: {
    light: '#c9bb8a',
    dark: '#a38c21'
  },
  ghost: {
    light: '#8291e0',
    dark: '#5f6dbc'
  },
  dragon: {
    light: '#88a2e8',
    dark: '#0c69c8'
  },
  dark: {
    light: '#8e8c94',
    dark: '#595761'
  },
  steel: {
    light: '#9fb8b9',
    dark: '#5695a3'
  },
  fairy: {
    light: '#fdb9e9',
    dark: '#ee90e6'
  }
}

// Helper function para gerar gradient baseado nos types
export const getTypeGradient = (types: PokemonType[]): string => {
  if (types.length === 1) {
    // Single type: light → dark do mesmo tipo
    const type = types[0]
    return `linear-gradient(135deg, var(--color-${type}) 0%, var(--color-type-${type}) 100%)`
  } else {
    // Dual type: light do tipo 1 → light do tipo 2
    const [type1, type2] = types
    return `linear-gradient(135deg, var(--color-${type1}) 0%, var(--color-${type2}) 100%)`
  }
}
```

### CSS Variables (Tailwind Config)
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Pokemon Types - Light
        'poke-normal': '#dcdcdc',
        'poke-fire': '#ffb971',
        'poke-water': '#8cc4e2',
        'poke-electric': '#ffe662',
        'poke-grass': '#78dd81',
        'poke-ice': '#8cf5e4',
        'poke-fighting': '#da7589',
        'poke-poison': '#d881ef',
        'poke-ground': '#e69a74',
        'poke-flying': '#99ccff',
        'poke-psychic': '#f57ec3',
        'poke-bug': '#bfe760',
        'poke-rock': '#c9bb8a',
        'poke-ghost': '#8291e0',
        'poke-dragon': '#88a2e8',
        'poke-dark': '#8e8c94',
        'poke-steel': '#9fb8b9',
        'poke-fairy': '#fdb9e9',

        // Pokemon Types - Dark (accent)
        'poke-normal-dark': '#a0a29f',
        'poke-fire-dark': '#dc872f',
        'poke-water-dark': '#539ddf',
        'poke-electric-dark': '#d9b803',
        'poke-grass-dark': '#59b153',
        'poke-ice-dark': '#75d0c1',
        'poke-fighting-dark': '#d3425f',
        'poke-poison-dark': '#b763cf',
        'poke-ground-dark': '#da7c4d',
        'poke-flying-dark': '#80a0dd',
        'poke-psychic-dark': '#db1d8c',
        'poke-bug-dark': '#92bc2c',
        'poke-rock-dark': '#a38c21',
        'poke-ghost-dark': '#5f6dbc',
        'poke-dragon-dark': '#0c69c8',
        'poke-dark-dark': '#595761',
        'poke-steel-dark': '#5695a3',
        'poke-fairy-dark': '#ee90e6',
      }
    }
  }
}
```

## Funcionalidades Principais

### 1. Pokédex Mode (Padrão)

#### Card de Pokémon
- **Layout**: Grid responsivo de cards
- **Card Components**:
  - Gradient background baseado nos types
  - Nome do Pokémon
  - Número (#001 - #151, etc)
  - Sprite animada
  - Botão Shiny toggle
  - Efeito 3D no hover (mouse move tracking)

#### Efeito 3D
- Usar `use3DCard.ts` composable
- Rastrear posição do mouse
- Aplicar transform: rotateX() e rotateY()
- Efeito de brilho seguindo o mouse
- Transições suaves

#### Modal de Detalhes
- Trigger: Click no card
- Conteúdo:
  - Nome e número
  - Sprite grande (com toggle shiny)
  - Modelo 3D interativo (rotação 360°)
  - Stats completos (HP, Attack, Defense, etc) com barras visuais
  - Top moves (5-8 moves mais fortes)
  - Pokédex entry com scroll
  - Types com badges coloridas
  - Abilities
- Navegação: Anterior/Próximo
- Fechar: ESC key, click fora, botão X

#### Search / Busca
- **Modal de busca** (overlay glassmorphism)
- **Debounce de 500ms** para evitar chamadas excessivas
- Busca por:
  - **Nome**: Case-insensitive, partial matching
  - **Número**: ID exato ou parcial
- Ícone de lupa à esquerda
- Botão clear (X) à direita quando há texto
- ESC fecha o modal
- Auto-focus no input
- Mantém modo TCG durante busca
- Store integration: `setSearchQuery()`, `searchPokemons()`

#### Seletor de Geração
- Layout: 3 linhas x 3 colunas (9 gerações)
- Design: Botões grandes com:
  - Número da geração (roman numeral)
  - Nome da região (Kanto, Johto, etc)
  - Range de IDs (1-151, 152-251, etc)
  - **3 Starters do lado direito** (sprites dos iniciais)
    - Starter do meio escalado 1.15x (featured)
    - Starters laterais em tamanho normal
    - Hover effect em cada starter individualmente
  - Background SVG específico da região (pixelated art)
  - Cor de acento única por geração
- Background em 4 camadas:
  1. **pixel-bg-layer**: SVG pixelado da região
  2. **radial-overlay**: Gradient branco translúcido para profundidade
  3. **noise-layer**: Textura com noise.png
  4. **linear-film**: Film gradient sutil no topo
- Estado ativo visual claro (borda colorida + escala)
- Default: Geração I (Kanto - 151 Pokémon)
- Hover: Box-shadow com cor da geração + transform scale

**Dados das Gerações:**
```typescript
const GENERATIONS = [
  { id: 1, name: 'I', range: [1, 151], region: 'Kanto', color: '#FF6B6B', starters: [1, 4, 7] },
  { id: 2, name: 'II', range: [152, 251], region: 'Johto', color: '#4ECDC4', starters: [152, 155, 158] },
  { id: 3, name: 'III', range: [252, 386], region: 'Hoenn', color: '#45B7D1', starters: [252, 255, 258] },
  { id: 4, name: 'IV', range: [387, 493], region: 'Sinnoh', color: '#96CEB4', starters: [387, 390, 393] },
  { id: 5, name: 'V', range: [494, 649], region: 'Unova', color: '#FFEAA7', starters: [495, 498, 501] },
  { id: 6, name: 'VI', range: [650, 721], region: 'Kalos', color: '#DFE6E9', starters: [650, 653, 656] },
  { id: 7, name: 'VII', range: [722, 809], region: 'Alola', color: '#74B9FF', starters: [722, 725, 728] },
  { id: 8, name: 'VIII', range: [810, 905], region: 'Galar', color: '#A29BFE', starters: [810, 813, 816] },
  { id: 9, name: 'IX', range: [906, 1025], region: 'Paldea', color: '#FD79A8', starters: [906, 909, 912] }
]
```

### 2. TCG Mode

#### Toggle
- **Switch global** para alternar Pokédex Mode ↔ TCG Mode
- Persistir escolha no **localStorage**
- Transição suave entre modos
- Visual claro do modo ativo

#### Card TCG
- Usar **artwork de Full Art** sempre que possível
- **Estratégia de busca por set:**
  - Geração I: Priorizar set **"151"** (Full Arts incríveis)
  - Outras gerações: Buscar versões Full Art disponíveis
  - Fallback: Regular art se Full Art não disponível
- **Sem botão Shiny** (não aplicável a TCG)
- **Botão Expand** para fullscreen
- Exibir imagem do card oficial da Pokémon TCG API
- Manter botão de favorito
- Click abre expand view

#### Expand View (Full Screen)
- **Modal fullscreen** do card TCG
- **Efeito Foil fotorealista** (baseado em pokemon-cards-css-main)
- Simular textura e iluminação de card físico real
- **Mouse tracking** para efeito holográfico dinâmico
- **4 camadas de efeito:**
  1. **Sparkle layer**: Glitter dots com mix-blend-mode: screen
  2. **Effect layer**: Metallic bars (sunpillar) com color-dodge
  3. **Rainbow layer**: Rainbow sweep seguindo mouse com color-dodge
  4. **Glare layer**: Radial spotlight com hard-light
- Efeitos de rainbow/prisma realistas
- **Performance**:
  - `will-change: transform`
  - `contain: layout style paint`
  - Efeitos ativos apenas durante hover/interação
- **Controles:**
  - ESC fecha modal
  - Click fora fecha modal
  - Botão X no canto

#### TCG API Strategy
```typescript
// Preferências de busca por geração
const TCG_SET_PREFERENCES = {
  1: ['base1', 'base2', 'base3', 'base4', 'basep', 'base5', 'gym1', 'gym2', 'neo1', 'neo2', 'neo3', 'neo4', 'base6', 'ecard1', 'ecard2', 'ecard3', 'swsh12pt5'], // Gen 1 - Priorizar "151" (swsh12pt5)
  2: ['neo1', 'neo2', 'neo3', 'neo4'],
  3: ['ex1', 'ex2', 'ex3'],
  // ... etc
}

// Filtros de busca
const searchFilters = {
  subtypes: 'Full Art,Ultra Rare,Special Illustration Rare',
  orderBy: 'set.releaseDate',
}
```

## Padrões de Código

### Componentes Vue

```vue
<script setup lang="ts">
// 1. Imports
import { computed, ref } from 'vue'
import type { Pokemon } from '~/types/pokemon'

// 2. Props & Emits
interface Props {
  pokemon: Pokemon
  shiny?: boolean
}

interface Emits {
  (e: 'click', pokemon: Pokemon): void
}

const props = withDefaults(defineProps<Props>(), {
  shiny: false
})

const emit = defineEmits<Emits>()

// 3. Composables
const { getTypeColors } = usePokemonColors()

// 4. Reactive state
const isHovered = ref(false)

// 5. Computed
const gradientStyle = computed(() => {
  const colors = getTypeColors(props.pokemon.types)
  return `background: linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
})

// 6. Methods
const handleClick = () => {
  emit('click', props.pokemon)
}

// 7. Lifecycle (se necessário)
</script>

<template>
  <!-- Template limpo e semântico -->
</template>

<style scoped>
/* Apenas estilos que não podem ser feitos com Tailwind */
</style>
```

### Composables

```typescript
// composables/usePokemon.ts
import type { Ref } from 'vue'
import type { Pokemon } from '~/types/pokemon'

export const usePokemon = () => {
  const pokemon = ref<Pokemon | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchPokemon = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      // Lógica de fetch
      const data = await $fetch(`/api/pokemon/${id}`)
      pokemon.value = data
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return {
    pokemon: readonly(pokemon),
    loading: readonly(loading),
    error: readonly(error),
    fetchPokemon
  }
}
```

### Stores (Pinia)

```typescript
// stores/pokemon.ts
import { defineStore } from 'pinia'
import type { Pokemon } from '~/types/pokemon'

export const usePokemonStore = defineStore('pokemon', () => {
  // State
  const pokemonList = ref<Pokemon[]>([])
  const selectedGeneration = ref(1)
  const isLoading = ref(false)

  // Getters
  const filteredPokemon = computed(() => {
    // Lógica de filtro
  })

  // Actions
  const fetchPokemonByGeneration = async (gen: number) => {
    isLoading.value = true
    try {
      // Fetch logic
    } finally {
      isLoading.value = false
    }
  }

  return {
    pokemonList,
    selectedGeneration,
    isLoading,
    filteredPokemon,
    fetchPokemonByGeneration
  }
})
```

## Performance e Otimização

### 1. Lazy Loading
- Implementar Intersection Observer via composable
- Carregar cards apenas quando entram no viewport
- Placeholder skeleton enquanto carrega

### 2. Image Optimization
- Usar `<NuxtImg>` para todas as imagens
- Lazy load de sprites e artworks
- Placeholder blur para imagens

### 3. Virtual Scrolling
- Para listas com 151+ items
- Renderizar apenas items visíveis + buffer
- Usar biblioteca como `vue-virtual-scroller`

### 4. Caching
- Cache de respostas de API (30 minutos)
- LocalStorage para dados estáticos
- Service Worker para assets (futuro)

### 5. Code Splitting
- Componentes assíncronos para Modal
- Lazy load do 3D Viewer
- Chunks separados por feature

## Responsividade

### Breakpoints (Tailwind)
```javascript
// tailwind.config.ts
{
  screens: {
    'xs': '475px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

### Grid Layout
- xs: 1 coluna
- sm: 2 colunas
- md: 3 colunas
- lg: 4 colunas
- xl: 5 colunas
- 2xl: 6 colunas

## Design System

### Glassmorphism (Estilo Principal)
Aplicar em modais, overlays e cards:
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px) saturate(150%);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Tipografia
```typescript
// Fontes recomendadas
fonts: {
  primary: 'Inter, system-ui, sans-serif',    // Corpo de texto
  display: 'Montserrat, sans-serif',          // Títulos e headings
  mono: 'JetBrains Mono, monospace',          // Números (Pokédex)
  retro: 'Press Start 2P, monospace',         // Headers temáticos (opcional)
}

// Hierarquia
text-xs    : 0.75rem   // 12px - Labels pequenos
text-sm    : 0.875rem  // 14px - Body small
text-base  : 1rem      // 16px - Body padrão
text-lg    : 1.125rem  // 18px - Body large
text-xl    : 1.25rem   // 20px - H4
text-2xl   : 1.5rem    // 24px - H3
text-3xl   : 1.875rem  // 30px - H2
text-4xl   : 2.25rem   // 36px - H1
```

### Espaçamento
```typescript
// Baseado em 4px (Tailwind padrão)
spacing: {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
}
```

### Shadows
```css
/* Card shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.2)
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)

/* Glow effects (com cor do type) */
--shadow-glow: 0 0 20px var(--type-color)
```

## Animações

### Princípios
- Usar CSS transitions para hover states
- Usar CSS animations para loading states
- Usar Vue transitions para enter/leave
- **Evitar GSAP** (usar apenas se extremamente necessário)
- Preferir `transform` e `opacity` (GPU accelerated)

### Durações Padrão
```css
--duration-fast: 150ms      /* Hover, pequenas interações */
--duration-normal: 300ms    /* Transições padrão */
--duration-slow: 500ms      /* Animações complexas */
```

### Easings
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)    /* Padrão */
--ease-out: cubic-bezier(0.0, 0, 0.2, 1)       /* Entrada */
--ease-in: cubic-bezier(0.4, 0, 1, 1)          /* Saída */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* Bounce */
```

### Animações Comuns
```vue
<!-- Vue Transitions -->
<Transition name="fade">
  <div v-if="show">Content</div>
</Transition>

<Transition name="slide-up">
  <Modal v-if="isOpen" />
</Transition>

<Transition name="scale">
  <Card v-if="loaded" />
</Transition>
```

```css
/* Fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-in-out);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide Up */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Scale */
.scale-enter-active, .scale-leave-active {
  transition: all var(--duration-normal) var(--ease-bounce);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
```

## TypeScript

### Regras
- Tipagem estrita em TODO o código
- Evitar `any` (usar `unknown` se necessário)
- Criar interfaces para todos os dados de API
- Usar enums para valores fixos
- Exportar types de cada módulo

### Exemplo de Types
```typescript
// types/pokemon.ts
export interface Pokemon {
  id: number
  name: string
  types: PokemonType[]
  sprite: string
  shinySprite: string
  stats: PokemonStats
  moves: Move[]
  description: string
}

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}
```

## Testing (Futuro)

- Vitest para unit tests
- Playwright para E2E
- Testing Library para componentes
- Coverage mínimo: 80%

## Workflow de Desenvolvimento

### Antes de Implementar QUALQUER Feature
1. ✅ Ler ARCHITECTURE.md completo
2. ✅ Verificar estrutura de pastas atual
3. ✅ Buscar componentes/composables existentes
4. ✅ Verificar se não há duplicação
5. ✅ Planejar com DRY e SOLID em mente
6. ✅ Implementar
7. ✅ Revisar código
8. ✅ Testar manualmente

### Checklist de Qualidade
- [ ] Código segue DRY?
- [ ] Código segue SOLID?
- [ ] TypeScript sem erros?
- [ ] Componente é reutilizável?
- [ ] Performance está otimizada?
- [ ] É responsivo?
- [ ] Acessibilidade (a11y) considerada?
- [ ] Nomes são descritivos?
- [ ] Código está limpo e legível?

## Referências Externas

### Projeto Pokedex-vue (Referência Implementada)
Analisado completamente. **Padrões aprovados para uso:**

1. **Dual-Color System**: Sistema de cores light/dark por type ✅
2. **Generation Selector**: Layout 3x3 com starters e backgrounds SVG ✅
3. **Glassmorphism**: backdrop-filter blur em modais e overlays ✅
4. **3D Card Effects**: Mouse tracking com rotateX/Y ✅
5. **Composables Pattern**: Lógica reutilizável em composables ✅
6. **Batch API Requests**: Reduz chamadas individuais ✅
7. **localStorage Caching**: Cache de 7 dias para TCG cards ✅
8. **AbortController**: Cancela requests anteriores ✅
9. **Type-Safe Emitters**: Emits tipados com TypeScript ✅
10. **Image Loading Strategy**: Skeleton + fade-in transition ✅

**Não vamos usar:**
- Stylus (usaremos Tailwind CSS puro)
- Vue I18n (desnecessário por enquanto)
- Vue Toastification (podemos criar toast próprio se necessário)

### Projeto pokemon-cards-css-main ⭐ ANALISADO - GÊNIO DO CSS!
**Status**: ✅ Análise completa realizada

**Link de referência**: [CodePen Demo](https://codepen.io/simeydotme/pen/abYWJdX)

Este projeto é uma **OBRA-PRIMA** que simula perfeitamente cartas holográficas físicas usando **APENAS CSS puro** (sem WebGL, sem Canvas).

---

#### 🏗️ Estrutura HTML (3 Camadas Principais)

```html
<div class="card">
  <div class="card__translater">      <!-- Perspective container -->
    <button class="card__rotator">    <!-- 3D rotation -->
      <img class="card__back" />      <!-- Card back -->
      <div class="card__front">       <!-- Card front -->
        <img src="card.png" />        <!-- Base artwork -->
        <div class="card__shine">     <!-- HOLOGRAPHIC LAYER -->
          <!-- :before = Metallic bars -->
          <!-- :after = Focused shine -->
        </div>
        <div class="card__glare">     <!-- LIGHT REFLECTION -->
          <!-- :after = Additional highlight -->
        </div>
      </div>
    </button>
  </div>
</div>
```

**Camadas em ordem Z (frente → trás):**
1. `card__glare` - Reflexo de luz (translateZ: 1.41px)
2. `card__shine:after` - Shine spot (translateZ: 1.2px)
3. `card__shine` - Rainbow gradient (translateZ: 1px)
4. `card__shine:before` - Metallic bars (translateZ: 1px)
5. Card artwork - Base image (translateZ: 0.01px)

---

#### 🎨 Sistema de Efeito Holográfico (O Segredo!)

**3 Camadas do .card__shine:**

```css
/* CAMADA 1: Base Rainbow Gradient */
.card__shine {
  background-image:
    repeating-linear-gradient(110deg,
      violet, blue, green, yellow, red,
      /* Repeat 3x para seamless scroll */
      violet, blue, green, yellow, red,
      violet, blue, green, yellow, red
    );

  /* GRANDE SEGREDO: Gradient GIGANTE (400%) */
  background-size: 400% 400%;

  /* Mouse move = scroll no gradient = luz viajando */
  background-position:
    calc(((50% - var(--background-x)) * 2.6) + 50%)
    calc(((50% - var(--background-y)) * 3.5) + 50%);

  /* COLOR-DODGE = Mágica holográfica! */
  mix-blend-mode: color-dodge;

  filter: brightness(1.1) contrast(1.1) saturate(1.2);
}

/* CAMADA 2: Vertical Metallic Bars */
.card__shine:before {
  content: "";
  background-image: repeating-linear-gradient(90deg,
    /* Barras verticais com cores claras/escuras */
  );
  mix-blend-mode: hard-light;
}

/* CAMADA 3: Focused Shine Spot */
.card__shine:after {
  content: "";
  background-image: radial-gradient(
    farthest-corner circle
      at var(--pointer-x) var(--pointer-y),  /* Segue o mouse! */
    hsla(0, 0%, 90%, 0.8) 0%,   /* Centro brilhante */
    hsla(0, 0%, 0%, 1) 90%      /* Borda escura */
  );
  mix-blend-mode: luminosity;
  filter: brightness(0.6) contrast(4);
}
```

---

#### 🌈 Mix-Blend-Modes (A Chave do Fotorealismo)

| Blend Mode | Onde Usar | Efeito |
|------------|-----------|--------|
| **color-dodge** | `.card__shine` | Brilho holográfico intenso + saturação |
| **hard-light** | `.card__shine:before` | Contraste metálico das barras |
| **luminosity** | `.card__shine:after` | Brilho sem alterar cores |
| **overlay** | `.card__glare` | Reflexo de luz sutil |
| **exclusion** | Full Art cards | Inversão de cores |
| **color-burn** | Cosmos cards | Escurece com saturação intensa |
| **screen** | Glitter layers | Clareia e adiciona glow |

**Por que color-dodge é mágico:**
- Fórmula: `Result = Base / (1 - Blend)`
- Áreas claras ficam MUITO mais brilhantes + saturadas
- Áreas escuras mantêm-se escuras
- Cria o "pop" holográfico perfeito!

---

#### 🎯 CSS Variables Dinâmicas (Ponte JS→CSS)

JavaScript **apenas** atualiza essas variáveis. CSS faz TODO o trabalho pesado!

```javascript
// Atualizado a cada mouse move
style = `
  --pointer-x: 45%;              // Posição X do mouse (0-100%)
  --pointer-y: 67%;              // Posição Y do mouse (0-100%)
  --pointer-from-center: 0.82;   // Distância do centro (0-1)
  --pointer-from-top: 0.67;      // Distância do topo (0-1)
  --pointer-from-left: 0.45;     // Distância da esquerda (0-1)

  --background-x: 52%;           // Parallax X (37-63% range)
  --background-y: 58%;           // Parallax Y (33-67% range)

  --rotate-x: -8deg;             // Rotação Y-axis
  --rotate-y: 12deg;             // Rotação X-axis

  --card-opacity: 1;             // Visibilidade do shine
  --card-scale: 1;               // Zoom level
`
```

**Cálculos importantes:**
```javascript
// Distância do centro (Pitágoras)
distanceFromCenter = Math.sqrt(
  (y - 50)² + (x - 50)²
) / 50  // Normaliza para 0-1

// Rotação baseada no offset do centro
rotateX = -(centerX / 3.5)  // Suave
rotateY = (centerY / 2)      // Mais forte

// Background parallax (range restrito para sutileza)
backgroundX = adjust(pointerX, 0, 100, 37, 63)
```

---

#### 🔄 Transform 3D Perfeito

```css
.card__translater {
  perspective: 600px;           /* Viewing distance */
  transform-style: preserve-3d; /* Enable 3D children */

  transform:
    translate3d(var(--translate-x), var(--translate-y), 0.1px)
    scale(var(--card-scale));
}

.card__rotator {
  transform-style: preserve-3d;

  /* ORDEM IMPORTA! Y then X = natural tilt */
  transform:
    rotateY(var(--rotate-x))
    rotateX(var(--rotate-y));
}

/* Cada layer em profundidade Z diferente */
.card__glare       { transform: translateZ(1.41px); }
.card__shine:after { transform: translateZ(1.2px); }
.card__shine       { transform: translateZ(1px); }
```

---

#### 🌊 Spring Physics (Svelte)

```javascript
import { spring } from "svelte/motion";

const springRotate = spring(
  { x: 0, y: 0 },
  {
    stiffness: 0.066,  // Tensão da mola (menor = mais suave)
    damping: 0.25      // Fricção (maior = menos bounce)
  }
);

// Mouse move instant, mas spring segue suavemente
springRotate.set({ x: 10, y: -5 });

// Leitura reativa do valor animado
$: rotateX = $springRotate.x;  // Updates every frame!
```

**Reset suave ao sair:**
```javascript
// Snap-back ultra-suave
springRotate.stiffness = 0.01;   // Muito lento
springRotate.damping = 0.06;     // Damping gentil
springRotate.set({ x: 0, y: 0 }, { soft: 1 });
```

---

#### 🎨 Tipos de Carta Específicos

**Regular Holo** - Clássico vertical bars
- Rainbow gradient vertical (400% size)
- Scanline texture overlay
- Metallic bars em :before
- Focused shine em :after

**Cosmos Holo** - Galaxy effect
- 3 PNG layers (cosmos-bottom, middle, top)
- Color-burn blend mode
- Multiple parallax speeds
- Dynamic shading radial gradient

**V Full Art** - Metallic texture
- Diagonal bars (repeating-linear-gradient 133deg)
- Illusion.png texture overlay
- Exclusion blend em :after
- Focused overlay spotlight

**Rainbow Rare** - Glitter explosion
- 2x glitter.png layers (offset)
- Muted rainbow (lower saturation)
- Soft-light + color-dodge combo
- Luminosity base blend

**Secret Rare (Gold)** - Conic shimmer
- Conic-gradient (spinning rainbow)
- Double glitter (opposing movement)
- Geometric.png foil pattern
- High saturation + color-dodge

**Radiant Holo** - Crosshatch mesh
- TWO gradients at 45° and -45°
- Creates diamond/mesh pattern
- High contrast bars (10 gradient stops)
- Move together for shimmer

---

#### ⚡ Performance Optimizations

```css
.card {
  /* Force GPU acceleration */
  transform: translate3d(0px, 0px, 0.01px);
  transform-style: preserve-3d;

  /* Hint browser what will change */
  will-change: transform, visibility;
}

.card__shine,
.card__glare {
  will-change: transform, opacity, background-image,
               background-position, filter;
}

/* Anti-aliasing hack */
.card, .card * {
  outline: 1px solid transparent;
}

/* Image quality over speed */
img {
  image-rendering: optimizeQuality;
}
```

**Texturas otimizadas:**
- `grain.webp` - 58KB (WebP compression)
- `glitter.png` - 111KB (transparency needed)
- Repeating patterns > unique gradients

---

#### 💡 Por Que É Genial

1. **Zero WebGL/Canvas** - Pure CSS magic
2. **Blend mode stacking** - Simula interação luz física
3. **Parallax depth** - Diferentes speeds = profundidade 3D
4. **CSS Variables como ponte** - JS só atualiza números
5. **Spring physics** - Movimento natural com inércia
6. **Gradientes gigantes** - Small move = big scroll = luz viajando
7. **HSL color system** - Hue rotation smooth
8. **Filter chains** - Multiplicative enhancement
9. **3 layers from 1 element** - Pseudo-elements = performance
10. **translateZ stacking** - True 3D depth sem z-fighting

---

#### 📋 Checklist de Implementação Nuxt

- [ ] Criar composable `use3DCard.ts` com spring physics
- [ ] Implementar mouse tracking com Vue refs
- [ ] CSS Variables dinâmicas via inline styles
- [ ] Base card structure com translater/rotator
- [ ] Shine layer com 3 camadas (base, :before, :after)
- [ ] Glare layer com radial gradients
- [ ] Mix-blend-modes corretos por card type
- [ ] Transform 3D com rotateY/rotateX
- [ ] Touch events + device orientation (mobile)
- [ ] Texturas: glitter.png, grain.webp
- [ ] Multiple card types (Regular Holo, Cosmos, Full Art, etc)
- [ ] Performance: will-change, translate3d, outline hack

**Próximo passo**: Criar todos os tipos de carta quando iniciarmos TCG Mode!

### UI/UX Inspiration
- **Pokémon Sword & Shield**: Menus limpos, Pokédex moderna
- **Pokémon Scarlet & Violet**: UI contemporânea, cores vibrantes
- **Pokémon GO**: Modelo 3D interativo com rotação
- **Pokémon TCG Physical Cards**: Efeitos foil, texturas, reflexos

## Configuração Inicial

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Nuxt Poké TCG',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Modern Pokédex with TCG Mode' }
      ],
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  runtimeConfig: {
    // Ambas as APIs são públicas e com CORS liberado — chamadas direto do browser,
    // sem chave e sem proxy no servidor (requisito para rodar estático no GitHub Pages).
    public: {
      pokeApiUrl: 'https://pokeapi.co/api/v2',
      pokemonTcgApiUrl: 'https://api.pokemontcg.io/v2'
    }
  }
})
```

## Notas Finais

Este documento é a FONTE DE VERDADE do projeto. SEMPRE consultar antes de:
- Criar novos componentes
- Criar novos composables
- Criar novas utilities
- Implementar novas features
- Fazer refactoring

Manter este documento atualizado com decisões arquiteturais importantes.

---

**Versão**: 2.0
**Última Atualização**: 2025-11-12
**Mantenedor**: Claude Code Agent

## Changelog

### v2.0 (2025-11-12)
- ✅ Corrigido sistema de cores: Dual-color system com lógica correta de gradientes
- ✅ Adicionada análise completa do projeto Pokedex-vue
- ✅ Documentados 10 padrões aprovados para uso
- ✅ Adicionada seção de Search/Busca com debounce
- ✅ Detalhado seletor de geração com 9 gerações, starters e backgrounds
- ✅ Expandida documentação de TCG Mode com estratégia de API
- ✅ Adicionadas 4 camadas de efeito holográfico
- ✅ Criada seção completa de Design System (Glassmorphism, tipografia, espaçamento)
- ✅ Expandida seção de Animações com exemplos Vue Transitions
- ✅ **ANÁLISE PROFUNDA pokemon-cards-css-main**: Sistema holográfico fotorealista completo
  - Estrutura HTML de 3 camadas documentada
  - Sistema de efeito holográfico com .card__shine (3 layers)
  - Mix-blend-modes e por que color-dodge é mágico
  - CSS Variables dinâmicas (ponte JS→CSS)
  - Transform 3D perfeito com perspective
  - Spring physics para movimento natural
  - 6 tipos de carta específicos (Regular Holo, Cosmos, Full Art, Rainbow, Secret, Radiant)
  - Performance optimizations completas
  - Checklist de implementação para Nuxt

### v1.0 (2025-11-12)
- Documentação inicial criada
