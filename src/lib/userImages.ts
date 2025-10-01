import { Buffer } from 'node:buffer'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  USER_STORAGE_BUCKET,
  buildUserProfilePath,
  isUserProfileObject
} from '@/lib/storage'

export type UserImageMode = 'keep' | 'default' | 'upload' | 'none'

type ProcessUserImageInputOptions = {
  formData: FormData
  supabase: SupabaseClient
  userUid: string
  currentImage?: string | null
  currentBucket?: string | null
}

type ProcessUserImageInputResult = {
  image: string | null
  image_bucket: string | null
  changed: boolean
}

function parseMode(rawMode: FormDataEntryValue | null, hasExisting: boolean): UserImageMode {
  const value = typeof rawMode === 'string' ? rawMode : null
  if (value === 'keep' || value === 'default' || value === 'upload' || value === 'none') {
    return value
  }
  return hasExisting ? 'keep' : 'none'
}

export async function processUserImageInput ({
  formData,
  supabase,
  userUid,
  currentImage = null,
  currentBucket = null
}: ProcessUserImageInputOptions): Promise<ProcessUserImageInputResult> {
  const hasExisting = Boolean(currentImage && currentBucket)
  const mode = parseMode(formData.get('image_mode'), hasExisting)

  let nextImage = currentImage ?? null
  let nextBucket = currentBucket ?? null
  let changed = false
  let removePrevious = false

  if (mode === 'default') {
    const rawDefault = formData.get('image_default')
    const selected = typeof rawDefault === 'string' ? rawDefault.trim() : ''

    nextImage = selected || null
    nextBucket = selected ? USER_STORAGE_BUCKET : null

    if (nextImage !== currentImage || nextBucket !== currentBucket) {
      changed = true
      if (
        currentImage &&
        currentBucket &&
        isUserProfileObject(currentImage, userUid)
      ) {
        removePrevious = true
      }
    }
  } else if (mode === 'upload') {
    const fileEntry = formData.get('image_file')
    if (fileEntry instanceof File && fileEntry.size > 0) {
      const arrayBuffer = await fileEntry.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (buffer.length > 0) {
        const uploadPath = buildUserProfilePath(userUid, fileEntry.name)
        const { data, error } = await supabase.storage
          .from(USER_STORAGE_BUCKET)
          .upload(uploadPath, buffer, {
            cacheControl: '3600',
            contentType: fileEntry.type || 'image/jpeg',
            upsert: true
          })

        if (error) {
          throw new Error(error.message)
        }

        nextImage = data?.path ?? uploadPath
        nextBucket = USER_STORAGE_BUCKET
        changed = true

        if (
          currentImage &&
          currentBucket &&
          isUserProfileObject(currentImage, userUid)
        ) {
          removePrevious = true
        }
      }
    }
  } else if (mode === 'none') {
    nextImage = null
    nextBucket = null
    if (currentImage || currentBucket) {
      changed = true
      if (
        currentImage &&
        currentBucket &&
        isUserProfileObject(currentImage, userUid)
      ) {
        removePrevious = true
      }
    }
  }

  if (
    removePrevious &&
    currentImage &&
    currentBucket &&
    (currentImage !== nextImage || currentBucket !== nextBucket)
  ) {
    await supabase.storage
      .from(currentBucket)
      .remove([currentImage])
      .catch(() => {})
  }

  return {
    image: nextImage,
    image_bucket: nextBucket,
    changed
  }
}