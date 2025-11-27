'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_CENTER,
  ensureLeaflet,
  type Coordinates,
  type LeafletMap,
  type LeafletMarker,
} from '@/lib/leaflet'

interface OpenStreetMapViewProps {
  address?: string | null
  title?: string
  latitude?: number | null
  longitude?: number | null
  className?: string
}

type GeocodeStatus = 'idle' | 'loading' | 'success' | 'error'

const geocodeCache = new Map<string, Coordinates>()

const fetchCoordinates = async (query: string): Promise<Coordinates | null> => {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return null

  if (geocodeCache.has(trimmedQuery)) {
    return geocodeCache.get(trimmedQuery) ?? null
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '0')
  url.searchParams.set('q', trimmedQuery)

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'es',
    },
  })

  if (!response.ok) return null
  const data: Array<{ lat: string; lon: string }> = await response.json()
  if (!data.length) return null

  const coords: Coordinates = {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
  }
  geocodeCache.set(trimmedQuery, coords)
  return coords
}

const OpenStreetMapView = ({
  address,
  title,
  latitude,
  longitude,
  className = '',
}: OpenStreetMapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const coordinatesRef = useRef<Coordinates | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { lat: latitude, lng: longitude }
    }
    return null
  })
  const [status, setStatus] = useState<GeocodeStatus>(() =>
    typeof latitude === 'number' && typeof longitude === 'number' ? 'success' : 'idle',
  )
  const [error, setError] = useState<string | null>(null)

  const effectiveAddress = useMemo(() => (address ?? '').trim(), [address])

  useEffect(() => {
    let cancelled = false

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      setCoordinates({ lat: latitude, lng: longitude })
      setStatus('success')
      setError(null)
      return
    }

    if (!effectiveAddress) {
      setCoordinates(null)
      setStatus('error')
      setError('No se ha especificado una dirección válida para mostrar el mapa.')
      return
    }

    setStatus('loading')
    setError(null)

    fetchCoordinates(effectiveAddress)
      .then(result => {
        if (cancelled) return
        if (!result) {
          setStatus('error')
          setError('No se pudo localizar la dirección proporcionada.')
          setCoordinates(null)
          return
        }
        setCoordinates(result)
        setStatus('success')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
        setError('No se pudo cargar la ubicación en el mapa.')
        setCoordinates(null)
      })

    return () => {
      cancelled = true
    }
  }, [effectiveAddress, latitude, longitude])

  useEffect(() => {
    let disposed = false

    if (!containerRef.current) return

    ensureLeaflet()
      .then(L => {
        if (disposed || !L || !containerRef.current || mapRef.current) return

        const initialCenter = coordinatesRef.current ?? DEFAULT_CENTER
        const initialZoom = coordinatesRef.current ? 14 : 5
        const map = L.map(containerRef.current).setView([
          initialCenter.lat,
          initialCenter.lng,
        ], initialZoom)
        mapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        if (coordinatesRef.current) {
          markerRef.current = L.marker([
            coordinatesRef.current.lat,
            coordinatesRef.current.lng,
          ]).addTo(map)
        }
      })
      .catch(() => {
        if (disposed) return
        setError(prev => prev ?? 'No se pudo cargar el mapa de OpenStreetMap.')
        setStatus(prev => (prev === 'loading' ? 'error' : prev))
      })

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    coordinatesRef.current = coordinates
    if (!coordinates || !mapRef.current || !window.L) return

    const map = mapRef.current
    const { lat, lng } = coordinates
    const zoom = Math.max(map.getZoom(), 14)
    map.setView([lat, lng], zoom)

    if (!markerRef.current) {
      markerRef.current = window.L.marker([lat, lng]).addTo(map)
    } else {
      markerRef.current.setLatLng([lat, lng])
    }
  }, [coordinates])

  const statusMessage = useMemo(() => {
    if (status === 'loading') return 'Buscando ubicación en OpenStreetMap…'
    if (status === 'error' && error) return error
    return null
  }, [error, status])

  return (
    <div className={`space-y-2 rounded border border-gray-700 bg-gray-900 p-3 ${className}`}>
      {title && <p className="text-sm font-semibold text-gray-200">{title}</p>}
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded border border-gray-700 bg-gray-800"
      />
      {effectiveAddress && (
        <p className="text-xs text-gray-400">Dirección: {effectiveAddress}</p>
      )}
      {statusMessage && <p className="text-xs text-yellow-300">{statusMessage}</p>}
    </div>
  )
}

export default OpenStreetMapView