/**
 * Writing (/journal) filters — plain DOM + astro:page-load so Swup navigations work
 * (React islands are unreliable after main swap).
 */
function applyJournalFilter(root: HTMLElement, filter: string) {
  const lower = filter === 'all' ? '' : filter.toLowerCase()

  root.querySelectorAll<HTMLButtonElement>('[data-journal-filter]').forEach((btn) => {
    const f = btn.getAttribute('data-journal-filter') || 'all'
    const active = f === filter
    btn.setAttribute('aria-pressed', String(active))
    btn.classList.toggle('jf-active', active)
    btn.classList.toggle('jf-inactive', !active)
  })

  root.querySelectorAll<HTMLElement>('[data-post-item]').forEach((el) => {
    if (!lower) {
      el.hidden = false
      return
    }
    const cat = (el.dataset.category || '').toLowerCase()
    const tagList = (el.dataset.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const match = cat === lower || tagList.includes(lower)
    el.hidden = !match
  })

  let anyYearVisible = false
  root.querySelectorAll<HTMLElement>('[data-year-section]').forEach((sec) => {
    const visible = [...sec.querySelectorAll<HTMLElement>('[data-post-item]')].some((row) => !row.hidden)
    sec.hidden = !visible
    if (visible) anyYearVisible = true
  })

  const empty = root.querySelector<HTMLElement>('[data-journal-filter-empty]')
  const results = root.querySelector<HTMLElement>('[data-journal-filter-results]')
  if (empty && results) {
    const showEmpty = filter !== 'all' && !anyYearVisible
    empty.hidden = !showEmpty
    results.hidden = showEmpty
  }
}

function onJournalFilterClick(e: Event) {
  const target = e.target
  if (!(target instanceof Element)) return
  const btn = target.closest<HTMLButtonElement>('[data-journal-filter]')
  if (!btn) return
  const root = btn.closest<HTMLElement>('#journal-filters-root')
  if (!root) return
  const filter = btn.getAttribute('data-journal-filter') || 'all'
  applyJournalFilter(root, filter)
}

let delegated = false

export function attachJournalFilters(): void {
  if (!delegated) {
    delegated = true
    document.addEventListener('click', onJournalFilterClick)
  }
  const root = document.getElementById('journal-filters-root')
  if (root) applyJournalFilter(root, 'all')
}
