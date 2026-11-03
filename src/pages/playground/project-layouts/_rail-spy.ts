// Section rail: mark the section in view and show gallery position.
// Runs on first load and again after each Swup page swap, dropping the previous page's listeners.
let controller: AbortController | undefined

function init() {
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  const spyRoot = document.querySelector('[data-spy-root]')
  if (spyRoot) {
    const links = new Map(
      [...document.querySelectorAll<HTMLAnchorElement>('[data-spy-link]')].map((a) => [a.dataset.spyLink!, a]),
    )
    const sections = [...document.querySelectorAll<HTMLElement>('[data-spy-section]')]
    const galleryCount = document.querySelector<HTMLElement>('[data-gallery-count]')
    const galleryFigures = [...document.querySelectorAll<HTMLElement>('#designs figure')]
    const nav = document.querySelector<HTMLElement>('.nav-transition')
    const aside = spyRoot.querySelector<HTMLElement>('aside')
    const desktop = matchMedia('(min-width: 1024px)')
    // While a rail click is scrolling, keep the clicked item marked instead of every section it passes.
    let pinned: string | undefined

    // Where a section heading should sit: under the fixed nav, and under the tab strip on smaller screens.
    const topOffset = () => {
      const navBottom = nav?.getBoundingClientRect().bottom ?? 80
      const strip = desktop.matches ? 0 : (aside?.offsetHeight ?? 0)
      return navBottom + strip + 32
    }

    const update = () => {
      const line = topOffset() + 48
      let active = sections[0]
      for (const s of sections) if (s.getBoundingClientRect().top <= line) active = s
      // The last section can be too short to reach the line; treat the bottom of the page as reaching it.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = sections.at(-1)!
      links.forEach((a, id) => {
        const on = id === (pinned ?? active?.id)
        a.toggleAttribute('data-active', on)
        const strip = a.closest('ol')
        if (on && strip && strip.scrollWidth > strip.clientWidth) a.scrollIntoView({ inline: 'nearest', block: 'nearest' })
      })
      if (galleryCount && galleryFigures.length) {
        let n = 1
        galleryFigures.forEach((f, i) => {
          if (f.getBoundingClientRect().top <= line) n = i + 1
        })
        galleryCount.textContent = `${n}/${galleryFigures.length}`
      }
    }

    links.forEach((a, id) => {
      a.addEventListener('click', (event) => {
        const section = document.getElementById(id)
        if (!section) return
        event.preventDefault()
        const top = section.getBoundingClientRect().top + window.scrollY - topOffset()
        const maxTop = document.documentElement.scrollHeight - window.innerHeight
        history.replaceState(null, '', `#${id}`)
        // Already there (or pinned at the page bottom): nothing will scroll, so no scrollend to wait for.
        if (Math.abs(Math.min(top, maxTop) - window.scrollY) < 2) return
        pinned = id
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top, behavior: reduceMotion ? 'instant' : 'smooth' })
        update()
        // Unpin when the scroll settles, or after a second in case it never does (interrupted, background tab).
        const release = () => {
          if (pinned !== id) return
          pinned = undefined
          update()
        }
        addEventListener('scrollend', release, { once: true, signal })
        setTimeout(release, 1000)
      })
    })

    addEventListener('scroll', update, { passive: true, signal })
    addEventListener('resize', update, { signal })
    update()
  }
}

init()
document.addEventListener('astro:page-load', init)
