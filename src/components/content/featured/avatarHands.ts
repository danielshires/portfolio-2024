import { Box3, CapsuleGeometry, Group, Mesh, MeshStandardMaterial, Raycaster, SphereGeometry, Vector3 } from 'three'
import type { AvatarReaction } from './avatarCycle'

/**
 * Cartoon toy hands for the avatar: rounded mitten palms with jointed fingers and a thumb.
 * They float in from below the frame for gestures (there are no arms), are attached to the
 * head so they follow its moves, and stay out of sight while idle.
 */
export type HandPose = 'open' | 'fist' | 'point' | 'thumbsUp' | 'fingerGun' | 'cupped'

/** Where a hand should be this frame, in Head-local units (see HandAnchors). */
export interface HandTarget {
  position: Vector3
  /** Euler angles; the hand's fingers point +y and its palm faces +z (the camera) at zero. */
  rotation: [number, number, number]
  pose: HandPose
  /** Extra curl on the index finger (0..1), for tapping. */
  tap?: number
  /** 0 = tucked away below the frame, 1 = fully in place. */
  weight: number
}

export interface HandsState {
  /** The hand on the right of the screen, and the one on the left (mirrored). */
  right?: HandTarget
  left?: HandTarget
}

/** Landmarks on the head the gestures aim at, in Head-local units. */
export interface HandAnchors {
  width: number
  height: number
  centreX: number
  /** Front surface of the face at a height fraction (0 neck .. 1 top of the hair). */
  front: (fy: number) => Vector3
  /** Outside of the screen-right ear, where the headphone cup sits. */
  rightEar: Vector3
  /** Neck height (bottom of the head), the origin for height fractions. */
  baseY: number
  /** Below the frame, where hands hide. */
  hideY: number
}

/** Curl per finger (index, middle, ring, little) in radians toward the palm, and the thumb's angles. */
const POSES: Record<HandPose, { fingers: [number, number, number, number]; thumb: [number, number] }> = {
  open: { fingers: [0, 0, 0, 0], thumb: [0, 0.85] },
  fist: { fingers: [2, 2, 2, 2], thumb: [-0.7, -0.15] },
  point: { fingers: [0, 2, 2, 2], thumb: [-0.7, -0.15] },
  thumbsUp: { fingers: [2, 2, 2, 2], thumb: [0, 0] },
  fingerGun: { fingers: [0, 2, 2, 2], thumb: [0, 0.1] },
  cupped: { fingers: [0.55, 0.6, 0.6, 0.55], thumb: [-0.3, 0.45] },
}

interface Hand {
  group: Group
  fingers: Group[]
  thumb: Group
  weight: number
  /** Current joint angles, eased toward the pose. */
  joints: number[]
  last?: HandTarget
  /** Whether the hand has a position yet (the first frame snaps instead of gliding). */
  placed?: boolean
}

function buildHand(material: MeshStandardMaterial, size: number, mirrored: boolean): Hand {
  const group = new Group()
  const inner = new Group()
  inner.scale.set(mirrored ? -size : size, size, size)
  group.add(inner)

  const palmGeometry = new SphereGeometry(0.095, 24, 18)
  palmGeometry.scale(1, 1.1, 0.6)
  const palm = new Mesh(palmGeometry, material)
  palm.position.y = 0.09
  inner.add(palm)

  // Index on the thumb side (screen-left for the right-hand mitten), little finger outside.
  const knuckles = [-0.05, -0.017, 0.017, 0.05]
  const lengths = [0.1, 0.11, 0.104, 0.085]
  const fingers = knuckles.map((x, i) => {
    const joint = new Group()
    joint.position.set(x, 0.175, 0)
    const finger = new Mesh(new CapsuleGeometry(0.027, lengths[i], 4, 10), material)
    finger.position.y = lengths[i] / 2
    joint.add(finger)
    inner.add(joint)
    return joint
  })
  const thumb = new Group()
  thumb.position.set(-0.075, 0.07, 0.01)
  const thumbMesh = new Mesh(new CapsuleGeometry(0.031, 0.075, 4, 10), material)
  thumbMesh.position.y = 0.05
  thumb.add(thumbMesh)
  inner.add(thumb)

  group.visible = false
  return { group, fingers, thumb, weight: 0, joints: [0, 0, 0, 0, 0, 0.85] }
}

/** Builds both hands on `head`. Call while the model is detached and untransformed. */
export function attachHands(head: Mesh, skin: string) {
  head.geometry.computeBoundingBox()
  const box = head.geometry.boundingBox ?? new Box3()
  const width = box.max.x - box.min.x
  const height = box.max.y - box.min.y
  const centreX = (box.min.x + box.max.x) / 2
  head.updateMatrixWorld(true)

  const raycaster = new Raycaster()
  const cast = (origin: Vector3, direction: Vector3) => {
    raycaster.set(head.localToWorld(origin.clone()), direction.clone().transformDirection(head.matrixWorld))
    const hit = raycaster.intersectObject(head, false)[0]
    return hit ? head.worldToLocal(hit.point.clone()) : undefined
  }
  // Gestures ask for the same few face points every frame, so cast once per height.
  const fronts = new Map<number, Vector3>()
  const front = (fy: number) => {
    let point = fronts.get(fy)
    if (!point) {
      const y = box.min.y + fy * height
      point = cast(new Vector3(centreX, y, box.max.z + 1), new Vector3(0, 0, -1)) ?? new Vector3(centreX, y, box.max.z)
      fronts.set(fy, point)
    }
    return point
  }
  const earY = box.min.y + 0.45 * height
  const centreZ = (box.min.z + box.max.z) / 2
  const rightEar = cast(new Vector3(centreX + width * 2, earY, centreZ), new Vector3(-1, 0, 0)) ?? new Vector3(centreX + width / 2, earY, centreZ)

  const anchors: HandAnchors = { width, height, centreX, front, rightEar, baseY: box.min.y, hideY: box.min.y - height * 0.9 }

  const material = new MeshStandardMaterial({ color: skin, roughness: 0.6 })
  const size = width * 1.45
  const right = buildHand(material, size, false)
  const left = buildHand(material, size, true)
  const root = new Group()
  root.name = 'Hands'
  root.add(right.group, left.group)
  head.add(root)

  const apply = (hand: Hand, target: HandTarget | undefined, delta: number) => {
    if (target) hand.last = target
    const goal = target?.weight ?? 0
    hand.weight += (goal - hand.weight) * (1 - Math.exp(-delta * 12))
    const last = hand.last
    hand.group.visible = hand.weight > 0.01 && last !== undefined
    if (!last || !hand.group.visible) return

    // Slide up from below the frame toward the target, gliding when the target jumps
    // (say from the chin to a talking gesture).
    const w = hand.weight
    const desired = new Vector3(last.position.x, anchors.hideY + (last.position.y - anchors.hideY) * w, last.position.z)
    if (hand.group.visible && hand.placed) hand.group.position.lerp(desired, 1 - Math.exp(-delta * 22))
    else hand.group.position.copy(desired)
    hand.placed = true
    hand.group.rotation.set(...last.rotation)

    const pose = POSES[last.pose]
    const goals = [...pose.fingers, ...pose.thumb]
    goals[0] += (last.tap ?? 0) * 0.6
    const ease = 1 - Math.exp(-delta * 16)
    hand.joints = hand.joints.map((j, i) => j + (goals[i] - j) * ease)
    hand.fingers.forEach((finger, i) => (finger.rotation.x = -hand.joints[i]))
    hand.thumb.rotation.set(hand.joints[4], 0, hand.joints[5])
  }

  return {
    anchors,
    update: (state: HandsState, delta: number) => {
      apply(right, state.right, delta)
      apply(left, state.left, delta)
    },
    dispose: () => {
      root.removeFromParent()
      root.traverse((o) => {
        if (o instanceof Mesh) o.geometry.dispose()
      })
      material.dispose()
    },
  }
}

export type AvatarHands = ReturnType<typeof attachHands>

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}
/** In between `from` and `to` (as fractions of a reaction), easing in and out. */
const during = (p: number, from: number, to: number, fade = 0.08) => smoothstep(from, from + fade, p) * (1 - smoothstep(to - fade, to, p))

/**
 * Each reaction's hand gesture. `p` is the reaction's progress (0..1), `q` its progress after any
 * outfit-change spin, and `t` the scene clock (for rhythms).
 */
export function handsFor(reaction: AvatarReaction, p: number, q: number, t: number, a: HandAnchors): HandsState {
  const { width: W, height: H, centreX: cx } = a
  const at = (fx: number, fy: number, z: number) => new Vector3(cx + fx * W, a.baseY + fy * H, z)
  const faceZ = a.front(0.3).z

  switch (reaction) {
    case 'wave':
      // Open palm beside the face, waving at the wrist.
      return {
        right: {
          position: at(0.66, 0.3, faceZ + 0.02),
          rotation: [0, 0, -0.25 + Math.sin(p * Math.PI * 6) * 0.45],
          pose: 'open',
          weight: during(p, 0.05, 0.95),
        },
      }
    case 'closer': {
      // One finger pushes the glasses back up the nose at the end.
      const bridge = a.front(0.46)
      const push = smoothstep(0.74, 0.84, p)
      return {
        right: {
          position: new Vector3(bridge.x + W * 0.24, bridge.y - H * 0.26 + push * H * 0.05, bridge.z + W * 0.14),
          rotation: [0.3, 0, 0.75],
          pose: 'point',
          weight: during(p, 0.62, 0.98),
        },
      }
    }
    case 'think': {
      // Strokes the chin, index finger tapping.
      const chin = a.front(0.1)
      return {
        right: {
          position: new Vector3(chin.x + W * 0.16, chin.y - H * 0.22, chin.z + W * 0.1),
          rotation: [0.4, 0, 0.6],
          pose: 'point',
          tap: Math.max(0, Math.sin(t * 12)) * during(p, 0.15, 0.7),
          weight: during(p, 0.08, 0.78),
        },
      }
    }
    case 'gym': {
      // Fists pump in time with the jog.
      const swing = Math.sin(q * Math.PI * 5)
      const weight = during(q, 0.02, 0.95)
      return {
        right: { position: at(0.42, 0.1 + 0.06 * swing, faceZ + 0.05), rotation: [-0.3, 0, -0.2], pose: 'fist', weight },
        left: { position: at(-0.42, 0.1 - 0.06 * swing, faceZ + 0.05), rotation: [-0.3, 0, 0.2], pose: 'fist', weight },
      }
    }
    case 'wink': {
      // Finger-guns at you, with a little recoil.
      const recoil = Math.max(0, Math.sin(((p - 0.45) / 0.15) * Math.PI)) * (p > 0.45 && p < 0.6 ? 1 : 0)
      return {
        right: {
          position: at(0.46, 0.14, faceZ + 0.18),
          rotation: [-0.75 - recoil * 0.3, 0, -0.85],
          pose: 'fingerGun',
          weight: during(p, 0.12, 0.92),
        },
      }
    }
    case 'nod':
      // A thumbs-up pops in on the second nod.
      return {
        right: {
          position: at(0.5, 0.15 + 0.04 * Math.sin(p * Math.PI * 4), faceZ + 0.1),
          rotation: [0, 0.5, 0],
          pose: 'thumbsUp',
          weight: during(p, 0.42, 0.96),
        },
      }
    case 'beat': {
      // Presses the headphone cup to his ear, DJ-style, pulsing on the beat.
      const pulse = Math.abs(Math.sin((t * Math.PI * 110) / 60)) * 0.015
      return {
        right: {
          position: new Vector3(a.rightEar.x + W * 0.22 - pulse, a.rightEar.y - H * 0.2, a.rightEar.z + W * 0.05),
          rotation: [0, -1.45, 0.15],
          pose: 'cupped',
          weight: during(q, 0.05, 0.92),
        },
      }
    }
    case 'psst': {
      // Cups a hand by the mouth to whisper, then points to the side, at the link.
      const mouth = a.front(0.2)
      return {
        left: {
          position: new Vector3(mouth.x - W * 0.42, mouth.y - H * 0.2, mouth.z + W * 0.04),
          rotation: [0, 0.9, -0.2],
          pose: 'cupped',
          weight: during(p, 0.08, 0.58),
        },
        right: {
          position: at(0.42, 0.12, faceZ + 0.1),
          rotation: [0, 0, -1.45],
          pose: 'point',
          weight: during(p, 0.6, 0.98),
        },
      }
    }
    case 'chat': {
      // Open palms gesture as he talks, then a small wave.
      const talk = during(q, 0.02, 0.75)
      const bob = Math.sin(t * 7) * 0.03
      const wave = during(q, 0.72, 1)
      return {
        right: {
          position: at(0.46 + 0.1 * wave, 0.08 + bob + 0.22 * wave, faceZ + 0.05),
          rotation: [-0.4 * (1 - wave), 0, -0.35 + Math.sin(t * 14) * 0.35 * wave],
          pose: 'open',
          weight: Math.max(talk, wave),
        },
        left: { position: at(-0.46, 0.08 - bob, faceZ + 0.05), rotation: [-0.4, 0, 0.35], pose: 'open', weight: talk },
      }
    }
  }
}
