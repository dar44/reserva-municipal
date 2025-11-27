import { randomUUID } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const COURSE_IMAGE_BUCKET = 'cursos'
export const COURSE_DEFAULTS_FOLDER = 'defaults'

export type CourseDefaultImage = {
  name: string
  path: string
}

export function isCourseDefaultImage(path?: string | null) {
  if (!path) return false
  return path.startsWith(`${COURSE_DEFAULTS_FOLDER}/`)
}

type RemoveImageParams = {
  supabase: SupabaseClient
  path?: string | null
  bucket?: string | null
}

export async function removeCourseImage({ supabase, path, bucket }: RemoveImageParams) {
  if (!path || !bucket) return
  if (isCourseDefaultImage(path)) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error && (error as { statusCode?: number }).statusCode !== 404) {
    throw new Error(error.message)
  }
}

function buildUploadPath(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '')
  const id = randomUUID()
  return extension ? `uploads/${id}.${extension}` : `uploads/${id}`
}

type ProcessCourseImageInput = {
  supabase: SupabaseClient
  formData: FormData
  currentImage?: string | null
  currentBucket?: string | null
}

type ProcessCourseImageResult = {
  image: string | null
  image_bucket: string | null
  uploadedPath: string | null
  previousImageToRemove: { bucket: string; path: string } | null
  changed: boolean
}

export async function processCourseImageInput({
  supabase,
  formData,
  currentImage = null,
  currentBucket = null,
}: ProcessCourseImageInput): Promise<ProcessCourseImageResult> {
  const rawMode = formData.get('image_mode')
  const mode = typeof rawMode === 'string' ? rawMode : (currentImage ? 'keep' : 'none')

  let image = currentImage ?? null
  let imageBucket = currentBucket ?? null
  let uploadedPath: string | null = null
  let previousImageToRemove: { bucket: string; path: string } | null = null
  let changed = false

  if (mode === 'default') {
    const rawDefault = formData.get('image_default')
    const selected = typeof rawDefault === 'string' ? rawDefault.trim() : ''
    const nextImage = selected || null
    const nextBucket = nextImage ? COURSE_IMAGE_BUCKET : null

    if (nextImage !== currentImage || nextBucket !== currentBucket) {
      changed = true
      if (currentImage && currentBucket && !isCourseDefaultImage(currentImage)) {
        previousImageToRemove = { bucket: currentBucket, path: currentImage }
      }
    }

    image = nextImage
    imageBucket = nextBucket
  } else if (mode === 'upload') {
    const fileEntry = formData.get('image_file')
    if (fileEntry instanceof File && fileEntry.size > 0) {
      const buffer = Buffer.from(await fileEntry.arrayBuffer())
      if (buffer.length > 0) {
        const uploadPath = buildUploadPath(fileEntry.name)
        const { data, error } = await supabase.storage
          .from(COURSE_IMAGE_BUCKET)
          .upload(uploadPath, buffer, {
            cacheControl: '3600',
            contentType: fileEntry.type || 'application/octet-stream',
            upsert: false,
          })
        if (error) throw new Error(error.message)
        if (currentImage && currentBucket && !isCourseDefaultImage(currentImage)) {
          previousImageToRemove = { bucket: currentBucket, path: currentImage }
        }
        image = data?.path ?? uploadPath
        imageBucket = COURSE_IMAGE_BUCKET
        uploadedPath = image
        changed = true
      }
    }
  } else if (mode === 'none') {
    if (currentImage || currentBucket) {
      changed = true
      if (currentImage && currentBucket && !isCourseDefaultImage(currentImage)) {
        previousImageToRemove = { bucket: currentBucket, path: currentImage }
      }
    }
    image = null
    imageBucket = null
  }

  return { image, image_bucket: imageBucket, uploadedPath, previousImageToRemove, changed }
}