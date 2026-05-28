import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const sourceDirectory = path.join(projectRoot, 'public/assets/img/hero')
const outputDirectory = path.join(projectRoot, 'public/assets/img/hero/optimized')
const widths = [960, 1440, 1920]
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const heroImageNames = new Set([
  'hero',
  'hero-haruka',
  '115938338_p0_cut',
  '100941489_p0_cut',
  '110486537_p0',
  '123658183_p0',
  '131020176_p0_cut',
  '142932674_p0'
])

await rm(outputDirectory, { force: true, recursive: true })
await mkdir(outputDirectory, { recursive: true })

const files = (await readdir(sourceDirectory))
  .filter((file) => {
    const basename = path.basename(file, path.extname(file))

    return supportedExtensions.has(path.extname(file).toLowerCase()) && heroImageNames.has(basename)
  })
  .sort()

await Promise.all(
  files.flatMap(async (file) => {
    const inputPath = path.join(sourceDirectory, file)
    const basename = path.basename(file, path.extname(file))
    const metadata = await sharp(inputPath).metadata()
    const sourceWidth = metadata.width ?? widths.at(-1) ?? 1920

    return Promise.all(
      widths.map((width) => {
        const outputWidth = Math.min(width, sourceWidth)
        const outputPath = path.join(outputDirectory, `${basename}-${width}.webp`)

        return sharp(inputPath)
          .resize({ width: outputWidth, withoutEnlargement: true })
          .webp({ effort: 5, quality: 78 })
          .toFile(outputPath)
      })
    )
  })
)

console.log(`Optimized ${files.length} hero images into ${path.relative(projectRoot, outputDirectory)}`)
