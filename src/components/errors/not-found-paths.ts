export interface NotFoundPathItem {
  href: string
  title: string
  hint?: string
  /** Pick randomly from `surpriseTargetsJson` on click (requires client script). */
  surprise?: boolean
}
