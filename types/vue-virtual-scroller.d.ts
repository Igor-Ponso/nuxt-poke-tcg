/**
 * Type definitions for vue-virtual-scroller
 *
 * Only the shims the plugin needs — the library's prop interfaces were declared
 * here but never imported anywhere, so they are gone.
 */

declare module 'vue-virtual-scroller' {
  import type { Plugin } from 'vue'

  const VueVirtualScroller: Plugin

  export default VueVirtualScroller
}

declare module 'vue-virtual-scroller/dist/vue-virtual-scroller.css' {
  const content: string
  export default content
}
