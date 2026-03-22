import { supabase } from './supabase'

const BUCKET = 'item-photos'
const EXPIRY = 3600

export async function getSignedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, EXPIRY)
  return data?.signedUrl ?? null
}

export async function getSignedUrls(paths: string[]): Promise<Map<string, string | null>> {
  const entries = await Promise.all(
    paths.map(async (path) => [path, await getSignedUrl(path)] as [string, string | null])
  )
  return new Map(entries)
}

export function resizeImage(dataUrl: string, maxPx = 1280, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob feilet')),
        'image/webp',
        quality
      )
    }
    img.onerror = reject
    img.src = dataUrl
  })
}
