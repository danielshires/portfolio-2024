import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Box3, Group, Vector3, type Object3D } from 'three'

/**
 * Any GLB works: it is centred and scaled to fit the circle. Parts named Head,
 * Hand, Thumb, EyeL/EyeR and BrowR get their own moves; without them (e.g. an
 * AI image-to-3D export) every reaction moves the whole model instead.
 */
export const AVATAR_MODEL_URL = '/models/dan-avatar.glb'

/** Model height in world units after fitting; the camera frames about 2.5. */
const FIT_HEIGHT = 1.8

export type AvatarReaction = 'wave' | 'thumbs' | 'spin' | 'wink' | 'bounce'

/** Filled in by the scene so the button outside the canvas can queue reactions. */
export interface AvatarController {
  play?: (reaction: AvatarReaction) => void
}

interface Props {
  controller: MutableRefObject<AvatarController>
  /** Pointer position over the window, -1..1 on each axis. */
  pointer: MutableRefObject<{ x: number; y: number }>
  reducedMotion: boolean
  onReady: () => void
  onReactionStart: (reaction: AvatarReaction) => void
}

const DURATION: Record<AvatarReaction, number> = {
  wave: 1.2,
  thumbs: 0.8,
  spin: 1,
  wink: 0.7,
  bounce: 0.9,
}

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

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2)

function Avatar({ controller, pointer, reducedMotion, onReady, onReactionStart }: Props) {
  const { scene } = useLoader(GLTFLoader, AVATAR_MODEL_URL)

  const pivot = useMemo(() => {
    // The loaded scene is cached and React may run this more than once, so measure it
    // detached and untransformed; otherwise offsets and scale compound.
    scene.removeFromParent()
    scene.position.set(0, 0, 0)
    scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const fit = new Group()
    fit.add(scene)
    scene.position.sub(box.getCenter(new Vector3()))
    fit.scale.setScalar(FIT_HEIGHT / Math.max(size.x, size.y, size.z))
    // Separate group so spins and hops turn about the model's centre.
    const group = new Group()
    group.add(fit)
    return group
  }, [scene])

  const parts = useMemo(() => {
    const find = (name: string) => capture(scene.getObjectByName(name))
    return {
      root: capture(pivot),
      head: find('Head'),
      hand: find('Hand'),
      thumb: find('Thumb'),
      eyeL: find('EyeL'),
      eyeR: find('EyeR'),
      browR: find('BrowR'),
    }
  }, [scene, pivot])

  const queue = useRef<AvatarReaction[]>([])
  const current = useRef<{ reaction: AvatarReaction; start: number } | null>(null)
  const nextBlink = useRef(2)
  const look = useRef({ x: 0, y: 0 })

  useEffect(() => {
    controller.current.play = (reaction) => {
      queue.current.push(reaction)
    }
    onReady()
    return () => {
      controller.current.play = undefined
      Object.values(parts).forEach(reset)
    }
  }, [controller, onReady, parts])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const { root, head, hand, thumb, eyeL, eyeR, browR } = parts
    Object.values(parts).forEach(reset)
    if (reducedMotion) return

    // Idle: breathe, glance toward the pointer, blink now and then.
    if (root) root.node.position.y += Math.sin(t * 1.6) * 0.02
    look.current.x += (pointer.current.x - look.current.x) * 0.08
    look.current.y += (pointer.current.y - look.current.y) * 0.08
    const looker = head ?? root
    if (looker) {
      looker.node.rotation.y += look.current.x * 0.35
      looker.node.rotation.x += -look.current.y * 0.2
    }
    if (t > nextBlink.current + 0.15) nextBlink.current = t + 3 + Math.random() * 2
    if (t > nextBlink.current) {
      const closed = 1 - 0.9 * Math.sin(((t - nextBlink.current) / 0.15) * Math.PI)
      eyeL?.node.scale.setY(eyeL.scale[1] * closed)
      eyeR?.node.scale.setY(eyeR.scale[1] * closed)
    }

    if (!current.current && queue.current.length > 0) {
      const reaction = queue.current.shift()!
      current.current = { reaction, start: t }
      onReactionStart(reaction)
    }
    if (!current.current) return

    const { reaction, start } = current.current
    const p = Math.min((t - start) / DURATION[reaction], 1)
    const envelope = Math.sin(Math.PI * p)

    switch (reaction) {
      case 'wave':
        if (hand) {
          hand.node.rotation.z += Math.sin(p * Math.PI * 4) * 0.5 * envelope
          hand.node.position.y += 0.15 * envelope
        } else if (root) {
          // Side-to-side rock, like a friendly head waggle.
          root.node.rotation.z += Math.sin(p * Math.PI * 4) * 0.18 * envelope
        }
        break
      case 'thumbs':
        if (hand) {
          hand.node.scale.multiplyScalar(1 + 0.35 * envelope)
          if (thumb) thumb.node.rotation.z += 0.3 * envelope
        } else if (root) {
          // Squash then stretch.
          const squash = Math.sin(p * Math.PI * 2) * 0.12 * (1 - p)
          root.node.scale.set(root.scale[0] * (1 + squash), root.scale[1] * (1 - squash), root.scale[2] * (1 + squash))
        }
        break
      case 'spin':
        if (root) root.node.rotation.y += easeInOut(p) * Math.PI * 2
        break
      case 'wink': {
        const hold = Math.min(1, envelope * 2)
        if (eyeR) {
          eyeR.node.scale.setY(eyeR.scale[1] * (1 - 0.9 * hold))
          if (browR) browR.node.position.y += 0.06 * hold
        } else if (root) {
          // Cheeky head tilt and a little nod.
          root.node.rotation.z += 0.22 * hold
          root.node.rotation.x += Math.sin(p * Math.PI * 3) * 0.08 * envelope
        }
        break
      }
      case 'bounce':
        if (root) root.node.position.y += Math.abs(Math.sin(p * Math.PI * 2)) * 0.25 * (1 - p * 0.5)
        if (head) head.node.rotation.z += Math.sin(p * Math.PI * 2) * 0.12
        break
    }

    if (p >= 1) current.current = null
  })

  return <primitive object={pivot} />
}

export default function HeroAvatarScene(props: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={props.reducedMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true }}
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
