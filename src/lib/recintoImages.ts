import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const RECINTO_IMAGE_BUCKET = 'recintos'

export const RECINTO_DEFAULT_IMAGES = [
  { label: 'Campo de fútbol', path: 'defaults/futbol-1.jpg' },
  { label: 'Pista de fútbol sala', path: 'defaults/futbol-sala-1.jpg' },
  { label: 'Pabellón', path: 'defaults/pabellon-1.jpg' },
  { label: 'Gimnasio municipal', path: 'defaults/pabellon-2.jpg' },
  { label: 'Pistas de padel', path: 'defaults/padel-1.jpg' },
  { label: 'Pistas de tenis', path: 'defaults/tenis-1.jpg' },
] as const

export const RECINTO_DEFAULT_IMAGE_PATH = RECINTO_DEFAULT_IMAGES[0]?.path ?? null

export function isDefaultRecintoImage(path?: string | null) {
  if (!path) return false
  return RECINTO_DEFAULT_IMAGES.some(option => option.path === path)
}

export function getRecintoDefaultPublicUrl(client: SupabaseClient): string | null {
  if (!RECINTO_DEFAULT_IMAGE_PATH) return null
  const { data } = client
    .storage
    .from(RECINTO_IMAGE_BUCKET)
    .getPublicUrl(RECINTO_DEFAULT_IMAGE_PATH)
  return data?.publicUrl ?? null
}

export function getRecintoImageUrl(
  client: SupabaseClient,
  image?: string | null,
  bucket?: string | null,
  fallbackUrl?: string | null,
) {
  if (image && /^https?:\/\//i.test(image)) return image
  if (image && image.startsWith('/')) return image
  if (image && bucket) {
    const { data } = client.storage.from(bucket).getPublicUrl(image)
    if (data?.publicUrl) return data.publicUrl
  }
  if (fallbackUrl) return fallbackUrl
  return getRecintoDefaultPublicUrl(client)
}

type ProcessRecintoImageInput = {
  formData: FormData
  supabase: SupabaseClient
  currentImage?: string | null
  currentBucket?: string | null
}

type ProcessRecintoImageResult = {
  image: string | null
  image_bucket: string | null
  changed: boolean
}

export async function removeRecintoImage(
  supabase: SupabaseClient,
  path?: string | null,
  bucket?: string | null,
) {
  if (!path || !bucket) return
  if (isDefaultRecintoImage(path)) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error && (error as { statusCode?: number }).statusCode !== 404) {
    throw new Error(error.message)
  }
}

function buildUploadPath(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '')
  const uuid = randomUUID()
  return extension ? `uploads/${uuid}.${extension}` : `uploads/${uuid}`
}

export async function processRecintoImageInput({
  formData,
  supabase,
  currentImage = null,
  currentBucket = null,
}: ProcessRecintoImageInput): Promise<ProcessRecintoImageResult> {
  const rawMode = formData.get('image_mode')
  const mode = typeof rawMode === 'string' ? rawMode : (currentImage ? 'keep' : 'none')

  let image = currentImage ?? null
  let imageBucket = currentBucket ?? null
  let changed = false

  if (mode === 'default') {
    const rawDefault = formData.get('image_default')
    const selected = typeof rawDefault === 'string' ? rawDefault.trim() : ''
    const nextImage = selected || null
    const nextBucket = nextImage ? RECINTO_IMAGE_BUCKET : null

    if (nextImage !== currentImage || nextBucket !== currentBucket) {
      changed = true
      if (currentImage && currentBucket && !isDefaultRecintoImage(currentImage)) {
        await removeRecintoImage(supabase, currentImage, currentBucket)
      }
    }

    image = nextImage
    imageBucket = nextBucket
  } else if (mode === 'upload') {
    const fileEntry = formData.get('image_file')
    if (fileEntry instanceof File && fileEntry.size > 0) {
      const buffer = Buffer.from(await fileEntry.arrayBuffer())
      if (buffer.length > 0) {
        const path = buildUploadPath(fileEntry.name)
        const { error, data } = await supabase.storage
          .from(RECINTO_IMAGE_BUCKET)
          .upload(path, buffer, {
            contentType: fileEntry.type || 'image/jpeg',
            upsert: true,
          })
        if (error) throw new Error(error.message)
        if (currentImage && currentBucket && !isDefaultRecintoImage(currentImage)) {
          await removeRecintoImage(supabase, currentImage, currentBucket)
        }
        image = data?.path ?? path
        imageBucket = RECINTO_IMAGE_BUCKET
        changed = true
      }
    }
  } else if (mode === 'none') {
    if (currentImage && currentBucket) {
      await removeRecintoImage(supabase, currentImage, currentBucket)
      changed = true
    }
    image = null
    imageBucket = null
  }

  return { image, image_bucket: imageBucket, changed }
}