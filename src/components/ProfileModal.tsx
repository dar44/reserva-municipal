'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/Toast'
import {
  USER_DEFAULTS_FOLDER,
  USER_STORAGE_BUCKET,
  buildStorageUrl,
  buildUserProfilePath,
  isUserProfileObject,
  listBucketPrefix,
  type StorageObject
} from '@/lib/storage'

interface Props {
  onClose: () => void
  onUpdated: (name: string) => void
}

interface ProfileData {
  name: string
  surname: string
  dni: string
  phone: string
  image: string | null
  image_bucket: string | null
}

type EditableField = 'name' | 'surname' | 'dni' | 'phone'

const fieldLabels: Record<EditableField, string> = {
  name: 'Nombre',
  surname: 'Apellido',
  dni: 'DNI',
  phone: 'Teléfono'
}

const editableFields: EditableField[] = ['name', 'surname', 'dni', 'phone']

export default function ProfileModal ({ onClose, onUpdated }: Props) {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    surname: '',
    dni: '',
    phone: '',
    image: null,
    image_bucket: null
  })
  const [editing, setEditing] = useState(false)
  const [fieldEditing, setFieldEditing] = useState<EditableField | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageEditing, setImageEditing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageDefault, setImageDefault] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [defaultImages, setDefaultImages] = useState<StorageObject[]>([])
  const toast = useToast()

  const loadProfile = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const userUid = user?.id
    if (!userUid) return

    const { data } = await supabase
      .from('users')
      .select('name,surname,dni,phone,image,image_bucket')
      .eq('uid', userUid)
      .single()

    if (data) {
      const nextProfile: ProfileData = {
        name: data.name ?? '',
        surname: data.surname ?? '',
        dni: data.dni ?? '',
        phone: data.phone ?? '',
        image: data.image ?? null,
        image_bucket: data.image_bucket ?? null
      }
      setProfile(nextProfile)
      const url = await buildStorageUrl(
        supabase,
        nextProfile.image_bucket,
        nextProfile.image
      )
      setImageUrl(url)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    let active = true
    const loadDefaults = async () => {
      const defaults = await listBucketPrefix(
        supabase,
        USER_STORAGE_BUCKET,
        USER_DEFAULTS_FOLDER
      )
      if (active) setDefaultImages(defaults)
    }
    loadDefaults()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile)
      setImagePreviewUrl(objectUrl)
      return () => {
        cancelled = true
        URL.revokeObjectURL(objectUrl)
      }
    }

    if (imageDefault) {
      (async () => {
        const url = await buildStorageUrl(
          supabase,
          USER_STORAGE_BUCKET,
          imageDefault
        )
        if (!cancelled) setImagePreviewUrl(url)
      })()
    } else {
      setImagePreviewUrl(null)
    }

    return () => {
      cancelled = true
    }
  }, [imageFile, imageDefault])

  const startEdit = (field: EditableField) => {
    setFieldEditing(field)
    setTempValue(profile[field])
  }

  const cancelFieldEdit = () => {
    setFieldEditing(null)
    setTempValue('')
  }

  const saveField = async (field: EditableField) => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const userUid = user?.id
    if (!userUid) return

    const value = tempValue.trim()

    const { error: authError } = await supabase.auth.updateUser({
      data: { [field]: value }
    })
    if (authError) {
      toast({ type: 'error', message: 'No se pudo actualizar' })
      return
    }
    const { error } = await supabase
      .from('users')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('uid', userUid)

    if (!error) {
      setProfile(prev => ({ ...prev, [field]: value }))
      if (field === 'name') onUpdated(value)
      cancelFieldEdit()
    } else {
      toast({ type: 'error', message: 'No se pudo actualizar' })
    }
  }

  const cancelImageEdit = () => {
    setImageEditing(false)
    setImageFile(null)
    setImageDefault('')
    setImagePreviewUrl(null)
  }

  const saveImage = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const userUid = user?.id
    if (!userUid) return

    let newImagePath: string | null = profile.image
    let newBucket: string | null = profile.image_bucket

    if (imageFile && imageFile.size > 0) {
      const uploadPath = buildUserProfilePath(userUid, imageFile.name)
      const { error: uploadError } = await supabase.storage
        .from(USER_STORAGE_BUCKET)
        .upload(uploadPath, imageFile, {
          cacheControl: '3600',
          upsert: true
        })
      if (uploadError) {
        toast({ type: 'error', message: 'No se pudo subir la imagen' })
        return
      }
      newImagePath = uploadPath
      newBucket = USER_STORAGE_BUCKET
    } else if (imageDefault) {
      newImagePath = imageDefault
      newBucket = USER_STORAGE_BUCKET
    } else {
      newImagePath = null
      newBucket = null
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        image: newImagePath,
        image_bucket: newBucket
      }
    })
    if (authError) {
      toast({ type: 'error', message: 'No se pudo actualizar' })
      return
    }

    const { error } = await supabase
      .from('users')
      .update({
        image: newImagePath,
        image_bucket: newBucket,
        updated_at: new Date().toISOString()
      })
      .eq('uid', userUid)

    if (error) {
      toast({ type: 'error', message: 'No se pudo actualizar' })
      return
    }

    if (
      profile.image &&
      profile.image_bucket === USER_STORAGE_BUCKET &&
      newImagePath !== profile.image &&
      isUserProfileObject(profile.image, userUid)
    ) {
      await supabase.storage
        .from(profile.image_bucket)
        .remove([profile.image])
        .catch(() => {})
    }

    const newUrl = await buildStorageUrl(supabase, newBucket, newImagePath)

    setProfile(prev => ({
      ...prev,
      image: newImagePath,
      image_bucket: newBucket
    }))
    setImageUrl(newUrl)
    cancelImageEdit()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white text-gray-900 p-6 rounded w-80 max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-semibold">Perfil</h2>
        {editableFields.map(field => {
          const label = fieldLabels[field]
          const value = profile[field]
          return (
            <div key={field} className="text-sm">
              {editing && fieldEditing === field ? (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="w-20 capitalize">{label}</span>
                  <input
                    className="border p-1 flex-1 rounded"
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                  />
                  <button
                    onClick={() => saveField(field)}
                    className="px-2 bg-blue-600 text-white rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelFieldEdit}
                    className="px-2 rounded border"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="capitalize w-20">{label}</span>
                  <div className="flex-1 text-right mr-2">{value || 'Sin Valor'}</div>
                  {editing && (
                    <button
                      onClick={() => startEdit(field)}
                      className="text-blue-600 text-xs"
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between mt-1">
            <span className="capitalize w-20">Imagen</span>
            <div className="flex-1 text-right mr-2">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Imagen de perfil"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover ml-auto"
                />
              ) : (
                <span>No hay imagen</span>
              )}
            </div>
            {editing && !imageEditing && (
              <button
                onClick={() => {
                  setImageEditing(true)
                  if (
                    profile.image_bucket === USER_STORAGE_BUCKET &&
                    typeof profile.image === 'string' &&
                    profile.image.startsWith(`${USER_DEFAULTS_FOLDER}/`)
                  ) {
                    setImageDefault(profile.image)
                  } else {
                    setImageDefault('')
                  }
                  setImageFile(null)
                  setImagePreviewUrl(null)
                }}
                className="text-blue-600 text-xs"
              >
                Editar
              </button>
            )}
          </div>

          {editing && imageEditing && (
            <div className="space-y-2 border rounded p-2 bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={event => {
                  const file = event.target.files?.[0] ?? null
                  setImageFile(file)
                  if (file) {
                    setImageDefault('')
                  }
                }}
                className="w-full text-xs"
              />
              <select
                value={imageDefault}
                onChange={event => {
                  setImageDefault(event.target.value)
                  if (event.target.value) {
                    setImageFile(null)
                  }
                }}
                className="w-full border rounded p-1 text-xs"
              >
                <option value="">Sin cambio / Ninguna</option>
                {defaultImages.map(option => (
                  <option key={option.path} value={option.path}>
                    {option.name}
                  </option>
                ))}
              </select>
              {imagePreviewUrl && (
                <div className="flex justify-center">
                  <Image
                    src={imagePreviewUrl}
                    alt="Vista previa"
                    width={60}
                    height={60}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 break-all">
                Actual: {profile.image_bucket ? `${profile.image_bucket}/${profile.image ?? ''}` : 'Sin imagen'}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={saveImage}
                  className="px-2 bg-blue-600 text-white rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={cancelImageEdit}
                  className="px-2 rounded border"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          {editing ? (
            <button
              onClick={() => {
                setEditing(false)
                cancelFieldEdit()
                cancelImageEdit()
                loadProfile()
              }}
              className="px-2 py-1 text-sm"
            >
              Terminar
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 text-sm"
            >
              Modificar perfil
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}