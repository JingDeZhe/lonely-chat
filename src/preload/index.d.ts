interface RENDERER_API {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
  onMaximized: (fn: Function) => void
  onUnmaximized: (fn: Function) => void
}

declare global {
  interface Window {
    api: RENDERER_API
  }
}
