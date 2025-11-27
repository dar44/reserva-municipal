export type Coordinates = { lat: number; lng: number }

export type LeafletMouseEvent = { latlng: Coordinates }

export type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap
  getZoom: () => number
  on: (event: 'click', handler: (event: LeafletMouseEvent) => void) => void
  remove: () => void
}

export type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker
  setLatLng: (coords: [number, number]) => LeafletMarker
  remove: () => void
}

export type LeafletTileLayer = {
  addTo: (map: LeafletMap) => LeafletTileLayer
}

export type LeafletNamespace = {
  map: (element: HTMLElement) => LeafletMap
  tileLayer: (url: string, options: { attribution?: string; maxZoom?: number }) => LeafletTileLayer
  marker: (coords: [number, number]) => LeafletMarker
}

declare global {
  interface Window {
    L?: LeafletNamespace
  }
}

export const DEFAULT_CENTER: Coordinates = { lat: 40.4168, lng: -3.7038 }

let leafletPromise: Promise<LeafletNamespace | null> | null = null

export const ensureLeaflet = (): Promise<LeafletNamespace | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.L) return Promise.resolve(window.L)

  if (!leafletPromise) {
    leafletPromise = new Promise<LeafletNamespace | null>((resolve, reject) => {
      const existingScript = document.getElementById('leaflet-script') as HTMLScriptElement | null
      if (existingScript) {
        if (window.L) {
          resolve(window.L)
          return
        }

        existingScript.addEventListener('load', () => resolve(window.L ?? null))
        existingScript.addEventListener('error', () => {
          leafletPromise = null
          reject(new Error('No se pudo cargar Leaflet'))
        })
        return
      }

      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link')
        css.id = 'leaflet-css'
        css.rel = 'stylesheet'
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        css.crossOrigin = 'anonymous'
        document.head.appendChild(css)
      }

      const script = document.createElement('script')
      script.id = 'leaflet-script'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = 'anonymous'
      script.defer = true
      script.onload = () => resolve(window.L ?? null)
      script.onerror = () => {
        leafletPromise = null
        script.remove()
        reject(new Error('No se pudo cargar Leaflet'))
      }
      document.body.appendChild(script)
    })
  }

  return leafletPromise
}