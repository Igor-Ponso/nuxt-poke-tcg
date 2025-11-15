// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  app: {
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
          content: 'Modern Pokédex with TCG Mode - Explore Pokemon with beautiful holographic card effects'
        },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Disabled for now - will enable when we have actual code
    shim: false,
  },

  runtimeConfig: {
    public: {
      pokemonTcgApiKey: process.env.POKEMON_TCG_API_KEY || '',
      pokeApiUrl: 'https://pokeapi.co/api/v2',
      pokemonTcgApiUrl: 'https://api.pokemontcg.io/v2',
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

  eslint: {
    config: {
      stylistic: true,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/_variables.scss" as *;',
        },
      },
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'model-viewer',
        },
      },
    },
  },

  imports: {
    // Only auto-import from composables to prevent utils duplicates
    dirs: ['composables/**'],
    // Explicitly disable utils scanning
    scan: true,
  },

  // Explicitly ignore utils directory from auto-scanning
  ignore: ['utils/**/*.ts', '!utils/index.ts'],
})
