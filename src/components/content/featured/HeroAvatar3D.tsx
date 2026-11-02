import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AvatarController, AvatarReaction } from './HeroAvatarScene'

const HeroAvatarScene = lazy(() => import('./HeroAvatarScene'))

interface Props {
  poster: string
  name?: string
}

const REACTIONS: AvatarReaction[] = ['wave', 'thumbs', 'spin', 'wink', 'bounce']

const BUBBLE: Record<AvatarReaction, string> = {
  wave: 'Hey! 👋',
  thumbs: 'Nice to meet you',
  spin: 'Wheee',
  wink: '😉',
  bounce: 'Want to chat with me?',
}

/** The last reaction's bubble stays up with a link to the avatar chat. */
const CHAT_REACTION: AvatarReaction = 'bounce'
const CHAT_HREF = '/playground/avatar'
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

export default function HeroAvatar3D({ poster, name }: Props) {
  const [canRender3D, setCanRender3D] = useState(false)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [bubble, setBubble] = useState<AvatarReaction | null>(null)
  const clicks = useRef(0)
  const hideTimer = useRef<number>()
  const controller = useRef<AvatarController>({})
  const pointer = useRef({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
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
    if (reaction !== CHAT_REACTION) hideTimer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS)
  }, [])

  const onReady = useCallback(() => setReady(true), [])

  const onClick = () => {
    const reaction = REACTIONS[clicks.current % REACTIONS.length]
    clicks.current += 1
    if (ready && !reducedMotion && controller.current.play) controller.current.play(reaction)
    else showBubble(reaction)
  }

  return (
    <div className="relative size-24 shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label={name ? `Say hi to ${name}'s avatar` : 'Say hi to the avatar'}
        className="relative block size-24 cursor-pointer overflow-hidden rounded-full bg-zinc-100 outline-none transition-transform duration-200 hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-zinc-800 dark:focus-visible:ring-white">
        <img
          src={poster}
          alt=""
          width={96}
          height={96}
          decoding="async"
          loading="eager"
          className={`size-24 object-cover transition-opacity duration-300 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />
        {canRender3D && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroAvatarScene
                controller={controller}
                pointer={pointer}
                reducedMotion={reducedMotion}
                onReady={onReady}
                onReactionStart={showBubble}
              />
            </Suspense>
          </SceneBoundary>
        )}
      </button>
      <div
        aria-live="polite"
        className={`absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 whitespace-nowrap rounded-2xl rounded-bl-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 shadow-sm transition-all duration-200 dark:bg-zinc-100 dark:text-zinc-900 ${
          bubble ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
        }`}>
        {bubble && BUBBLE[bubble]}
        {bubble === CHAT_REACTION && (
          <a href={CHAT_HREF} className="ml-2 underline underline-offset-2" data-swup-preload>
            Chat →
          </a>
        )}
      </div>
    </div>
  )
}
