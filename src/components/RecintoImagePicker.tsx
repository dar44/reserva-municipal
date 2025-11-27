'use client'

import { useState } from 'react'
import { RECINTO_DEFAULT_IMAGES, RECINTO_DEFAULT_IMAGE_PATH, isDefaultRecintoImage } from '@/lib/recintoImages'

type Mode = 'keep' | 'default' | 'upload' | 'none'

type Props = {
  initialImage?: string | null
}

export default function RecintoImagePicker({ initialImage = null }: Props) {
  const hasExisting = Boolean(initialImage)
  const hasDefaults = RECINTO_DEFAULT_IMAGES.length > 0

  const [mode, setMode] = useState<Mode>(() => {
    if (hasExisting) return 'keep'
    if (hasDefaults) return 'default'
    return 'upload'
  })

  const [selectedDefault, setSelectedDefault] = useState(() => {
    if (hasExisting && isDefaultRecintoImage(initialImage)) return initialImage!
    if (hasDefaults) return RECINTO_DEFAULT_IMAGE_PATH ?? ''
    return ''
  })

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">Imagen del recinto</legend>
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
        <label className={`flex flex-col gap-2 ${!hasDefaults ? 'opacity-50' : ''}`}>
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
            onChange={(event) => {
              setSelectedDefault(event.target.value)
              setMode('default')
            }}
            disabled={!hasDefaults || mode !== 'default'}
            className="w-full p-2 rounded bg-gray-700"
           >
            {Number(RECINTO_DEFAULT_IMAGES.length) === 0 && <option value="">Sin opciones disponibles</option>}
            {RECINTO_DEFAULT_IMAGES.map(option => (
              <option key={option.path} value={option.path}>{option.label}</option>
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
    </fieldset>
  )
}