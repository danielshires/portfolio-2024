/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'scrollreveal' {
  const ScrollReveal: () => {
    reveal: (
      element: HTMLElement | null,
      options?: {
        duration?: number
        delay?: number
        distance?: string
        easing?: string
        origin?: string
      }
    ) => void
  }
  export default ScrollReveal
}
