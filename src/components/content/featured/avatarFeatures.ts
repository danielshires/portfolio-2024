import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Quaternion,
  Raycaster,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  type Material,
} from 'three'

/**
 * Live face for the toy-figure avatar. The model's face is left blank, so the eyes, eyelids,
 * brows, mouth, blush and glasses are built here and placed on the head by casting rays at it.
 *
 * Layout is in fractions of the Head mesh's bounds: x from the centre (-0.5..0.5 of its width)
 * and y from the neck (0) to the top of the hair (1). Sizes are fractions of the head's width.
 * A regenerated model should only need these numbers tuned.
 */
export const FACE_LAYOUT = {
  eyes: { x: 0.15, y: 0.46, size: 0.07 },
  brows: { y: 0.61, length: 0.11, thickness: 0.02 },
  mouth: { y: 0.215, width: 0.22 },
  cheeks: { x: 0.24, y: 0.31, size: 0.06 },
  glasses: { ring: 1.75, tube: 0.12 },
  colours: {
    skin: '#e59d77',
    brow: '#4a2f22',
    iris: '#5f86a3',
    mouth: '#3b1518',
    tongue: '#c45a62',
    blush: '#ef7f86',
  },
}

/** Animated each frame; neutralExpression() is the resting face. */
export interface Expression {
  /** Where the eyes look, -1..1 on each axis (+y is up). */
  gaze: [number, number]
  /** Upper lids, 0 open to 1 closed (screen-left eye, screen-right eye). */
  lids: [number, number]
  /** Lower lids rising, for a happy squint. */
  squint: number
  /** Pupil size, 1 is normal. */
  pupil: number
  /** Brow raise per side, -1 (lowered) to 1 (raised). */
  brows: [number, number]
  /** Brow tilt per side: positive lifts the inner end (worried), negative drops it (cheeky). */
  browTilt: [number, number]
  /** Mouth corners, -1 (frown) to 1 (big smile). */
  smile: number
  /** Mouth opening, 0..1. */
  open: number
  /** Narrows the mouth into an "oo", 0..1. */
  round: number
  /** Pulls the mouth to one side, -1 (screen-left) to 1 (screen-right). */
  mouthShift: number
  blush: number
  /** Glasses jump up off the nose (up to 1) or slide down it to peer over (down to -1). */
  glassesLift: number
}

export function neutralExpression(): Expression {
  return {
    gaze: [0, 0],
    lids: [0, 0],
    squint: 0,
    pupil: 1,
    brows: [0, 0],
    browTilt: [0, 0],
    smile: 0,
    open: 0,
    round: 0,
    mouthShift: 0,
    blush: 0,
    glassesLift: 0,
  }
}

const UPPER_LID_OPEN = -1.05
const UPPER_LID_CLOSED = 1.62
const LOWER_LID_OPEN = 1.05
const LOWER_LID_SQUINT = 0.25
const MOUTH_COLUMNS = 24
const DEPTH_SAMPLES = 9

interface Surface {
  point: Vector3
  normal: Vector3
}

interface Eye {
  ball: Group
  pupil: Mesh
  upperLid: Group
  lowerLid: Group
}

interface Brow {
  group: Group
  restPosition: Vector3
  restRotation: Quaternion
  /** -1 for the screen-left brow, 1 for the screen-right one, so tilt mirrors. */
  side: number
}

export interface AvatarFeatures {
  root: Group
  update: (expression: Expression) => void
  dispose: () => void
}

const FORWARD = new Vector3(0, 0, 1)

function facing(object: Group | Mesh, normal: Vector3) {
  object.quaternion.copy(new Quaternion().setFromUnitVectors(FORWARD, normal.clone().normalize()))
}

/** A cylinder from a to b (for the glasses' bridge and arms). */
function rod(a: Vector3, b: Vector3, radius: number, material: Material) {
  const length = a.distanceTo(b)
  const mesh = new Mesh(new CylinderGeometry(radius, radius, length, 8), material)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize())
  return mesh
}

function tortoiseshell() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3a2216'
  ctx.fillRect(0, 0, 128, 128)
  const spots = ['#8a5a2b', '#b9803f', '#1f120b', '#6b3f1f']
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = spots[i % spots.length]
    ctx.globalAlpha = 0.35 + Math.random() * 0.5
    ctx.beginPath()
    ctx.ellipse(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 9, 2 + Math.random() * 5, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Builds the face on `head` (the model's Head mesh). Call while the model is detached and
 * untransformed; everything is attached to the head, so it follows its turns and nods.
 */
export function attachFeatures(head: Mesh): AvatarFeatures {
  const L = FACE_LAYOUT
  const geometry = head.geometry
  geometry.computeBoundingBox()
  const box = geometry.boundingBox ?? new Box3()
  const width = box.max.x - box.min.x
  const height = box.max.y - box.min.y
  const centreX = (box.min.x + box.max.x) / 2
  head.updateMatrixWorld(true)

  const raycaster = new Raycaster()
  /** Point and outward normal on the front of the face, in Head-local coordinates. */
  const surface = (fx: number, fy: number): Surface => {
    const local = new Vector3(centreX + fx * width, box.min.y + fy * height, box.max.z + 1)
    raycaster.set(head.localToWorld(local.clone()), new Vector3(0, 0, -1).transformDirection(head.matrixWorld))
    const hit = raycaster.intersectObject(head, false)[0]
    if (!hit) return { point: new Vector3(local.x, local.y, box.max.z), normal: FORWARD.clone() }
    const normal = hit.face?.normal.clone() ?? FORWARD.clone()
    return { point: head.worldToLocal(hit.point.clone()), normal: normal.z < 0.2 ? FORWARD.clone() : normal }
  }

  const root = new Group()
  root.name = 'Face'
  head.add(root)

  const skin = new MeshStandardMaterial({ color: L.colours.skin, roughness: 0.65, side: DoubleSide })
  const lash = new MeshStandardMaterial({ color: L.colours.brow, roughness: 0.6 })
  const white = new MeshPhysicalMaterial({ color: '#f7f4f0', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 })
  const iris = new MeshPhysicalMaterial({ color: L.colours.iris, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 })
  const pupilMaterial = new MeshStandardMaterial({ color: '#0c0d10', roughness: 0.2 })
  const sparkle = new MeshBasicMaterial({ color: '#ffffff' })

  // Eyes, sunk a little into the face so the lids meet the skin.
  const eyeRadius = L.eyes.size * width
  const eyeSurfaces = [surface(-L.eyes.x, L.eyes.y), surface(L.eyes.x, L.eyes.y)]
  const eyes: Eye[] = eyeSurfaces.map(({ point, normal }) => {
    const r = eyeRadius
    const group = new Group()
    group.position.copy(point).addScaledVector(normal, -r * 0.4)
    facing(group, normal.clone().lerp(FORWARD, 0.5))
    group.add(new Mesh(new SphereGeometry(r, 32, 24), white))

    const ball = new Group()
    const irisGeometry = new SphereGeometry(r * 1.004, 32, 10, 0, Math.PI * 2, 0, 0.62)
    irisGeometry.rotateX(Math.PI / 2)
    ball.add(new Mesh(irisGeometry, iris))
    const pupilGeometry = new SphereGeometry(r * 1.008, 24, 6, 0, Math.PI * 2, 0, 0.27)
    pupilGeometry.rotateX(Math.PI / 2)
    const pupil = new Mesh(pupilGeometry, pupilMaterial)
    ball.add(pupil)
    group.add(ball)

    // Catch-light stays put while the iris moves, like a real reflection.
    const glint = new Mesh(new SphereGeometry(r * 0.14, 12, 8), sparkle)
    glint.position.set(r * 0.34, r * 0.4, r * 0.86)
    group.add(glint)

    const upperLid = new Group()
    upperLid.add(new Mesh(new SphereGeometry(r * 1.07, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), skin))
    const lashGeometry = new TorusGeometry(r * 1.07, r * 0.08, 6, 24, Math.PI)
    lashGeometry.rotateX(Math.PI / 2)
    upperLid.add(new Mesh(lashGeometry, lash))
    group.add(upperLid)

    const lowerLid = new Group()
    lowerLid.add(new Mesh(new SphereGeometry(r * 1.06, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), skin))
    group.add(lowerLid)

    root.add(group)
    return { ball, pupil, upperLid, lowerLid }
  })

  // Brows: rounded bars that lift and tilt.
  const browMaterial = new MeshStandardMaterial({ color: L.colours.brow, roughness: 0.7 })
  const brows: Brow[] = [-1, 1].map((side) => {
    const { point, normal } = surface(side * L.eyes.x, L.brows.y)
    const group = new Group()
    group.position.copy(point).addScaledVector(normal, L.brows.thickness * width * 0.4)
    facing(group, normal)
    const bar = new Mesh(new CapsuleGeometry(L.brows.thickness * width, L.brows.length * width, 4, 10), browMaterial)
    bar.rotation.z = Math.PI / 2
    group.add(bar)
    root.add(group)
    return { group, restPosition: group.position.clone(), restRotation: group.quaternion.clone(), side }
  })

  // Mouth: a strip whose outline is rebuilt from smile/open/round each frame, bent to the face.
  const mouthCentre = surface(0, L.mouth.y)
  const mouthWidth = L.mouth.width * width
  const depth = Array.from({ length: DEPTH_SAMPLES }, (_, i) => {
    const t = (i / (DEPTH_SAMPLES - 1)) * 2 - 1
    const hit = surface(((t * mouthWidth) / 2) / width, L.mouth.y)
    return hit.point.clone().sub(mouthCentre.point).dot(mouthCentre.normal)
  })
  const depthAt = (t: number) => {
    const f = ((t + 1) / 2) * (DEPTH_SAMPLES - 1)
    const i = Math.min(DEPTH_SAMPLES - 2, Math.floor(f))
    return depth[i] + (depth[i + 1] - depth[i]) * (f - i)
  }
  const strip = () => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array((MOUTH_COLUMNS + 1) * 2 * 3), 3))
    const index: number[] = []
    for (let i = 0; i < MOUTH_COLUMNS; i++) {
      const a = i * 2
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    g.setIndex(index)
    return g
  }
  const onFace = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }
  const mouthMesh = new Mesh(strip(), new MeshStandardMaterial({ color: L.colours.mouth, roughness: 0.8, side: DoubleSide, ...onFace }))
  const tongueMesh = new Mesh(strip(), new MeshStandardMaterial({ color: L.colours.tongue, roughness: 0.7, side: DoubleSide, ...onFace }))
  const mouth = new Group()
  mouth.position.copy(mouthCentre.point)
  facing(mouth, mouthCentre.normal)
  mouth.add(mouthMesh, tongueMesh)
  root.add(mouth)

  const shapeMouth = (expression: Expression) => {
    const { smile, open, round, mouthShift } = expression
    const shift = mouthShift * mouthWidth * 0.22
    const w = mouthWidth * (1 + 0.12 * Math.max(0, smile) - 0.5 * round)
    const line = mouthWidth * 0.05
    const gapMax = mouthWidth * 0.7
    const mouthPositions = mouthMesh.geometry.getAttribute('position') as BufferAttribute
    const tonguePositions = tongueMesh.geometry.getAttribute('position') as BufferAttribute
    for (let i = 0; i <= MOUTH_COLUMNS; i++) {
      const t = (i / MOUTH_COLUMNS) * 2 - 1
      const taper = round > 0 ? Math.sqrt(Math.max(0, 1 - t * t)) : Math.pow(Math.max(0, 1 - t * t), 0.6)
      const middle = smile * mouthWidth * 0.18 * (t * t - 0.35)
      const gap = Math.max(line, open * gapMax) * taper
      const upper = middle + gap * 0.3
      const lower = middle - gap * 0.7
      const x = (t * w) / 2 + shift
      const z = depthAt(Math.max(-1, Math.min(1, (x * 2) / mouthWidth))) + mouthWidth * 0.02
      mouthPositions.setXYZ(i * 2, x, upper, z)
      mouthPositions.setXYZ(i * 2 + 1, x, lower, z)
      // Tongue fills the bottom of an open mouth.
      const tongueTop = lower + gap * 0.35 * Math.min(1, open * 2)
      const tongueX = (x - shift) * 0.8 + shift
      tonguePositions.setXYZ(i * 2, tongueX, tongueTop, z + mouthWidth * 0.004)
      tonguePositions.setXYZ(i * 2 + 1, tongueX, lower, z + mouthWidth * 0.004)
    }
    mouthPositions.needsUpdate = true
    tonguePositions.needsUpdate = true
    mouthMesh.geometry.computeBoundingSphere()
    tongueMesh.visible = open > 0.15
    tongueMesh.geometry.computeBoundingSphere()
  }

  // Blush patches that fade in.
  const blushMaterial = new MeshBasicMaterial({ color: L.colours.blush, transparent: true, opacity: 0, depthWrite: false, ...onFace })
  for (const side of [-1, 1]) {
    const { point, normal } = surface(side * L.cheeks.x, L.cheeks.y)
    const patch = new Mesh(new CircleGeometry(L.cheeks.size * width, 24), blushMaterial)
    patch.position.copy(point).addScaledVector(normal, width * 0.004)
    facing(patch, normal)
    root.add(patch)
  }

  // Round tortoiseshell glasses in front of the eyes.
  const frame = new MeshPhysicalMaterial({ map: tortoiseshell(), roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 })
  const lens = new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.08, depthWrite: false })
  const glasses = new Group()
  const ringRadius = eyeRadius * L.glasses.ring
  const tube = ringRadius * L.glasses.tube
  const frontZ = Math.max(...eyeSurfaces.map((s) => s.point.z)) + eyeRadius * 0.95
  const rings = eyeSurfaces.map(({ point }) => new Vector3(point.x, point.y, frontZ))
  for (const centre of rings) {
    const ring = new Mesh(new TorusGeometry(ringRadius, tube, 10, 48), frame)
    ring.position.copy(centre)
    glasses.add(ring)
    const glass = new Mesh(new CircleGeometry(ringRadius, 32), lens)
    glass.position.copy(centre).add(new Vector3(0, 0, -tube * 0.5))
    glasses.add(glass)
  }
  const bridgeY = rings[0].y + ringRadius * 0.25
  glasses.add(rod(new Vector3(rings[0].x + ringRadius, bridgeY, frontZ), new Vector3(rings[1].x - ringRadius, bridgeY, frontZ), tube * 0.8, frame))
  // Arms run back along the sides of the head to the ears.
  const sideX = (sign: number) => {
    const y = rings[0].y
    const z = (box.min.z + box.max.z) / 2 + (box.max.z - box.min.z) * 0.15
    raycaster.set(head.localToWorld(new Vector3(centreX + sign * width, y, z)), new Vector3(-sign, 0, 0).transformDirection(head.matrixWorld))
    const hit = raycaster.intersectObject(head, false)[0]
    return { x: hit ? head.worldToLocal(hit.point.clone()).x + sign * tube * 1.5 : centreX + sign * width * 0.5, z }
  }
  for (const [i, sign] of [[0, -1], [1, 1]] as const) {
    const hinge = new Vector3(rings[i].x + sign * ringRadius, rings[i].y, frontZ)
    const ear = sideX(sign)
    const temple = new Vector3(ear.x, rings[i].y, frontZ - tube * 4)
    glasses.add(rod(hinge, temple, tube * 0.7, frame))
    glasses.add(rod(temple, new Vector3(ear.x, rings[i].y - ringRadius * 0.15, ear.z), tube * 0.7, frame))
  }
  root.add(glasses)
  const glassesBase = glasses.position.clone()

  const update = (e: Expression) => {
    eyes.forEach((eye, i) => {
      eye.ball.rotation.set(-e.gaze[1] * 0.35, e.gaze[0] * 0.5, 0)
      eye.pupil.scale.set(e.pupil, e.pupil, 1)
      eye.upperLid.rotation.x = UPPER_LID_OPEN + (UPPER_LID_CLOSED - UPPER_LID_OPEN) * e.lids[i]
      eye.lowerLid.rotation.x = LOWER_LID_OPEN + (LOWER_LID_SQUINT - LOWER_LID_OPEN) * e.squint
    })
    brows.forEach((brow, i) => {
      brow.group.position.copy(brow.restPosition)
      brow.group.quaternion.copy(brow.restRotation)
      brow.group.translateY(e.brows[i] * eyeRadius * 0.55)
      brow.group.rotateZ(-brow.side * e.browTilt[i] * 0.35)
    })
    shapeMouth(e)
    blushMaterial.opacity = e.blush * 0.55
    // Sliding down, the glasses also come forward off the face so the eyes can peer over them.
    const slide = Math.min(0, e.glassesLift)
    glasses.position.copy(glassesBase).add(new Vector3(0, e.glassesLift * eyeRadius * (slide < 0 ? 0.9 : 0.6), -slide * eyeRadius * 0.4))
  }

  update(neutralExpression())

  return {
    root,
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
