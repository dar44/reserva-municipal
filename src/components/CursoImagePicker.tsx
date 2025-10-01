'use client'

import { useMemo, useState } from 'react'
import type { StorageObject } from '@/lib/storage'
import { COURSE_IMAGE_BUCKET, isCourseDefaultImage } from '@/lib/cursoImages'

type Mode = 'keep' | 'default' | 'upload' | 'none'

type Props = {
  defaultImages: StorageObject[]
  initialImage?: string | null
  initialBucket?: string | null
}

export default function CourseImagePicker({
  defaultImages,
  initialImage = null,
  initialBucket = null,
}: Props) {
  const hasExisting = Boolean(initialImage)
  const hasDefaults = defaultImages.length > 0
  const isInitialDefault = useMemo(() => {
    if (!initialImage) return false
    if (initialBucket !== COURSE_IMAGE_BUCKET) return false
    return isCourseDefaultImage(initialImage)
  }, [initialBucket, initialImage])

  const [mode, setMode] = useState<Mode>(() => {
    if (hasExisting) return 'keep'
    if (hasDefaults) return 'default'
    return 'upload'
  })

  const [selectedDefault, setSelectedDefault] = useState(() => {
    if (isInitialDefault) return initialImage ?? ''
    return defaultImages[0]?.path ?? ''
  })

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Imagen del curso</legend>
      <input type="hidden" name="image_mode" value={mode} />
      <div className="space-y-2 text-sm">
        {hasExisting && (
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="image_option"
              value="keep"
              checked={mode === 'keep'}
              onChange={() => setMode('keep')}
            />
            Mantener imagen actual
          </label>
        )}

        <label className={`flex flex-col gap-2 ${!hasDefaults ? 'opacity-60' : ''}`}>
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="image_option"
              value="default"
              checked={mode === 'default'}
              onChange={() => setMode('default')}
              disabled={!hasDefaults}
            />
            Usar imagen predeterminada
          </span>
          <select
            name="image_default"
            value={selectedDefault}
            onChange={event => {
              setSelectedDefault(event.target.value)
              setMode('default')
            }}
            disabled={!hasDefaults || mode !== 'default'}
            className="w-full p-2 rounded bg-gray-700"
          >
            {defaultImages.length === 0 && <option value="">Sin opciones disponibles</option>}
            {defaultImages.map(option => (
              <option key={option.path} value={option.path}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="image_option"
              value="upload"
              checked={mode === 'upload'}
              onChange={() => setMode('upload')}
            />
            Subir nueva imagen
          </span>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            disabled={mode !== 'upload'}
            className="block w-full text-sm text-gray-200 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="image_option"
            value="none"
            checked={mode === 'none'}
            onChange={() => setMode('none')}
          />
          Sin imagen
        </label>
      </div>
      <p className="text-xs text-gray-400">
        Si no seleccionas ninguna opción se usará la imagen predeterminada disponible.
      </p>
    </fieldset>
  )
}