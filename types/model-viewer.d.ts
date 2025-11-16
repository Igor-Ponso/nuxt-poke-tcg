/**
 * Type declarations for Google Model Viewer custom element
 */

declare module '@google/model-viewer' {
  const ModelViewer: unknown
  export default ModelViewer
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': Record<string, unknown>
    }
  }
}

export {}
