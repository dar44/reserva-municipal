'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface LocationPickerProps {
  valueNames: {
    address: string
    postalCode?: string
    city?: string
    province?: string
    region?: string
    latitude?: string
    longitude?: string
  }
  labels?: Partial<Record<'address' | 'postalCode' | 'city' | 'province' | 'region', string>>
  defaultValues?: Partial<Record<'address' | 'postalCode' | 'city' | 'province' | 'region', string>> & {
    latitude?: number
    longitude?: number
  }
  required?: boolean
  className?: string
}

type Suggestion = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: Record<string, string>
}

type Coordinates = { lat: number; lng: number }

type LeafletMouseEvent = { latlng: Coordinates }

type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap
  getZoom: () => number
  on: (event: 'click', handler: (event: LeafletMouseEvent) => void) => void
  remove: () => void
}

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  setLatLng: (coords: [number, number]) => LeafletMarker
  remove: () => void
}

type LeafletTileLayer = {
  addTo: (map: LeafletMap) => LeafletTileLayer
}

type LeafletNamespace = {
  map: (element: HTMLElement) => LeafletMap
  tileLayer: (url: string, options: { attribution?: string; maxZoom?: number }) => LeafletTileLayer
  marker: (coords: [number, number]) => LeafletMarker
}

type LeafletModule = {
  default?: unknown
} & Record<string, unknown>

const isLeafletNamespace = (value: unknown): value is LeafletNamespace => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LeafletNamespace>
  return (
    typeof candidate.map === 'function' &&
    typeof candidate.tileLayer === 'function' &&
    typeof candidate.marker === 'function'
  )
}

declare global {
  interface Window {
    L?: LeafletNamespace
  }
}

const DEFAULT_CENTER: Coordinates = { lat: 40.4168, lng: -3.7038 }

let leafletPromise: Promise<LeafletNamespace | null> | null = null

const ensureLeaflet = (): Promise<LeafletNamespace | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.L) return Promise.resolve(window.L)

  if (!leafletPromise) {
    leafletPromise = new Promise<LeafletNamespace | null>((resolve, reject) => {
      const existingScript = document.getElementById('leaflet-script') as HTMLScriptElement | null
      if (existingScript) {
        if (window.L) return resolve(window.L)
        existingScript.addEventListener('load', () => resolve(window.L ?? null))
        existingScript.addEventListener('error', reject)
        return
      }

      // CSS (SRI oficial Leaflet 1.9.4)
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link')
        css.id = 'leaflet-css'
        css.rel = 'stylesheet'
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        css.crossOrigin = 'anonymous'
        document.head.appendChild(css)
      }

      // JS (SRI oficial Leaflet 1.9.4)
      const script = document.createElement('script')
      script.id = 'leaflet-script'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = 'anonymous'
      script.defer = true
      script.onload = () => resolve(window.L ?? null)
      script.onerror = async () => {
    
      }
      document.body.appendChild(script)
    })
  }
  return leafletPromise!
}


const extractCity = (address: Record<string, string> = {}) =>
  address.city || address.town || address.village || address.hamlet || address.municipality || ''

const extractProvince = (address: Record<string, string> = {}) =>
  address.province || address.county || address.state_district || ''

const extractRegion = (address: Record<string, string> = {}) =>
  address.state || address.region || address.country || ''

const extractAddressLine = (suggestion: Suggestion) => {
  const addr = suggestion.address || {}
  const parts = [addr.road, addr.house_number, addr.neighbourhood, addr.suburb]
    .filter(Boolean)
    .join(' ')
  if (parts.trim().length > 0) return parts.trim()
  return suggestion.display_name
}

const formatSuggestion = (suggestion: Suggestion) => ({
  address: extractAddressLine(suggestion),
  postalCode: suggestion.address?.postcode ?? '',
  city: extractCity(suggestion.address),
  province: extractProvince(suggestion.address),
  region: extractRegion(suggestion.address),
  coordinates: {
    lat: Number.parseFloat(suggestion.lat),
    lng: Number.parseFloat(suggestion.lon),
  },
})

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
        },
      }
    )
    if (!response.ok) throw new Error('Respuesta inválida')
    const data = await response.json()
    return {
      display_name: data.display_name as string,
      address: data.address as Record<string, string> | undefined,
      lat: String(lat),
      lon: String(lng),
      place_id: data.place_id as number,
    } satisfies Suggestion
  } catch (error) {
    console.error('Error al obtener datos de la ubicación seleccionada', error)
    return null
  }
}

const searchAddress = async (query: string, signal: AbortSignal) => {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')
  url.searchParams.set('q', query)

  const response = await fetch(url, {
    signal,
    headers: {
      'Accept-Language': 'es',
    },
  })

  if (!response.ok) throw new Error('No se pudieron obtener resultados')
  const data: Suggestion[] = await response.json()
  return data
}

const LocationPicker = ({
  valueNames,
  defaultValues,
  labels,
  required = false,
  className = '',
}: LocationPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const [leafletReady, setLeafletReady] = useState(false)

  const [searchTerm, setSearchTerm] = useState(defaultValues?.address ?? '')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Coordinates | null>(() => {
    if (defaultValues?.latitude && defaultValues?.longitude) {
      return { lat: defaultValues.latitude, lng: defaultValues.longitude }
    }
    return null
  })
  const latestPositionRef = useRef<Coordinates | null>(selectedPosition)

  const [values, setValues] = useState({
    address: defaultValues?.address ?? '',
    postalCode: defaultValues?.postalCode ?? '',
    city: defaultValues?.city ?? '',
    province: defaultValues?.province ?? '',
    region: defaultValues?.region ?? '',
  })

  const [geocodeAttempted, setGeocodeAttempted] = useState(false)

  const visibleFields = useMemo(() => ({
    address: valueNames.address,
    postalCode: valueNames.postalCode,
    city: valueNames.city,
    province: valueNames.province,
    region: valueNames.region,
  }), [valueNames])

  const updateValuesFromSuggestion = useCallback((suggestion: Suggestion) => {
    const formatted = formatSuggestion(suggestion)
    setValues({
      address: formatted.address,
      postalCode: formatted.postalCode,
      city: formatted.city,
      province: formatted.province,
      region: formatted.region,
    })
    setSelectedPosition(formatted.coordinates)
    setSearchTerm(formatted.address)
  }, [])

  const updateFromCoordinates = useCallback(async (lat: number, lng: number) => {
    const result = await reverseGeocode(lat, lng)
    if (!result) {
      setSelectedPosition({ lat, lng })
      return
    }
    updateValuesFromSuggestion(result)
  }, [updateValuesFromSuggestion])

  useEffect(() => {
    latestPositionRef.current = selectedPosition
  }, [selectedPosition])

  useEffect(() => {
    ensureLeaflet()
      .then(L => {
        if (!L || !mapContainerRef.current || mapRef.current) return

        const initial = latestPositionRef.current ?? DEFAULT_CENTER
        const mapInstance = L.map(mapContainerRef.current).setView(
          [initial.lat, initial.lng],
          latestPositionRef.current ? 13 : 6,
        )
        mapRef.current = mapInstance

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance)

        mapInstance.on('click', (event: LeafletMouseEvent) => {
          const { lat, lng } = event.latlng
          updateFromCoordinates(lat, lng)
        })

        setLeafletReady(true)
      })
      .catch(error => {
        console.error('No se pudo cargar Leaflet', error)
      })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [updateFromCoordinates])

  useEffect(() => {
    if (!leafletReady || !mapRef.current || !window.L) return

    const position = selectedPosition ?? DEFAULT_CENTER
    const zoom = selectedPosition ? Math.max(mapRef.current.getZoom(), 13) : 6

    mapRef.current.setView([position.lat, position.lng], zoom)

    if (!selectedPosition) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    if (!markerRef.current) {
      markerRef.current = window.L.marker([position.lat, position.lng]).addTo(mapRef.current!)
    } else {
      markerRef.current.setLatLng([position.lat, position.lng])
    }
  }, [leafletReady, selectedPosition])

  useEffect(() => {
    if (!defaultValues?.address || geocodeAttempted || selectedPosition) return
    let cancelled = false

    const controller = new AbortController()
    const geocode = async () => {
      try {
        const results = await searchAddress(defaultValues.address as string, controller.signal)
        if (cancelled || results.length === 0) return
        updateValuesFromSuggestion(results[0])
        setGeocodeAttempted(true)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('No se pudo geocodificar la dirección inicial', error)
          setGeocodeAttempted(true)
        }
      }
    }

    geocode()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [defaultValues?.address, geocodeAttempted, selectedPosition, updateValuesFromSuggestion])

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)

    const timeout = window.setTimeout(() => {
      searchAddress(searchTerm, controller.signal)
        .then(results => {
          setSuggestions(results)
        })
        .catch(error => {
          if (!controller.signal.aborted) {
            console.error('Error en la búsqueda de direcciones', error)
            setSuggestions([])
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false)
        })
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
      setIsSearching(false)
    }
  }, [searchTerm])

  const renderInput = (key: keyof typeof values, name?: string) => {
    if (!name) return null
    const label = labels?.[key] ?? {
      address: 'Dirección',
      postalCode: 'Código Postal',
      city: 'Ciudad',
      province: 'Provincia',
      region: 'Comunidad',
    }[key]

    return (
      <label className="flex flex-col gap-1 text-sm" key={key}>
        <span className="text-gray-300">{label}</span>
        <input
          name={name}
          value={values[key]}
          onChange={(event) => setValues(prev => ({ ...prev, [key]: event.target.value }))}
          className="w-full rounded border border-gray-700 bg-gray-900 p-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
          required={required && key === 'address'}
          placeholder={label ?? ''}
        />
      </label>
    )
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    updateValuesFromSuggestion(suggestion)
    setSuggestions([])
    setSuggestionsVisible(false)
  }

  const suggestionsList = suggestions.length > 0 && suggestionsVisible && (
    <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded border border-gray-700 bg-gray-900 text-sm shadow-lg">
      {suggestions.map(suggestion => (
        <li
          key={suggestion.place_id}
          className="cursor-pointer px-3 py-2 hover:bg-gray-800"
          onMouseDown={(event) => {
            event.preventDefault()
            handleSelectSuggestion(suggestion)
          }}
        >
          {suggestion.display_name}
        </li>
      ))}
    </ul>
  )

  return (
    <div className={`space-y-3 rounded border border-gray-700 bg-gray-900 p-3 ${className}`}>
      <div className="relative">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-300">Buscar dirección</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setSuggestionsVisible(true)
            }}
            onFocus={() => setSuggestionsVisible(true)}
            onBlur={() => {
              window.setTimeout(() => setSuggestionsVisible(false), 200)
            }}
            placeholder="Introduce una dirección o lugar"
            className="w-full rounded border border-gray-700 bg-gray-950 p-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
          />
        </label>
        {isSearching && (
          <div className="absolute right-2 top-9 text-xs text-gray-400">Buscando…</div>
        )}
        {suggestionsList}
      </div>

      <div>
        <div
          ref={mapContainerRef}
          className="h-60 w-full overflow-hidden rounded border border-gray-700 bg-gray-800"
        />
        <p className="mt-1 text-xs text-gray-400">Pulsa sobre el mapa para ajustar el marcador.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {renderInput('address', visibleFields.address)}
        {renderInput('postalCode', visibleFields.postalCode)}
        {renderInput('city', visibleFields.city)}
        {renderInput('province', visibleFields.province)}
        {renderInput('region', visibleFields.region)}
      </div>

      {valueNames.latitude && (
        <input type="hidden" name={valueNames.latitude} value={selectedPosition?.lat ?? ''} />
      )}
      {valueNames.longitude && (
        <input type="hidden" name={valueNames.longitude} value={selectedPosition?.lng ?? ''} />
      )}
    </div>
  )
}

export default LocationPicker