'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, UserCircle2, HelpCircle } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-toastify'
import {
  USER_STORAGE_BUCKET,
  buildStorageUrl,
  buildUserProfilePath,
  isUserProfileObject
} from '@/lib/storage'

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

interface Props {
  initialProfile: ProfileData
  initialImageUrl: string | null
  onUpdated?: (name: string) => void
}

export default function ProfilePage({ initialProfile, initialImageUrl, onUpdated }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [draft, setDraft] = useState<Omit<ProfileData, 'image' | 'image_bucket'>>({
    name: initialProfile.name,
    surname: initialProfile.surname,
    dni: initialProfile.dni,
    phone: initialProfile.phone
  })
  const [editing, setEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [deleteImage, setDeleteImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)



  // Revoke object URL on unmount / file change
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const startEditing = () => {
    setDraft({
      name: profile.name,
      surname: profile.surname,
      dni: profile.dni,
      phone: profile.phone
    })
    setImageFile(null)
    setDeleteImage(false)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setImageFile(null)
    setImagePreviewUrl(null)
    setDeleteImage(false)
  }

  const handleSave = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const userUid = user?.id
    if (!userUid) return

    setSaving(true)

    try {
      const textPayload: Record<string, string> = {}
      const authPayload: Record<string, string> = {}

      for (const field of editableFields) {
        const trimmed = draft[field].trim()
        if (trimmed !== profile[field]) {
          textPayload[field] = trimmed
          authPayload[field] = trimmed
        }
      }

      if (Object.keys(textPayload).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({ data: authPayload })
        if (authError) {
          toast.error('Error al actualizar el perfil en autenticación')
          return
        }
        const { error } = await supabase
          .from('users')
          .update({ ...textPayload, updated_at: new Date().toISOString() })
          .eq('uid', userUid)
        if (error) {
          toast.error('Error al actualizar los datos del perfil')
          return
        }
      }

      let newImagePath = profile.image
      let newBucket = profile.image_bucket

      if (deleteImage) {
        newImagePath = null
        newBucket = null
      } else if (imageFile) {
        if (imageFile.size === 0) {
          toast.error('Por favor selecciona un archivo de imagen válido')
          return
        }
        const uploadPath = buildUserProfilePath(userUid, imageFile.name)
        const { error: uploadError } = await supabase.storage
          .from(USER_STORAGE_BUCKET)
          .upload(uploadPath, imageFile, { cacheControl: '3600', upsert: true })
        if (uploadError) {
          toast.error('Error al subir la imagen')
          return
        }
        newImagePath = uploadPath
        newBucket = USER_STORAGE_BUCKET
      }

      if (newImagePath !== profile.image || newBucket !== profile.image_bucket) {
        const { error: imageAuthError } = await supabase.auth.updateUser({
          data: { image: newImagePath, image_bucket: newBucket }
        })
        if (imageAuthError) {
          toast.error('Error al actualizar la imagen en autenticación')
          return
        }
        const { error: imageDbError } = await supabase
          .from('users')
          .update({ image: newImagePath, image_bucket: newBucket, updated_at: new Date().toISOString() })
          .eq('uid', userUid)
        if (imageDbError) {
          toast.error('Error al actualizar la imagen en la base de datos')
          return
        }

        if (
          profile.image &&
          profile.image_bucket === USER_STORAGE_BUCKET &&
          newImagePath !== profile.image &&
          isUserProfileObject(profile.image, userUid)
        ) {
          await supabase.storage.from(profile.image_bucket).remove([profile.image]).catch(() => { })
        }

        const newUrl = await buildStorageUrl(supabase, newBucket, newImagePath)
        setImageUrl(newUrl)
      }

      const updatedProfile: ProfileData = {
        ...profile,
        ...Object.fromEntries(
          Object.entries(textPayload).map(([k, v]) => [k, v])
        ),
        image: newImagePath,
        image_bucket: newBucket
      } as ProfileData

      setProfile(updatedProfile)
      if (textPayload['name'] !== undefined) {
        onUpdated?.(textPayload['name'])
      }

      toast.success('Perfil actualizado correctamente')
      setEditing(false)
      setImageFile(null)
      setImagePreviewUrl(null)
      setDeleteImage(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = () => {
    setDeleteImage(true)
    setImageFile(null)
    setImagePreviewUrl(null)
  }

  const handleChangeImage = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setImageFile(file)
      setDeleteImage(false)
    }
  }


  const displayImageUrl = editing
    ? deleteImage
      ? null
      : (imagePreviewUrl ?? imageUrl)
    : imageUrl

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-2xl">
        <div className="card-base space-y-8">


          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground-secondary hover:text-foreground transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-semibold text-foreground">Mi perfil</h1>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Editar perfil
              </button>
            )}
          </div>


          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {displayImageUrl ? (
                <Image
                  src={displayImageUrl}
                  alt="Imagen de perfil"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-surface-secondary ring-2 ring-border flex items-center justify-center">
                  <UserCircle2 className="h-14 w-14 text-muted-foreground" />
                </div>
              )}
            </div>

            {editing && (
              <div className="flex items-center gap-3">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Seleccionar imagen de perfil"
                />
                <button
                  type="button"
                  onClick={handleChangeImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium text-foreground-secondary hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Cambiar imagen
                </button>
                {(displayImageUrl || imageFile) && !deleteImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium text-destructive hover:bg-error-subtle hover:border-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar imagen
                  </button>
                )}
              </div>
            )}
          </div>


          <hr className="border-border" />


          <div className="space-y-5">
            {editableFields.map(field => (
              <div key={field} className="grid grid-cols-3 items-center gap-4">
                <label
                  htmlFor={editing ? `profile-${field}` : undefined}
                  className="text-sm font-medium text-foreground-secondary col-span-1 flex items-center gap-1.5"
                >
                  {fieldLabels[field]}
                  {field === 'dni' && (
                    <Tooltip content="Documento Nacional de Identidad. Formato: 12345678A. Si necesitas corregirlo contacta con la administración." side="right">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  )}
                  {field === 'phone' && (
                    <Tooltip content="Formato recomendado: +34 600 000 000. Se usará para notificaciones y contacto." side="right">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  )}
                </label>
                <div className="col-span-2">
                  {editing ? (
                    <input
                      id={`profile-${field}`}
                      type="text"
                      value={draft[field]}
                      onChange={e => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
                      className="input-base"
                    />
                  ) : (
                    <span className="text-sm text-foreground">
                      {profile[field] || <span className="text-muted-foreground italic">Sin valor</span>}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <>
              <hr className="border-border" />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground-secondary hover:bg-accent transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
