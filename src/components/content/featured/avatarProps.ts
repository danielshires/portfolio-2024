import {
  Box3,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
} from 'three'

import type { Persona } from './avatarCycle'

/**
 * The avatar's versions. They share one model; each adds props built here and re-tints the tee.
 * Prop positions are fractions of the Head mesh's bounds, like FACE_LAYOUT in avatarFeatures.ts.
 */

export const PERSONAS: Record<Persona, { shirt: string | null; blush: number }> = {
  work: { shirt: null, blush: 0 },
  fitness: { shirt: '#22b0ad', blush: 0.35 },
  music: { shirt: '#222225', blush: 0 },
}

const PROP_LAYOUT = {
  /** Height of the ears, where the pencil rests and the headphones sit. */
  earY: 0.45,
  /** Forehead height for the sweatband (above the brows). */
  bandY: 0.76,
  /** Sweat drop path down the screen-left temple. */
  sweat: { from: [-0.33, 0.66], to: [-0.38, 0.5] },
  /** Seconds between sweat drops, and between rising music notes. */
  sweatEvery: 4.5,
  notesEvery: 2.4,
}

export interface AvatarProps {
  setPersona: (persona: Persona) => void
  /** `t` is the scene clock; `notes` (0..1) speeds the music notes up for a burst. */
  update: (t: number, notes: number) => void
  dispose: () => void
}

/** Builds every version's props on `head` (hidden until setPersona). Call while untransformed. */
export function attachProps(head: Mesh): AvatarProps {
  head.geometry.computeBoundingBox()
  const box = head.geometry.boundingBox ?? new Box3()
  const width = box.max.x - box.min.x
  const height = box.max.y - box.min.y
  const centre = box.getCenter(new Vector3())
  const atY = (fy: number) => box.min.y + fy * height
  head.updateMatrixWorld(true)

  const raycaster = new Raycaster()
  /** First hit on the head from `origin` along `direction` (both Head-local). */
  const cast = (origin: Vector3, direction: Vector3) => {
    raycaster.set(head.localToWorld(origin.clone()), direction.clone().transformDirection(head.matrixWorld))
    const hit = raycaster.intersectObject(head, false)[0]
    return hit ? head.worldToLocal(hit.point.clone()) : undefined
  }
  const side = (sign: number, y: number, z = centre.z) =>
    cast(new Vector3(centre.x + sign * width * 2, y, z), new Vector3(-sign, 0, 0))?.x ?? centre.x + (sign * width) / 2
  const front = (x: number, y: number) =>
    cast(new Vector3(x, y, box.max.z + 1), new Vector3(0, 0, -1)) ?? new Vector3(x, y, box.max.z)

  const root = new Group()
  root.name = 'Props'
  head.add(root)
  const matte = (color: string) => new MeshStandardMaterial({ color, roughness: 0.55 })

  // Work: a pencil tucked behind the screen-right ear, pointing forward and down.
  const pencil = new Group()
  {
    const length = width * 0.56
    const radius = width * 0.03
    const along = (geometry: CylinderGeometry | ConeGeometry) => geometry.rotateX(Math.PI / 2)
    const shaft = new Mesh(along(new CylinderGeometry(radius, radius, length * 0.72, 6)), matte('#f2c230'))
    const band = new Mesh(along(new CylinderGeometry(radius * 1.05, radius * 1.05, length * 0.06, 12)), matte('#b9b9b9'))
    band.position.z = -length * 0.39
    const eraser = new Mesh(along(new CylinderGeometry(radius, radius, length * 0.1, 12)), matte('#ec8b9a'))
    eraser.position.z = -length * 0.47
    const wood = new Mesh(along(new ConeGeometry(radius, length * 0.15, 6)), matte('#ebc898'))
    wood.position.z = length * 0.43
    const lead = new Mesh(along(new ConeGeometry(radius * 0.35, length * 0.05, 6)), matte('#333333'))
    lead.position.z = length * 0.52
    pencil.add(shaft, band, eraser, wood, lead)
    const y = atY(PROP_LAYOUT.earY + 0.08)
    pencil.position.set(side(1, y) + radius * 1.4, y, centre.z + width * 0.08)
    pencil.rotation.set(0.38, 0.22, 0)
  }

  // Fitness: a sweatband round the forehead, and a sweat drop that runs down the temple.
  const sweatband = new Group()
  {
    const y = atY(PROP_LAYOUT.bandY)
    const z0 = cast(new Vector3(centre.x, y, box.min.z - 1), new Vector3(0, 0, 1))?.z ?? box.min.z
    const z1 = front(centre.x, y).z
    const cz = (z0 + z1) / 2
    const rz = ((z1 - z0) / 2) * 1.04 + width * 0.01
    const rx = (side(1, y, cz) - side(-1, y, cz)) / 2 * 1.04 + width * 0.01
    const points = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2
      return new Vector3(centre.x + Math.cos(a) * rx, y, cz + Math.sin(a) * rz)
    })
    const band = new Mesh(new TubeGeometry(new CatmullRomCurve3(points, true), 96, width * 0.04, 10, true), matte('#f4f4f2'))
    const stripe = new Mesh(
      new TubeGeometry(new CatmullRomCurve3(points.map((p) => p.clone().setY(y + width * 0.004)), true), 96, width * 0.042, 10, true),
      matte('#22b0ad'),
    )
    // Flatten the stripe into a thin band about the forehead line (scaling is about y = 0).
    stripe.scale.setY(0.35)
    stripe.position.y = y * 0.65
    sweatband.add(band, stripe)
  }
  const dropMaterial = new MeshPhysicalMaterial({ color: '#a8dcff', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 })
  const drop = new Group()
  {
    const r = width * 0.028
    drop.add(new Mesh(new SphereGeometry(r, 16, 12), dropMaterial))
    const tip = new Mesh(new ConeGeometry(r * 0.72, r * 1.6, 16), dropMaterial)
    tip.position.y = r * 0.95
    drop.add(tip)
  }
  const sweatFrom = front(centre.x + PROP_LAYOUT.sweat.from[0] * width, atY(PROP_LAYOUT.sweat.from[1]))
  const sweatTo = front(centre.x + PROP_LAYOUT.sweat.to[0] * width, atY(PROP_LAYOUT.sweat.to[1]))

  // Music: chunky over-ear headphones, and notes that float up from them.
  const headphones = new Group()
  const dark = matte('#1d1d1f')
  const accent = matte('#e0483e')
  let cupRight = new Vector3()
  {
    const y = atY(PROP_LAYOUT.earY)
    const left = side(-1, y) - width * 0.05
    const right = side(1, y) + width * 0.05
    const top = box.max.y + width * 0.05
    const cx = (left + right) / 2
    const rx = (right - left) / 2
    const ry = top - y
    const points = Array.from({ length: 33 }, (_, i) => {
      const a = (i / 32) * Math.PI
      return new Vector3(cx + Math.cos(a) * rx, y + Math.sin(a) * ry, centre.z)
    })
    headphones.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(points), 64, width * 0.035, 10), dark))
    for (const x of [left, right]) {
      const cup = new Mesh(new CylinderGeometry(width * 0.14, width * 0.14, width * 0.1, 28), dark)
      cup.rotation.z = Math.PI / 2
      cup.position.set(x, y, centre.z)
      const ring = new Mesh(new TorusGeometry(width * 0.1, width * 0.02, 8, 28), accent)
      ring.rotation.y = Math.PI / 2
      ring.position.set(x + Math.sign(x - cx) * width * 0.052, y, centre.z)
      headphones.add(cup, ring)
    }
    cupRight = new Vector3(right, y, centre.z)
  }
  const notes = Array.from({ length: 3 }, () => {
    const noteMaterial = new MeshBasicMaterial({ color: '#1d1d1f', transparent: true, opacity: 0 })
    const note = new Group()
    note.userData.material = noteMaterial
    const headGeometry = new SphereGeometry(width * 0.045, 14, 10)
    headGeometry.scale(1.3, 1, 0.6)
    note.add(new Mesh(headGeometry, noteMaterial))
    const stem = new Mesh(new CylinderGeometry(width * 0.008, width * 0.008, width * 0.16, 6), noteMaterial)
    stem.position.set(width * 0.05, width * 0.08, 0)
    const flag = new Mesh(new CylinderGeometry(width * 0.008, width * 0.008, width * 0.08, 6), noteMaterial)
    flag.rotation.z = -0.9
    flag.position.set(width * 0.075, width * 0.14, 0)
    note.add(stem, flag)
    note.rotation.z = -0.15
    return note
  })

  root.add(pencil, sweatband, drop, headphones, ...notes)

  let persona: Persona = 'work'
  const setPersona = (next: Persona) => {
    persona = next
    pencil.visible = next === 'work'
    sweatband.visible = next === 'fitness'
    headphones.visible = next === 'music'
    drop.visible = false
    notes.forEach((n) => (n.visible = next === 'music'))
  }
  setPersona('work')

  const update = (t: number, burst: number) => {
    if (persona === 'fitness') {
      // A drop forms, runs down the temple and fades, every few seconds.
      const phase = (t % PROP_LAYOUT.sweatEvery) / PROP_LAYOUT.sweatEvery
      drop.visible = phase < 0.35
      if (drop.visible) {
        const run = Math.max(0, (phase - 0.08) / 0.27)
        drop.position.lerpVectors(sweatFrom, sweatTo, run).add(new Vector3(0, 0, width * 0.025))
        drop.scale.setScalar(Math.min(1, phase / 0.08))
        dropMaterial.opacity = 0.85 * (1 - Math.max(0, (run - 0.8) / 0.2))
      }
    }
    if (persona === 'music') {
      // Three notes rise from the right ear cup in turn, drifting and fading.
      notes.forEach((note, i) => {
        const phase = ((t * (1 + burst * 2)) / PROP_LAYOUT.notesEvery + i / notes.length) % 1
        note.position.set(
          cupRight.x + width * (0.12 + 0.08 * Math.sin(phase * Math.PI * 2 + i)),
          cupRight.y + height * (0.1 + phase * 0.45),
          cupRight.z + width * 0.1,
        )
        note.scale.setScalar(0.7 + 0.3 * Math.sin(phase * Math.PI))
        ;(note.userData.material as MeshBasicMaterial).opacity = 0.8 * Math.sin(phase * Math.PI)
      })
    }
  }

  return {
    setPersona,
    update,
    dispose: () => {
      root.removeFromParent()
      root.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose()
          ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m: Material) => m.dispose())
        }
      })
    },
  }
}

/**
 * Re-tints the tee on the Body mesh without touching the neck. The cream tee and the skin are
 * told apart by their blue-to-red ratio (about 0.66 vs 0.23 in linear light) and brightness;
 * tee texels take the new colour and keep their shading.
 */
export function attachShirtTint(body: Mesh) {
  const tint = { value: new Color('#ffffff') }
  const amount = { value: 0 }
  body.userData.baseMaterial ??= body.material
  const material = (body.userData.baseMaterial as MeshStandardMaterial).clone()
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShirtTint = tint
    shader.uniforms.uShirtAmount = amount
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uShirtTint;\nuniform float uShirtAmount;')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float shirtLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        float blueRed = diffuseColor.b / max(diffuseColor.r, 0.001);
        float isShirt = smoothstep(0.42, 0.55, blueRed) * smoothstep(0.3, 0.45, shirtLum);
        diffuseColor.rgb = mix(diffuseColor.rgb, uShirtTint * (shirtLum / 0.85), isShirt * uShirtAmount);`,
      )
  }
  material.customProgramCacheKey = () => 'avatar-shirt'
  body.material = material
  return (shirt: string | null) => {
    amount.value = shirt ? 1 : 0
    if (shirt) tint.value.set(shirt)
  }
}
