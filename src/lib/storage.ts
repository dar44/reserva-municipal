import type { SupabaseClient } from '@supabase/supabase-js'

type GenericSupabaseClient = SupabaseClient

export type StorageImageFields = {
  image: string | null
  image_bucket: string | null
}

export function getPublicStorageUrl(
  supabase: GenericSupabaseClient,
  imagePath: string | null | undefined,
  bucket: string | null | undefined,
): string | null {
  if (!imagePath || !bucket) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(imagePath)
  return data?.publicUrl ?? null
}

export function getPublicUrlFromStorage(
  supabase: GenericSupabaseClient,
  fields: StorageImageFields,
): string | null {
  return getPublicStorageUrl(supabase, fields.image, fields.image_bucket)
}


export const USER_STORAGE_BUCKET = 'usuarios'
export const USER_PROFILE_FOLDER = 'perfiles'
export const USER_DEFAULTS_FOLDER = 'defaults'

function getRandomId () {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function buildUserProfilePath (uid: string, fileName: string) {
  const sanitizedName = fileName
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  const extension = fileName.includes('.')
    ? `.${fileName.split('.').pop()!.toLowerCase()}`
    : ''

  const randomId = getRandomId()

  const baseName = sanitizedName ? `${sanitizedName}-${randomId}` : randomId

  return `${USER_PROFILE_FOLDER}/${uid}/${baseName}${extension}`
}

export function isUserProfileObject (path: string | null | undefined, uid: string) {
  if (!path) return false
  return path.startsWith(`${USER_PROFILE_FOLDER}/${uid}/`)
}

export type StorageClient = SupabaseClient

export async function buildStorageUrl (
  client: StorageClient,
  bucket?: string | null,
  path?: string | null,
  expiresIn = 60 * 60
): Promise<string | null> {
  if (!bucket || !path) return null

  const { data, error } = await client
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (!error && data?.signedUrl) {
    return data.signedUrl
  }

  const { data: publicData } = client
    .storage
    .from(bucket)
    .getPublicUrl(path)

  if (publicData?.publicUrl) return publicData.publicUrl

  return null
}

export type StorageObject = {
  name: string
  path: string
}

export async function listBucketPrefix (
  client: StorageClient,
  bucket: string,
  prefix: string
): Promise<StorageObject[]> {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 100 })
  if (error || !data) return []

  return data
    .filter(item => Boolean(item.name) && item.metadata?.size !== undefined)
    .map(item => ({
      name: item.name!,
      path: `${prefix.replace(/\/$/, '')}/${item.name}`
    }))
}