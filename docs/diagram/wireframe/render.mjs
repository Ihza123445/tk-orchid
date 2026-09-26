// Render setiap wireframe di wireframe.html menjadi docs/diagram/png/ui-*.png.
// Jalankan: node docs/diagram/wireframe/render.mjs  (butuh paket playwright)
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const dir = path.dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 2 })
await page.goto('file://' + path.join(dir, 'wireframe.html'))
const ids = await page.$$eval('section.wf', (els) => els.map((el) => el.id))
for (const id of ids) {
  await page.locator(`#${id}`).screenshot({ path: path.join(dir, '..', 'png', `${id}.png`) })
  console.log('ok', id)
}
await browser.close()
