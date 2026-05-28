import { readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distHeroDirectory = path.join(projectRoot, 'dist/assets/img/hero')
const originalExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

let removedCount = 0

try {
  const entries = await readdir(distHeroDirectory, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isFile() || !originalExtensions.has(path.extname(entry.name).toLowerCase())) {
        return
      }

      await rm(path.join(distHeroDirectory, entry.name))
      removedCount += 1
    })
  )
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error
  }
}

console.log(`Pruned ${removedCount} original hero images from dist`)
