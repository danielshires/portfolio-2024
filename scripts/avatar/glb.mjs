// Minimal binary glTF (.glb) read/write helpers for the avatar scripts.
import { readFileSync, writeFileSync } from 'node:fs'

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
const TYPED = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }

export function readGlb(path) {
  const b = readFileSync(path)
  if (b.toString('utf8', 0, 4) !== 'glTF') throw new Error(`${path} is not a .glb file`)
  const jsonLength = b.readUInt32LE(12)
  const json = JSON.parse(b.subarray(20, 20 + jsonLength).toString())
  const binLength = b.readUInt32LE(20 + jsonLength)
  const binStart = 20 + jsonLength + 8
  return { json, bin: b.subarray(binStart, binStart + binLength) }
}

/** Copies an accessor's data out as a typed array (assumes tightly packed buffer views). */
export function readAccessor(glb, index) {
  const accessor = glb.json.accessors[index]
  const view = glb.json.bufferViews[accessor.bufferView]
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0)
  const Typed = TYPED[accessor.componentType]
  const length = accessor.count * COMPONENTS[accessor.type]
  const bytes = glb.bin.subarray(start, start + length * Typed.BYTES_PER_ELEMENT)
  return new Typed(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
}

export function readBufferView(glb, index) {
  const view = glb.json.bufferViews[index]
  return glb.bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength)
}

/** Collects binary chunks with 4-byte alignment and records their buffer views and accessors. */
export class GlbBuilder {
  chunks = []
  offset = 0
  bufferViews = []
  accessors = []

  addView(buffer, target) {
    this.bufferViews.push({ buffer: 0, byteOffset: this.offset, byteLength: buffer.length, ...(target ? { target } : {}) })
    const pad = (4 - (buffer.length % 4)) % 4
    this.chunks.push(buffer, Buffer.alloc(pad))
    this.offset += buffer.length + pad
    return this.bufferViews.length - 1
  }

  addAccessor(typed, type, { target, minmax } = {}) {
    const componentType = { Float32Array: 5126, Uint32Array: 5125 }[typed.constructor.name]
    const view = this.addView(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength), target)
    this.accessors.push({ bufferView: view, componentType, count: typed.length / COMPONENTS[type], type, ...(minmax || {}) })
    return this.accessors.length - 1
  }

  write(path, json) {
    const bin = Buffer.concat(this.chunks)
    const doc = { ...json, accessors: this.accessors, bufferViews: this.bufferViews, buffers: [{ byteLength: bin.length }] }
    let jsonBuffer = Buffer.from(JSON.stringify(doc))
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc((4 - (jsonBuffer.length % 4)) % 4, 0x20)])
    const header = Buffer.alloc(12)
    header.write('glTF', 0)
    header.writeUInt32LE(2, 4)
    header.writeUInt32LE(12 + 8 + jsonBuffer.length + 8 + bin.length, 8)
    const jsonHeader = Buffer.alloc(8)
    jsonHeader.writeUInt32LE(jsonBuffer.length, 0)
    jsonHeader.write('JSON', 4)
    const binHeader = Buffer.alloc(8)
    binHeader.writeUInt32LE(bin.length, 0)
    binHeader.write('BIN\0', 4)
    const out = Buffer.concat([header, jsonHeader, jsonBuffer, binHeader, bin])
    writeFileSync(path, out)
    return out.length
  }
}
