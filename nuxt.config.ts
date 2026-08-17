// https://nuxt.com/docs/api/configuration/nuxt-config

// GitHub Pages serves the project site under /<repo>/, so assets need the prefix in production.
const baseURL = process.env.NODE_ENV === 'production' ? '/nuxt-poke-tcg/' : '/'

export default defineNuxtConfig({

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
  ],
  ssr: false,
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    // Auto-import nested composables for better organization
    dirs: [
      'composables', // Top-level composables
      'composables/*/index.ts', // Barrel exports
      'composables/**', // All nested composables (core/, pokemon/, tcg/, effects/)
    ],
  },

  devtools: { enabled: true },

  app: {
    baseURL,
    head: {
      title: 'Nuxt Poké TCG',
      htmlAttrs: {
        lang: 'pt-BR',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Modern Pokédex with TCG Mode - Explore Pokemon with beautiful holographic card effects',
        },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: `${baseURL}favicon.ico` },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Both APIs are public and CORS-enabled — called straight from the browser, no key.
    public: {
      pokeApiUrl: 'https://pokeapi.co/api/v2',
      pokemonTcgApiUrl: 'https://api.pokemontcg.io/v2',
    },
  },
  compatibilityDate: '2024-11-01',

  vite: {
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'model-viewer',
        },
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disabled in dev to avoid vite-plugin-checker issues, use npm run typecheck
    shim: false,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  image: {
    quality: 80,
    format: ['webp', 'png'],
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config',
    exposeConfig: false,
    viewer: true,
  },
})
