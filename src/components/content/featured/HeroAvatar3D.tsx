import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AvatarController } from './HeroAvatarScene'
import { loadCycle, markPersona, OUTFIT_CHANGES, POSTERS, REACTIONS, saveCycle, type AvatarReaction, type Persona } from './avatarCycle'

const HeroAvatarScene = lazy(() => import('./HeroAvatarScene'))

interface Props {
  poster: string
  name?: string
}

const BUBBLE: Record<AvatarReaction, string> = {
  wave: 'Hey! 👋',
  closer: 'Let me take a closer look… 🔍',
  think: 'Hmm, let me think… 🤔',
  gym: 'Gym time! 💪',
  wink: '😉',
  nod: 'Yep, I design things ✏️',
  beat: 'Drop the beat 🎧',
  psst: 'Psst… see my work',
  chat: 'Want to chat with me?',
}

/** These bubbles stay up with a link until the next click. */
const LINKS: Partial<Record<AvatarReaction, { href: string; label: string }>> = {
  psst: { href: '/projects', label: 'Projects →' },
  chat: { href: '/playground/avatar', label: 'Chat →' },
}
const BUBBLE_MS = 2500

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Keeps the poster image if three.js or the model fails to load. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The scene stays loaded between visits to the homepage within one page session (site navigation
 * swaps the page without reloading scripts), so coming back can skip the poster fade.
 */
let sceneShownBefore = false

export default function HeroAvatar3D({ poster, name }: Props) {
  const [canRender3D, setCanRender3D] = useState(false)
  const [ready, setReady] = useState(false)
  const [fade, setFade] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [bubble, setBubble] = useState<AvatarReaction | null>(null)
  // Click count and outfit, restored from earlier in the session.
  const clicks = useRef(0)
  const persona = useRef<Persona>('work')
  const hideTimer = useRef<number | undefined>(undefined)
  const controller = useRef<AvatarController>({})
  const pointer = useRef({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const saved = loadCycle()
    clicks.current = saved.clicks
    persona.current = saved.persona
    markPersona(saved.persona)
    setFade(!sceneShownBefore)
    setCanRender3D(hasWebGL())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    media.addEventListener('change', onMotionChange)

    const onPointerMove = (event: PointerEvent) => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const clamp = (value: number) => Math.max(-1, Math.min(1, value))
      pointer.current.x = clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2))
      pointer.current.y = clamp((event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2))
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      media.removeEventListener('change', onMotionChange)
      window.removeEventListener('pointermove', onPointerMove)
      window.clearTimeout(hideTimer.current)
    }
  }, [])

  const showBubble = useCallback((reaction: AvatarReaction) => {
    window.clearTimeout(hideTimer.current)
    setBubble(reaction)
    if (!LINKS[reaction]) hideTimer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS)
  }, [])

  // Clicks made while the 3D is still loading play once it's ready.
  const pending = useRef<AvatarReaction[]>([])
  const onReady = useCallback(() => {
    sceneShownBefore = true
    setReady(true)
    pending.current.splice(0).forEach((reaction) => controller.current.play?.(reaction))
  }, [])

  const onClick = () => {
    const reaction = REACTIONS[clicks.current % REACTIONS.length]
    clicks.current += 1
    persona.current = OUTFIT_CHANGES[reaction] ?? persona.current
    saveCycle({ clicks: clicks.current, persona: persona.current })
    markPersona(persona.current)
    if (reducedMotion || !canRender3D) showBubble(reaction)
    else if (ready && controller.current.play) controller.current.play(reaction)
    else {
      pending.current.push(reaction)
      showBubble(reaction)
    }
  }

  return (
    <div className="relative size-24 shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label={name ? `Say hi to ${name}'s avatar` : 'Say hi to the avatar'}
        className="relative block size-24 cursor-pointer overflow-hidden rounded-full bg-zinc-100 outline-hidden transition-transform duration-200 hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-zinc-800 dark:focus-visible:ring-white">
        {/* One still per outfit; CSS shows the one marked on <html> (see markPersona). */}
        {(
          [
            [poster, '[html[data-avatar-persona=fitness]_&]:hidden [html[data-avatar-persona=music]_&]:hidden'],
            [POSTERS.fitness, 'hidden [html[data-avatar-persona=fitness]_&]:block'],
            [POSTERS.music, 'hidden [html[data-avatar-persona=music]_&]:block'],
          ] as const
        ).map(([src, visibility]) => (
          <img
            key={src}
            src={src}
            alt=""
            width={96}
            height={96}
            decoding="async"
            loading="eager"
            className={`size-24 object-cover ${visibility} ${fade ? 'transition-opacity duration-300' : ''} ${ready ? 'opacity-0' : 'opacity-100'}`}
          />
        ))}
        {canRender3D && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroAvatarScene
                controller={controller}
                pointer={pointer}
                reducedMotion={reducedMotion}
                initialPersona={persona.current}
                onReady={onReady}
                onReactionStart={showBubble}
              />
            </Suspense>
          </SceneBoundary>
        )}
      </button>
      <div
        aria-live="polite"
        className={`absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 whitespace-nowrap rounded-2xl rounded-bl-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 shadow-xs transition-all duration-200 dark:bg-zinc-100 dark:text-zinc-900 ${
          bubble ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
        }`}>
        {bubble && BUBBLE[bubble]}
        {bubble && LINKS[bubble] && (
          <a href={LINKS[bubble].href} className="ml-2 underline underline-offset-2" data-swup-preload>
            {LINKS[bubble].label}
          </a>
        )}
      </div>
    </div>
  )
}
