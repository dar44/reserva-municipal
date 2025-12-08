'use client'

import { useState } from 'react'
import type { StorageObject } from '@/lib/storage'

type ImageMode = 'keep' | 'default' | 'upload' | 'none'

type Props = {
    defaultImages: StorageObject[]
    currentImage?: string | null
    currentBucket?: string | null
    onChange?: (image: string | null, bucket: string | null, file: File | null) => void
}

export default function OrganizerCourseImagePicker({
    defaultImages,
    currentImage = null,
    currentBucket = null,
    onChange,
}: Props) {
    const hasExisting = Boolean(currentImage)
    const hasDefaults = defaultImages.length > 0

    const [mode, setMode] = useState<ImageMode>(() => {
        if (hasExisting) return 'keep'
        if (hasDefaults) return 'default'
        return 'none'
    })

    const [selectedDefault, setSelectedDefault] = useState(() => {
        if (currentImage && defaultImages.some(img => img.path === currentImage)) {
            return currentImage
        }
        return defaultImages[0]?.path ?? ''
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleModeChange = (newMode: ImageMode) => {
        setMode(newMode)

        if (newMode === 'keep' && onChange) {
            onChange(currentImage, currentBucket, null)
        } else if (newMode === 'default' && onChange) {
            onChange(selectedDefault, 'cursos', null)
        } else if (newMode === 'upload' && onChange && selectedFile) {
            onChange(null, null, selectedFile)
        } else if (newMode === 'none' && onChange) {
            onChange(null, null, null)
        }
    }

    const handleDefaultChange = (path: string) => {
        setSelectedDefault(path)
        if (mode === 'default' && onChange) {
            onChange(path, 'cursos', null)
        }
    }

    const handleFileChange = (file: File | null) => {
        setSelectedFile(file)
        if (mode === 'upload' && onChange) {
            onChange(null, null, file)
        }
    }

    return (
        <fieldset className="space-y-2 md:col-span-2">
            <legend className="text-sm font-medium">Imagen del curso</legend>

            <div className="space-y-2 text-sm">
                {hasExisting && (
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="image_mode"
                            value="keep"
                            checked={mode === 'keep'}
                            onChange={() => handleModeChange('keep')}
                            className="accent-emerald-600"
                        />
                        Mantener imagen actual
                    </label>
                )}

                <label className={`flex flex-col gap-2 ${!hasDefaults ? 'opacity-60' : ''}`}>
                    <span className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="image_mode"
                            value="default"
                            checked={mode === 'default'}
                            onChange={() => handleModeChange('default')}
                            disabled={!hasDefaults}
                            className="accent-emerald-600"
                        />
                        Usar imagen predeterminada
                    </span>
                    <select
                        value={selectedDefault}
                        onChange={(e) => handleDefaultChange(e.target.value)}
                        disabled={!hasDefaults || mode !== 'default'}
                        className="w-full rounded border border-gray-700 bg-gray-900 p-2"
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
                            name="image_mode"
                            value="upload"
                            checked={mode === 'upload'}
                            onChange={() => handleModeChange('upload')}
                            className="accent-emerald-600"
                        />
                        Subir nueva imagen
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        disabled={mode !== 'upload'}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-200 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-emerald-600 file:text-white disabled:opacity-50"
                    />
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="image_mode"
                        value="none"
                        checked={mode === 'none'}
                        onChange={() => handleModeChange('none')}
                        className="accent-emerald-600"
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
