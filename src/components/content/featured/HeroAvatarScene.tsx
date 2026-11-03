import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Box3, Group, Mesh, Vector3, type Object3D } from 'three'
import { attachFeatures, FACE_LAYOUT, neutralExpression, type AvatarFeatures, type Expression } from './avatarFeatures'
import { attachHands, handsFor, type AvatarHands } from './avatarHands'
import { attachProps, attachShirtTint, PERSONAS, type AvatarProps } from './avatarProps'
import { OUTFIT_CHANGES, type AvatarReaction, type Persona } from './avatarCycle'

/**
 * The model comes from scripts/avatar/prepare.mjs: a blank-faced bust with a `Head` node
 * (pivot at the neck) and a `Body` node. The face is built in avatarFeatures.ts and each
 * version's props (work, fitness, music) in avatarProps.ts, and the gesturing hands in avatarHands.ts.
 */
export const AVATAR_MODEL_URL = '/models/dan-avatar.glb'

/** Head height in world units after fitting (the camera frames about 2.5), and how far
 * below the head's centre to aim so the shoulders show. */
const HEAD_HEIGHT = 1.6
const FRAME_DROP = 0.18

/** Filled in by the scene so the button outside the canvas can queue reactions. */
/** What he's doing in a conversation, between reactions (the chat playground drives this). */
export type AvatarMode = 'idle' | 'listening' | 'thinking' | 'talking' | 'worried'

export interface AvatarController {
  play?: (reaction: AvatarReaction) => void
  /** Switch conversation mode; `talking` ends after `seconds`, with a small nod. */
  setMode?: (mode: AvatarMode, seconds?: number) => void
}

interface Props {
  controller: MutableRefObject<AvatarController>
  /** Pointer position over the window, -1..1 on each axis. */
  pointer: MutableRefObject<{ x: number; y: number }>
  reducedMotion: boolean
  /** Outfit to start in (where the visitor left off). */
  initialPersona: Persona
  onReady: () => void
  onReactionStart: (reaction: AvatarReaction) => void
}

const DURATION: Record<AvatarReaction, number> = {
  wave: 1.4,
  closer: 1.8,
  think: 1.8,
  gym: 2,
  wink: 1,
  nod: 1.1,
  beat: 2,
  psst: 1.9,
  chat: 2.4,
}

/** Share of an outfit change's time spent spinning; the rest is the new version's move. */
const SPIN_SHARE = 0.4

/** Expression the simpler reactions blend toward (and back from) while they play. */
const EXPRESSION: Partial<Record<AvatarReaction, Partial<Expression>>> = {
  wave: { smile: 1, open: 0.45, brows: [1, 1], gaze: [0.6, 0.2] },
  wink: { smile: 1, open: 0.2, brows: [1, -0.5], browTilt: [0, -0.8], lids: [0, 1] },
  chat: { smile: 0.6, brows: [0.7, 0.7] },
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)
/** Eases in, holds the pose, eases out over 0..1. */
const holdOf = (p: number) => Math.min(1, Math.sin(Math.PI * clamp01(p)) * 2.5)

/** Rest transform of an animated part; every frame starts from here. */
interface Part {
  node: Object3D
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

function capture(node: Object3D | undefined): Part | undefined {
  if (!node) return undefined
  return {
    node,
    position: node.position.toArray() as [number, number, number],
    rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
    scale: node.scale.toArray() as [number, number, number],
  }
}

function reset(part: Part | undefined) {
  if (!part) return
  part.node.position.fromArray(part.position)
  part.node.rotation.set(...part.rotation)
  part.node.scale.fromArray(part.scale)
}

function Avatar({ controller, pointer, reducedMotion, initialPersona, onReady, onReactionStart }: Props) {
  const { scene } = useLoader(GLTFLoader, AVATAR_MODEL_URL)

  const { pivot, features, props, hands, setShirt } = useMemo(() => {
    // The loaded scene is cached and React may run this more than once, so measure it
    // detached and untransformed; otherwise offsets and scale compound.
    scene.removeFromParent()
    scene.position.set(0, 0, 0)
    ;(scene.userData.features as AvatarFeatures | undefined)?.dispose()
    ;(scene.userData.props as AvatarProps | undefined)?.dispose()
    ;(scene.userData.hands as AvatarHands | undefined)?.dispose()
    scene.updateMatrixWorld(true)
    // Frame on the head (the bust below it is cropped by the circle); fall back to the whole model.
    const head = scene.getObjectByName('Head')
    const box = new Box3().setFromObject(head ?? scene)
    const size = box.getSize(new Vector3())
    const centre = box.getCenter(new Vector3())
    centre.y -= size.y * FRAME_DROP

    const builtFeatures = head instanceof Mesh ? attachFeatures(head) : undefined
    const builtProps = head instanceof Mesh ? attachProps(head) : undefined
    const builtHands = head instanceof Mesh ? attachHands(head, FACE_LAYOUT.colours.skin) : undefined
    scene.userData.features = builtFeatures
    scene.userData.props = builtProps
    scene.userData.hands = builtHands
    const body = scene.getObjectByName('Body')
    const shirt = body instanceof Mesh ? attachShirtTint(body) : undefined

    const fit = new Group()
    fit.add(scene)
    scene.position.sub(centre)
    fit.scale.setScalar(HEAD_HEIGHT / Math.max(size.x, size.y))
    // Separate group so spins and hops turn about the model's centre.
    const group = new Group()
    group.add(fit)
    return { pivot: group, features: builtFeatures, props: builtProps, hands: builtHands, setShirt: shirt }
  }, [scene])

  const parts = useMemo(() => ({ root: capture(pivot), head: capture(scene.getObjectByName('Head')) }), [scene, pivot])

  const queue = useRef<AvatarReaction[]>([])
  const current = useRef<{ reaction: AvatarReaction; start: number; spins: boolean; changed: boolean } | null>(null)
  const persona = useRef<Persona>('work')
  const look = useRef({ x: 0, y: 0 })
  const face = useRef(neutralExpression())
  const blink = useRef({ next: 2, start: -1 })
  const dart = useRef({ next: 1, x: 0, y: 0 })
  const mode = useRef<{ mode: AvatarMode; since: number; until?: number }>({ mode: 'idle', since: 0 })
  const now = useRef(0)

  const wear = (next: Persona) => {
    persona.current = next
    props?.setPersona(next)
    setShirt?.(PERSONAS[next].shirt)
  }

  useEffect(() => {
    wear(initialPersona)
    controller.current.play = (reaction) => {
      queue.current.push(reaction)
    }
    controller.current.setMode = (next, seconds) => {
      const at = now.current
      mode.current = { mode: next, since: at, until: seconds === undefined ? undefined : at + seconds }
    }
    onReady()
    return () => {
      controller.current.play = undefined
      controller.current.setMode = undefined
      Object.values(parts).forEach(reset)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, onReady, parts])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const { root, head } = parts
    Object.values(parts).forEach(reset)
    if (reducedMotion) {
      features?.update(neutralExpression())
      hands?.update({}, delta)
      return
    }
    const body = head ?? root
    const who = persona.current

    // Idle: breathe and turn toward the pointer, at the same speed at any frame rate.
    if (root) root.node.position.y += who === 'fitness' ? Math.sin(t * 3.2) * 0.025 : Math.sin(t * 1.6) * 0.02
    const follow = 1 - Math.exp(-delta * 5)
    look.current.x += (pointer.current.x - look.current.x) * follow
    look.current.y += (pointer.current.y - look.current.y) * follow
    if (body) {
      body.node.rotation.y += look.current.x * 0.35
      // +x tips the face down: follow a pointer below him with a small nod, never a lean back.
      body.node.rotation.x += look.current.y * 0.12
      // Music Dan sways gently to a ~110 bpm beat.
      if (who === 'music') {
        const beat = (t * Math.PI * 110) / 60
        body.node.rotation.z += 0.035 * Math.sin(beat / 2)
        body.node.rotation.x += 0.015 * Math.abs(Math.sin(beat))
      }
    }

    // Idle face: eyes follow the pointer with small darts, a blink every few seconds,
    // and a faint smile and brow flicker that come and go.
    if (t > dart.current.next) {
      dart.current = { next: t + 0.8 + Math.random() * 1.6, x: (Math.random() - 0.5) * 0.25, y: (Math.random() - 0.5) * 0.2 }
    }
    if (t > blink.current.next) blink.current = { start: t, next: t + 2.5 + Math.random() * 3 }
    const blinkT = (t - blink.current.start) / 0.16
    const blinkLid = blinkT >= 0 && blinkT <= 1 ? Math.sin(blinkT * Math.PI) : 0
    const f = face.current
    Object.assign(f, neutralExpression())
    f.gaze = [
      Math.max(-1, Math.min(1, look.current.x * 1.6 + dart.current.x)),
      Math.max(-1, Math.min(1, -look.current.y * 1.4 + dart.current.y)),
    ]
    // Music Dan closes his eyes to the music now and then.
    const vibe = who === 'music' ? Math.sin(Math.PI * clamp01(((t % 6.5) - 4.8) / 1.4)) : 0
    f.lids = [Math.max(blinkLid, vibe * 0.8), Math.max(blinkLid, vibe * 0.8)]
    f.smile = 0.15 + 0.08 * Math.sin(t * 0.6)
    f.brows = [0.08 * Math.sin(t * 0.45), 0.08 * Math.sin(t * 0.45 + 0.6)]
    f.blush = PERSONAS[who].blush
    let notes = 0
    let gesture = {}
    now.current = t

    // Conversation modes: a sustained pose that eases in, underneath any reaction.
    const m = mode.current
    if (m.mode === 'talking' && m.until !== undefined && t > m.until) {
      mode.current = { mode: 'idle', since: t }
      queue.current.push('nod')
    }
    const ease = smoothstep(0, 0.35, t - m.since)
    switch (m.mode) {
      case 'listening':
        // Watches the composer below while the visitor types.
        f.gaze = [lerp(f.gaze[0], 0, ease), lerp(f.gaze[1], -0.75, ease)]
        f.brows = [f.brows[0] + 0.2 * ease, f.brows[1] + 0.2 * ease]
        if (body) body.node.rotation.x += 0.08 * ease
        break
      case 'thinking':
        // The Thinking pose, held: eyes up and away, brow cocked, finger on the chin.
        f.gaze = [lerp(f.gaze[0], -0.8 + 0.1 * Math.sin(t * 0.9), ease), lerp(f.gaze[1], 0.85, ease)]
        f.brows = [0.8 * ease, -0.3 * ease]
        f.browTilt = [0, -0.45 * ease]
        f.mouthShift = 0.6 * ease
        f.round = 0.25 * ease
        f.smile = lerp(f.smile, -0.15, ease)
        if (body) {
          body.node.rotation.z += 0.15 * ease
          body.node.rotation.y += -0.1 * ease
        }
        if (hands) gesture = handsFor('think', 0.4, 0.4, t, hands.anchors)
        break
      case 'talking': {
        // Talks with open-palm gestures until the reply has been read out.
        const syllable = Math.abs(Math.sin(t * 16)) * (0.6 + 0.4 * Math.sin(t * 5.3))
        f.open = (0.12 + 0.38 * syllable) * ease
        f.round = Math.max(0, Math.sin(t * 7.1)) * 0.5 * ease
        f.smile = lerp(f.smile, 0.4, ease)
        f.brows = [f.brows[0] + 0.35 * ease * Math.max(0, Math.sin(t * 2.3)), f.brows[1] + 0.35 * ease * Math.max(0, Math.sin(t * 2.3 + 0.4))]
        if (body) {
          body.node.rotation.z += Math.sin(t * 2.6) * 0.05 * ease
          body.node.rotation.x += Math.abs(Math.sin(t * 4)) * 0.03 * ease
        }
        if (hands) gesture = handsFor('chat', 0.4, 0.4, t, hands.anchors)
        break
      }
      case 'worried':
        f.browTilt = [0.8 * ease, 0.8 * ease]
        f.brows = [0.3 * ease, 0.3 * ease]
        f.smile = lerp(f.smile, -0.45, ease)
        f.gaze = [lerp(f.gaze[0], 0, ease), lerp(f.gaze[1], 0, ease)]
        if (body) body.node.rotation.z += 0.12 * ease
        break
    }

    if (!current.current && queue.current.length > 0) {
      const reaction = queue.current.shift()!
      const target = OUTFIT_CHANGES[reaction]
      current.current = { reaction, start: t, spins: target !== undefined && target !== who, changed: false }
      onReactionStart(reaction)
    }

    const playing = current.current
    if (playing) {
      const { reaction, start } = playing
      const p = Math.min((t - start) / DURATION[reaction], 1)
      const hold = holdOf(p)

      // Every click lands with a quick squash and stretch, so it reads even at 96px.
      const pop = t - start < 0.28 ? Math.sin((Math.PI * (t - start)) / 0.28) : 0
      if (root) {
        root.node.scale.set(root.scale[0] * (1 + 0.07 * pop), root.scale[1] * (1 - 0.06 * pop), root.scale[2] * (1 + 0.07 * pop))
        root.node.position.y += 0.08 * Math.sin(Math.PI * Math.min(1, (t - start) / 0.45))
      }

      // Outfit changes spin first and swap clothes at the halfway turn.
      const target = OUTFIT_CHANGES[reaction]
      let q = p
      if (target && playing.spins) {
        const spin = clamp01(p / SPIN_SHARE)
        if (root) root.node.rotation.y += easeInOut(spin) * Math.PI * 2
        if (!playing.changed && spin >= 0.5) {
          wear(target)
          playing.changed = true
        }
        q = clamp01((p - SPIN_SHARE) / (1 - SPIN_SHARE))
      } else if (target && !playing.changed) {
        wear(target)
        playing.changed = true
      }
      const qHold = holdOf(q)
      if (hands) gesture = handsFor(reaction, p, q, t, hands.anchors)

      const goal = EXPRESSION[reaction]
      if (goal) {
        const h = target ? qHold : hold
        const mix2 = (from: [number, number], to?: readonly [number, number]): [number, number] =>
          to ? [lerp(from[0], to[0], h), lerp(from[1], to[1], h)] : from
        f.gaze = mix2(f.gaze, goal.gaze)
        f.brows = mix2(f.brows, goal.brows)
        f.browTilt = mix2(f.browTilt, goal.browTilt)
        const lids = mix2(f.lids, goal.lids)
        f.lids = [Math.max(lids[0], blinkLid), Math.max(lids[1], blinkLid)]
        if (goal.smile !== undefined) f.smile = lerp(f.smile, goal.smile, h)
        if (goal.open !== undefined) f.open = lerp(f.open, goal.open, h)
      }

      switch (reaction) {
        case 'wave':
          // A big friendly side-to-side waggle.
          if (body) {
            body.node.rotation.z += Math.sin(p * Math.PI * 4) * 0.28 * hold
            body.node.rotation.x += -0.1 * hold
          }
          break
        case 'closer': {
          // Leans in and squints, peers over the glasses as they slide down, then pushes them up.
          const slide = smoothstep(0.22, 0.38, p) * (1 - smoothstep(0.68, 0.8, p))
          const push = smoothstep(0.74, 0.84, p) * (1 - smoothstep(0.9, 1, p))
          if (root) {
            root.node.scale.multiplyScalar(1 + 0.15 * hold)
            root.node.position.z += 0.35 * hold
            root.node.position.y -= 0.05 * hold
          }
          if (body) body.node.rotation.x += 0.1 * slide * hold
          f.squint = 0.65 * (1 - slide) * hold
          f.glassesLift = -slide + 0.35 * push
          f.gaze = [lerp(f.gaze[0], 0, hold), lerp(f.gaze[1], 0.8, slide)]
          f.brows = [lerp(-0.4 * hold, 0.9, push + slide * 0.4), lerp(-0.4 * hold, 0.9, push + slide * 0.4)]
          f.browTilt = [-0.7 * hold * (1 - push), -0.7 * hold * (1 - push)]
          f.smile = lerp(f.smile, 0.5, push)
          break
        }
        case 'think': {
          // Eyes up and away, one brow cocked, mouth pushed to the side; then "aha".
          const think = hold * (1 - smoothstep(0.7, 0.8, p))
          const aha = smoothstep(0.72, 0.8, p) * (1 - smoothstep(0.93, 1, p))
          f.gaze = [lerp(f.gaze[0], -0.85, think), lerp(f.gaze[1], 0.9, think)]
          f.brows = [0.9 * think + aha, -0.35 * think + aha]
          f.browTilt = [0, -0.5 * think]
          f.mouthShift = 0.75 * think
          f.round = 0.3 * think
          f.smile = lerp(f.smile, -0.2, think) + 0.8 * aha
          if (body) {
            body.node.rotation.z += 0.22 * think
            body.node.rotation.y += -0.15 * think
          }
          if (root) root.node.position.y += 0.07 * aha
          break
        }
        case 'gym': {
          // Light jog on the spot, puffing.
          const stride = Math.abs(Math.sin(q * Math.PI * 5))
          if (root) root.node.position.y += 0.045 * stride * qHold
          if (body) body.node.rotation.z += Math.sin(q * Math.PI * 2.5) * 0.04 * qHold
          f.open = (0.2 + 0.15 * stride) * qHold
          f.round = 0.6 * qHold
          f.brows = [0.4 * qHold, 0.4 * qHold]
          f.blush = lerp(f.blush, 0.8, qHold)
          break
        }
        case 'wink':
          // Cheeky tilt with a little nod.
          if (body) {
            body.node.rotation.z += 0.32 * hold
            body.node.rotation.y += 0.2 * hold
            body.node.rotation.x += Math.sin(p * Math.PI * 2) * 0.1
          }
          break
        case 'nod': {
          // Two firm nods, eyes locked on you, then a confident brow flash.
          const nods = Math.max(0, Math.sin(p * Math.PI * 4))
          if (body) body.node.rotation.x += 0.28 * nods * hold
          const flash = smoothstep(0.7, 0.82, p) * (1 - smoothstep(0.94, 1, p))
          f.gaze = [lerp(f.gaze[0], 0, hold), lerp(f.gaze[1], 0, hold)]
          f.smile = lerp(f.smile, 1, hold)
          f.brows = [0.9 * flash, 0.9 * flash]
          break
        }
        case 'beat': {
          // Eyes shut, grooving: a slow sway with a soft nod on the beat while the notes burst.
          if (body) {
            body.node.rotation.z += Math.sin(q * Math.PI * 2) * 0.07 * qHold
            body.node.rotation.x += 0.06 * Math.abs(Math.sin(q * Math.PI * 4)) * qHold
          }
          f.lids = [Math.max(f.lids[0], 0.85 * qHold), Math.max(f.lids[1], 0.85 * qHold)]
          f.smile = lerp(f.smile, 0.7, qHold)
          notes = qHold
          break
        }
        case 'psst': {
          // Checks left and right, leaning in conspiratorially, then grins at you.
          const sneak = hold * (1 - smoothstep(0.55, 0.68, p))
          const grin = smoothstep(0.55, 0.66, p) * hold
          if (root) root.node.position.x -= 0.18 * sneak
          if (body) body.node.rotation.z += -0.18 * sneak
          f.gaze = [lerp(f.gaze[0], Math.sin((p / 0.55) * Math.PI * 2), sneak), lerp(f.gaze[1], 0, hold)]
          f.brows = [lerp(-0.5 * sneak, 0.6, grin), lerp(-0.5 * sneak, 0.6, grin)]
          f.browTilt = [-0.4 * sneak, -0.4 * sneak]
          f.smile = lerp(lerp(f.smile, 0.1, sneak), 1, grin)
          break
        }
        case 'chat': {
          // Talks while it bobs: the mouth cycles through rough syllable shapes.
          const syllable = Math.abs(Math.sin(t * 16)) * (0.6 + 0.4 * Math.sin(t * 5.3))
          f.open = (0.12 + 0.4 * syllable) * qHold
          f.round = Math.max(0, Math.sin(t * 7.1)) * 0.6 * qHold
          if (root) root.node.position.y += Math.abs(Math.sin(q * Math.PI * 3)) * 0.18 * (1 - q * 0.5)
          if (body) body.node.rotation.z += Math.sin(q * Math.PI * 3) * 0.15 * qHold
          break
        }
      }
      if (p >= 1) current.current = null
    }

    // Share the head's tilt, nod and turn with the whole bust, so the neck itself bends less:
    // the cut between head and body stays in the collar and the throat stays tucked under the chin.
    if (head && root) {
      const tilt = head.node.rotation.z - head.rotation[2]
      const nod = head.node.rotation.x - head.rotation[0]
      const turn = head.node.rotation.y - head.rotation[1]
      head.node.rotation.z -= tilt * 0.55
      head.node.rotation.x -= nod * 0.3
      head.node.rotation.y -= turn * 0.4
      root.node.rotation.z += tilt * 0.55
      root.node.rotation.x += nod * 0.3
      root.node.rotation.y += turn * 0.4
    }

    features?.update(f)
    props?.update(t, notes)
    hands?.update(gesture, delta)
  })

  return <primitive object={pivot} />
}

export default function HeroAvatarScene(props: Props) {
  return (
    <Canvas
      className="absolute! inset-0"
      dpr={[1, 2]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true }}
      // Measure layout size, ignoring CSS transforms, so scaling the avatar never resizes
      // (and clears) the WebGL canvas.
      resize={{ offsetSize: true }}
      camera={{ position: [0, 0, 3.9], fov: 35 }}
      aria-hidden="true">
      <ambientLight intensity={1.4} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} />
      <directionalLight position={[-3, 1, 2]} intensity={0.6} />
      <Avatar {...props} />
    </Canvas>
  )
}

useLoader.preload(GLTFLoader, AVATAR_MODEL_URL)
