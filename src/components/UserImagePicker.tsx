'use client'

import { useMemo, useState } from 'react'

import {
  USER_DEFAULTS_FOLDER,
  USER_STORAGE_BUCKET,
  type StorageObject
} from '@/lib/storage'

export type UserImageMode = 'keep' | 'default' | 'upload' | 'none'

type Props = {
  defaultImages: StorageObject[]
  initialImage?: string | null
  initialBucket?: string | null
  initialDefault?: string
  legend?: string
  helpText?: string
  className?: string
}

export default function UserImagePicker ({
  defaultImages,
  initialImage = null,
  initialBucket = null,
  initialDefault = '',
  legend = 'Imagen de perfil',
  helpText,
  className = ''
}: Props) {
  const hasExisting = Boolean(initialImage && initialBucket)
  const hasDefaults = defaultImages.length > 0

  const normalizedInitialDefault = useMemo(() => {
    if (initialDefault) return initialDefault
    if (
      hasExisting &&
      initialBucket === USER_STORAGE_BUCKET &&
      typeof initialImage === 'string' &&
      initialImage.startsWith(`${USER_DEFAULTS_FOLDER}/`)
    ) {
      return initialImage
    }
    if (hasDefaults) return defaultImages[0]?.path ?? ''
    return ''
  }, [
    defaultImages,
    hasDefaults,
    hasExisting,
    initialBucket,
    initialDefault,
    initialImage
  ])

  const [mode, setMode] = useState<UserImageMode>(() => {
    if (hasExisting) return 'keep'
    if (normalizedInitialDefault) return 'default'
    if (hasDefaults) return 'default'
    return 'upload'
  })
  const [selectedDefault, setSelectedDefault] = useState(normalizedInitialDefault)

  const handleSelectDefault = (value: string) => {
    setSelectedDefault(value)
    setMode('default')
  }

  return (
    <fieldset className={`space-y-2 text-xs text-gray-300 ${className}`}>
      <legend className="text-sm font-semibold text-gray-200">{legend}</legend>
      <input type="hidden" name="image_mode" value={mode} />
      {hasExisting && (
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="image_option"
            value="keep"
            checked={mode === 'keep'}
            onChange={() => setMode('keep')}
          />
          <span>Mantener imagen actual</span>
        </label>
      )}
      <label className={`flex flex-col gap-2 ${hasDefaults ? '' : 'opacity-50'}`}>
        <span className="flex items-center gap-2">
          <input
            type="radio"
            name="image_option"
            value="default"
            checked={mode === 'default'}
            onChange={() => {
              setMode('default')
              if (!selectedDefault && hasDefaults) {
                setSelectedDefault(defaultImages[0]?.path ?? '')
              }
            }}
            disabled={!hasDefaults}
          />
          <span>Usar imagen predeterminada</span>
        </span>
        <select
          name="image_default"
          value={selectedDefault}
          onChange={event => handleSelectDefault(event.target.value)}
          disabled={!hasDefaults || mode !== 'default'}
          className="w-full p-2 rounded bg-gray-700 text-xs"
        >
          {hasDefaults ? (
            defaultImages.map(option => (
              <option key={option.path} value={option.path}>
                {option.name}
              </option>
            ))
          ) : (
            <option value="">Sin opciones disponibles</option>
          )}
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
          <span>Subir nueva imagen</span>
        </span>
        <input
          type="file"
          name="image_file"
          accept="image/*"
          disabled={mode !== 'upload'}
          className="block w-full text-xs text-gray-200 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white disabled:opacity-70"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="image_option"
          value="none"
          checked={mode === 'none'}
          onChange={() => {
            setMode('none')
            setSelectedDefault('')
          }}
        />
        <span>Sin imagen</span>
      </label>
      {helpText && <p className="text-[11px] text-gray-400">{helpText}</p>}
    </fieldset>
  )
}