import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AvatarController, AvatarMode } from '../featured/HeroAvatarScene'
import { loadCycle, POSTERS, type AvatarReaction, type Persona } from '../featured/avatarCycle'

const HeroAvatarScene = lazy(() => import('../featured/HeroAvatarScene'))

const WORK_POSTER = '/images/dan-avatar.webp'
/**
 * The avatar always renders at this size and is scaled down with a CSS transform. Animating
 * its real size would resize the WebGL canvas every frame, which clears it and flickers.
 */
const RENDER_SIZE = 160
/** Friendly reactions for a click in the chat (the homepage keeps its own outfit cycle). */
const CLICK_REACTIONS: AvatarReaction[] = ['wave', 'wink', 'nod']

interface Props {
  /** Diameter in px; changes animate. */
  size: number
  /** What he's doing in the conversation; he nods when he finishes talking. */
  mode: AvatarMode
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Keeps the still image if three.js or the model fails to load. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Daniel's 3D avatar for the chat playground, reacting to the conversation. */
export default function ChatAvatar({ size, mode }: Props) {
  const [canRender3D, setCanRender3D] = useState(false)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [persona, setPersona] = useState<Persona>('work')
  const controller = useRef<AvatarController>({})
  const pointer = useRef({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setPersona(loadCycle().persona)
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
    }
  }, [])

  // Apply the mode now, and again once the scene is ready (it may load after the chat starts).
  const previous = useRef(mode)
  useEffect(() => {
    if (!ready) return
    controller.current.setMode?.(mode)
    if (previous.current === 'talking' && mode !== 'talking') controller.current.play?.('nod')
    previous.current = mode
  }, [ready, mode])

  const onReady = useCallback(() => setReady(true), [])
  const onReactionStart = useCallback(() => {}, [])

  const onClick = () => {
    const reaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)]
    controller.current.play?.(reaction)
  }

  const poster = persona === 'work' ? WORK_POSTER : POSTERS[persona]

  return (
    <div className="chat-avatar-frame" style={{ width: size, height: size }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        aria-label="Daniel's avatar. Say hi"
        data-slot="chat-avatar"
        data-mode={mode}
        className="chat-avatar"
        style={{ width: RENDER_SIZE, height: RENDER_SIZE, transform: `scale(${size / RENDER_SIZE})` }}>
        <img
          src={poster}
          alt=""
          width={RENDER_SIZE}
          height={RENDER_SIZE}
          decoding="async"
          className="chat-avatar-poster"
          style={{ opacity: ready ? 0 : 1 }}
        />
        {canRender3D && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroAvatarScene
                controller={controller}
                pointer={pointer}
                reducedMotion={reducedMotion}
                initialPersona={persona}
                onReady={onReady}
                onReactionStart={onReactionStart}
              />
            </Suspense>
          </SceneBoundary>
        )}
      </button>
    </div>
  )
}
