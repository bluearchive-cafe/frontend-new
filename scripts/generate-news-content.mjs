import path from 'node:path'

import { generateNewsModule } from './news-content.mjs'

const includeDrafts = process.argv.includes('--include-drafts')
const result = await generateNewsModule({ includeDrafts })
const modeLabel = includeDrafts ? 'development' : 'production'

console.log(`Generated ${result.articles.length} news articles for ${modeLabel} mode in ${path.relative(process.cwd(), 'src/content/news.generated.ts')}.`)
