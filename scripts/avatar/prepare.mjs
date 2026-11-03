#!/usr/bin/env node
// Turns a Meshy image-to-3D bust into the homepage avatar model.
//
// Usage:
//   npm run avatar:prepare -- ~/Downloads/meshy-export.glb [--out public/models/dan-avatar.glb] [--neck 0.12]
//
// - Drops stray pieces (bits under 2% of the triangles, and flat backdrop plates).
// - Splits the bust at the neck into `Head` and `Body` nodes, with the head's pivot at the
//   neck so it can turn and nod. `--neck` overrides the detected neck height (model units).
// - Resizes the texture to 1024px JPEG.
// - Prints the head's bounds and skin colour, for the face settings in
//   src/components/content/featured/avatarFeatures.ts.

import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { GlbBuilder, readAccessor, readBufferView, readGlb } from './glb.mjs'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { out: { type: 'string', default: 'public/models/dan-avatar.glb' }, neck: { type: 'string' } },
})
if (!positionals[0]) {
  console.error('Usage: npm run avatar:prepare -- <meshy-export.glb> [--out path] [--neck y]')
  process.exit(1)
}

const glb = readGlb(resolve(positionals[0]))
const primitives = glb.json.meshes.flatMap((m) => m.primitives)
if (primitives.length !== 1) throw new Error(`Expected one mesh primitive, found ${primitives.length}`)
const prim = primitives[0]
const P = readAccessor(glb, prim.attributes.POSITION)
const N = prim.attributes.NORMAL !== undefined ? readAccessor(glb, prim.attributes.NORMAL) : null
const UV = readAccessor(glb, prim.attributes.TEXCOORD_0)
const I = prim.indices !== undefined ? readAccessor(glb, prim.indices) : Uint32Array.from({ length: P.length / 3 }, (_, i) => i)
const vertexCount = P.length / 3

// Connected pieces, welding vertices that share a position (Meshy splits them at UV seams).
const ids = new Int32Array(vertexCount)
const weld = new Map()
for (let i = 0; i < vertexCount; i++) {
  const key = `${Math.round(P[i * 3] * 1e4)},${Math.round(P[i * 3 + 1] * 1e4)},${Math.round(P[i * 3 + 2] * 1e4)}`
  if (!weld.has(key)) weld.set(key, weld.size)
  ids[i] = weld.get(key)
}
const parent = Int32Array.from({ length: weld.size }, (_, i) => i)
const find = (x) => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]]
  return x
}
for (let t = 0; t < I.length; t += 3) {
  const a = find(ids[I[t]])
  parent[find(ids[I[t + 1]])] = a
  parent[find(ids[I[t + 2]])] = a
}
const pieces = new Map()
for (let t = 0; t < I.length; t += 3) {
  const root = find(ids[I[t]])
  if (!pieces.has(root)) pieces.set(root, [])
  pieces.get(root).push(t)
}

function bounds(triangleStarts) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const t of triangleStarts)
    for (let v = 0; v < 3; v++)
      for (let k = 0; k < 3; k++) {
        const x = P[I[t + v] * 3 + k]
        if (x < min[k]) min[k] = x
        if (x > max[k]) max[k] = x
      }
  return { min, max, size: max.map((x, k) => x - min[k]) }
}

const all = bounds([...pieces.values()].flat())
const totalTriangles = I.length / 3
const kept = []
for (const tris of pieces.values()) {
  const b = bounds(tris)
  const tooSmall = tris.length < totalTriangles * 0.02
  const plate = b.size[2] < b.size[0] * 0.08 && b.size[0] > all.size[0] * 0.5
  if (tooSmall || plate) continue
  kept.push(...tris)
}
console.log(`pieces ${pieces.size}, kept ${kept.length} of ${totalTriangles} triangles`)

// Neck: the slice with the smallest cross-section (width x depth) between 15% and 60% of the
// height. Width alone can land under the jaw, leaving the chin on the body when the head nods.
const keptBounds = bounds(kept)
let neckY = values.neck !== undefined ? Number(values.neck) : undefined
if (neckY === undefined) {
  const slices = 60
  const extents = Array.from({ length: slices }, () => [Infinity, -Infinity, Infinity, -Infinity])
  for (const t of kept)
    for (let v = 0; v < 3; v++) {
      const i = I[t + v]
      const s = Math.min(slices - 1, Math.floor(((P[i * 3 + 1] - keptBounds.min[1]) / keptBounds.size[1]) * slices))
      extents[s][0] = Math.min(extents[s][0], P[i * 3])
      extents[s][1] = Math.max(extents[s][1], P[i * 3])
      extents[s][2] = Math.min(extents[s][2], P[i * 3 + 2])
      extents[s][3] = Math.max(extents[s][3], P[i * 3 + 2])
    }
  let best = Infinity
  for (let s = Math.floor(slices * 0.15); s < Math.ceil(slices * 0.6); s++) {
    const area = (extents[s][1] - extents[s][0]) * (extents[s][3] - extents[s][2])
    if (area < best) {
      best = area
      neckY = keptBounds.min[1] + ((s + 0.5) / slices) * keptBounds.size[1]
    }
  }
}

const head = [], body = []
for (const t of kept) {
  const cy = (P[I[t] * 3 + 1] + P[I[t + 1] * 3 + 1] + P[I[t + 2] * 3 + 1]) / 3
  ;(cy >= neckY ? head : body).push(t)
}
const headBounds = bounds(head)
const bodyBounds = body.length ? bounds(body) : null
// Pivot on the neck's own centre (not the head's, which the chin pushes forward), so turning
// the head keeps the neck inside the collar.
const neckBand = { min: [Infinity, 0, Infinity], max: [-Infinity, 0, -Infinity] }
for (const t of kept)
  for (let v = 0; v < 3; v++) {
    const i = I[t + v]
    if (Math.abs(P[i * 3 + 1] - neckY) > keptBounds.size[1] * 0.015) continue
    for (const k of [0, 2]) {
      neckBand.min[k] = Math.min(neckBand.min[k], P[i * 3 + k])
      neckBand.max[k] = Math.max(neckBand.max[k], P[i * 3 + k])
    }
  }
const headPivot = Number.isFinite(neckBand.min[0])
  ? [(neckBand.min[0] + neckBand.max[0]) / 2, neckY, (neckBand.min[2] + neckBand.max[2]) / 2]
  : [(headBounds.min[0] + headBounds.max[0]) / 2, neckY, (headBounds.min[2] + headBounds.max[2]) / 2]
const bodyPivot = bodyBounds ? [(bodyBounds.min[0] + bodyBounds.max[0]) / 2, bodyBounds.min[1], (bodyBounds.min[2] + bodyBounds.max[2]) / 2] : null

const out = new GlbBuilder()
function buildMesh(name, triangleStarts, pivot) {
  const remap = new Map()
  const pos = [], nor = [], uv = [], idx = []
  for (const t of triangleStarts)
    for (let v = 0; v < 3; v++) {
      const i = I[t + v]
      if (!remap.has(i)) {
        remap.set(i, remap.size)
        for (let k = 0; k < 3; k++) pos.push(P[i * 3 + k] - pivot[k])
        if (N) for (let k = 0; k < 3; k++) nor.push(N[i * 3 + k])
        uv.push(UV[i * 2], UV[i * 2 + 1])
      }
      idx.push(remap.get(i))
    }
  const positions = new Float32Array(pos)
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i + k])
      max[k] = Math.max(max[k], positions[i + k])
    }
  const attributes = {
    POSITION: out.addAccessor(positions, 'VEC3', { target: 34962, minmax: { min, max } }),
    TEXCOORD_0: out.addAccessor(new Float32Array(uv), 'VEC2', { target: 34962 }),
    ...(N ? { NORMAL: out.addAccessor(new Float32Array(nor), 'VEC3', { target: 34962 }) } : {}),
  }
  return { name, primitives: [{ attributes, indices: out.addAccessor(new Uint32Array(idx), 'SCALAR', { target: 34963 }), material: 0 }] }
}

const meshes = [buildMesh('Head', head, headPivot)]
const nodes = [{ name: 'Avatar', children: [1] }, { name: 'Head', mesh: 0, translation: headPivot }]
if (bodyPivot) {
  meshes.push(buildMesh('Body', body, bodyPivot))
  nodes.push({ name: 'Body', mesh: 1, translation: bodyPivot })
  nodes[0].children.push(2)
}

const image = glb.json.images[0]
const texture = await sharp(readBufferView(glb, image.bufferView))
  .resize(1024, 1024, { fit: 'inside' })
  .jpeg({ quality: 85, mozjpeg: true })
  .toBuffer()

// Skin colour: texel under the front-most head vertex at mid-face height.
const { data, info } = await sharp(texture).raw().toBuffer({ resolveWithObject: true })
let skinVertex = -1, frontMost = -Infinity
const faceY = headBounds.min[1] + headBounds.size[1] * 0.35
for (const t of head)
  for (let v = 0; v < 3; v++) {
    const i = I[t + v]
    if (Math.abs(P[i * 3] - headPivot[0]) < headBounds.size[0] * 0.15 && Math.abs(P[i * 3 + 1] - faceY) < headBounds.size[1] * 0.05 && P[i * 3 + 2] > frontMost) {
      frontMost = P[i * 3 + 2]
      skinVertex = i
    }
  }
const texel = (u, v) => {
  const x = Math.min(info.width - 1, Math.floor(u * info.width)), y = Math.min(info.height - 1, Math.floor(v * info.height))
  const o = (y * info.width + x) * info.channels
  return [data[o], data[o + 1], data[o + 2]]
}
const skin = skinVertex >= 0 ? texel(UV[skinVertex * 2], UV[skinVertex * 2 + 1]) : null

const bytes = out.write(resolve(values.out), {
  asset: { version: '2.0', generator: 'scripts/avatar/prepare.mjs' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes,
  meshes,
  // Base colour only: Meshy's optional PBR maps aren't carried over.
  materials: [{ name: 'Avatar', pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.75 }, doubleSided: true }],
  textures: [{ sampler: 0, source: 0 }],
  samplers: glb.json.samplers?.length ? glb.json.samplers.slice(0, 1) : [{}],
  images: [{ bufferView: out.addView(texture), mimeType: 'image/jpeg' }],
})

const round = (a) => a.map((x) => +x.toFixed(3))
console.log(`neck y ${neckY.toFixed(3)}, pivot ${headPivot.map((x) => x.toFixed(3))}; head ${head.length} triangles, body ${body.length}`)
console.log(`head bounds (Head-local) min ${round(headBounds.min.map((x, k) => x - headPivot[k]))} max ${round(headBounds.max.map((x, k) => x - headPivot[k]))}`)
if (skin) console.log(`skin colour #${skin.map((c) => c.toString(16).padStart(2, '0')).join('')}`)
console.log(`wrote ${values.out} (${(bytes / 1e6).toFixed(2)} MB)`)
