#!/usr/bin/env node
// Uploads one illustration per section of the "How I built this site" post
// and inserts each image block directly after its section heading.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/illustrate-how-i-built-this-site.mjs [--dry-run]
//
// The token needs Editor (write) access to project 5fq3rcf6. A dry run works
// without a token but can only see the published post. Re-running is safe:
// sections that already have their image block are skipped.

import { createClient } from '@sanity/client'
import { createReadStream, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const POST_ID = '2f6d688c-c5d4-41f5-bbec-9330082b7b36'
const IMAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), 'illustrations', 'how-i-built-this-site')

const SECTIONS = [
  {
    headingKey: 'b04',
    file: '01-start-with-the-right-foundations.jpg',
    alt: 'Illustration of stacked grey blocks on a grid, with a small block lifted above the solid base, representing a static foundation with a light interactive layer on top.',
  },
  {
    headingKey: 'b10',
    file: '02-keep-the-experience-focused.jpg',
    alt: 'Illustration of a short row of five navigation tabs, one highlighted, above a single softly lit content panel.',
  },
  {
    headingKey: 'b16',
    file: '03-separate-content-from-code.jpg',
    alt: 'Illustration of a stack of content cards connected by a dashed line to a webpage layout, showing content flowing into a template.',
  },
  {
    headingKey: 'b23',
    file: '04-use-ai-to-accelerate-not-decide.jpg',
    alt: 'Illustration of a geometric spark proposing several dashed paths, while a hand places a block on the one it chooses.',
  },
  {
    headingKey: 'b29',
    file: '05-make-shipping-predictable.jpg',
    alt: 'Illustration of boxes moving along a conveyor through a checkpoint gate and ending in a neat stack of finished pages.',
  },
  {
    headingKey: 'b35',
    file: '06-what-i-learned.jpg',
    alt: 'Illustration of the same stacked foundation with outlined new blocks being added and a small plant sprouting, suggesting a system that keeps evolving.',
  },
]

const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_WRITE_TOKEN

if (!token && !dryRun) {
  console.error('Set SANITY_WRITE_TOKEN to a Sanity token with write access.')
  process.exit(1)
}

const client = createClient({
  projectId: '5fq3rcf6',
  dataset: 'production',
  apiVersion: '2024-03-19',
  token,
  useCdn: false,
})

const imageKey = (headingKey) => `illustration-${headingKey}`

async function illustrate(docId) {
  const doc = await client.getDocument(docId)
  if (!doc) return false

  const backupPath = join(tmpdir(), `backup-${docId}-${doc._rev}.json`)
  writeFileSync(backupPath, JSON.stringify(doc, null, 2))
  console.log(`${docId}: backed up to ${backupPath}`)

  const keys = new Set((doc.body ?? []).map((block) => block._key))
  let tx = client.transaction()
  let changes = 0

  for (const section of SECTIONS) {
    if (!keys.has(section.headingKey)) {
      console.warn(`${docId}: heading ${section.headingKey} not found, skipping ${section.file}`)
      continue
    }
    if (keys.has(imageKey(section.headingKey))) {
      console.log(`${docId}: ${section.file} already in place`)
      continue
    }

    let assetId = `image-dry-run-${section.headingKey}`
    if (!dryRun) {
      const asset = await client.assets.upload('image', createReadStream(join(IMAGE_DIR, section.file)), {
        filename: basename(section.file),
      })
      assetId = asset._id
    }

    const guard = changes === 0
    tx = tx.patch(docId, (patch) =>
      (guard ? patch.ifRevisionId(doc._rev) : patch).insert('after', `body[_key=="${section.headingKey}"]`, [
        {
          _type: 'image',
          _key: imageKey(section.headingKey),
          asset: { _type: 'reference', _ref: assetId },
          alt: section.alt,
        },
      ])
    )
    changes++
  }

  if (changes === 0) return true

  if (dryRun) {
    console.log(`${docId}: would insert ${changes} image(s)`)
    console.log(JSON.stringify(tx.serialize(), null, 2))
  } else {
    await tx.commit()
    console.log(`${docId}: inserted ${changes} image(s)`)
  }
  return true
}

// Patch the published post, and any open draft too so publishing it later
// doesn't drop the images.
const published = await illustrate(POST_ID)
if (!published) {
  console.error(`Post ${POST_ID} not found.`)
  process.exit(1)
}
await illustrate(`drafts.${POST_ID}`)

if (!dryRun) {
  console.log('Done. Trigger a Netlify build so the static site picks up the change.')
}
