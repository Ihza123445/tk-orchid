import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { MEDIA_TYPES, UPLOAD_ROOT } from '@/lib/cms/uploads'

// Menyajikan foto yang diunggah dari admin (storage/uploads).
export async function GET(_request: Request, ctx: RouteContext<'/media/[...path]'>) {
  const { path: segments } = await ctx.params
  const target = path.resolve(UPLOAD_ROOT, ...segments)
  const type = MEDIA_TYPES[path.extname(target).slice(1).toLowerCase()]
  if (!type || !target.startsWith(UPLOAD_ROOT + path.sep)) return new Response('Not found', { status: 404 })

  try {
    const file = await readFile(target)
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': type,
        // Nama file unik per unggahan, aman di-cache lama
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
