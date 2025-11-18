/**
 * Type definitions for vue-virtual-scroller
 */

declare module 'vue-virtual-scroller' {
  import type { Plugin } from 'vue'

  const VueVirtualScroller: Plugin

  export default VueVirtualScroller

  export interface RecycleScrollerProps {
    items: any[]
    itemSize?: number
    minItemSize?: number | string
    direction?: 'vertical' | 'horizontal'
    keyField?: string
    buffer?: number
    pageMode?: boolean
    prerender?: number
    emitUpdate?: boolean
  }

  export interface DynamicScrollerProps {
    items: any[]
    minItemSize: number | string
    direction?: 'vertical' | 'horizontal'
    keyField?: string
    buffer?: number
    pageMode?: boolean
    prerender?: number
    emitUpdate?: boolean
  }
}

declare module 'vue-virtual-scroller/dist/vue-virtual-scroller.css' {
  const content: any
  export default content
}
