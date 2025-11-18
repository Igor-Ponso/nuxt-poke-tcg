/**
 * Vue Virtual Scroller Plugin
 *
 * Registers the vue-virtual-scroller component library
 * Used for efficient rendering of large lists (Pokedex with 1000+ Pokemon)
 */

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueVirtualScroller)
})
