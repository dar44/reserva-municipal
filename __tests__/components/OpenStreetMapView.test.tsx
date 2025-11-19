/**
 * Se definen **interfaces explícitas** para las instancias mock (map, marker, tileLayer, namespace)
 * porque en este test se usan métodos concretos y se necesita:
 *
 * - Tipado seguro en las llamadas: el test invoca mapInstance.setView([...], zoom) y markerInstance.addTo(...).
 *   Al declarar las firmas (por ejemplo jest.Mock<LeafletMapMock, [number[], number]>) garantizamos que
 *   setView reciba exactamente [number[], number] y devuelva la propia instancia para el encadenamiento.
 *
 * - Verificación de métodos realmente usados: el componente bajo prueba llama a setView, on, getZoom,
 *   marker.addTo, marker.setLatLng y tileLayer.addTo. Si mañana el componente usa otro método (p.ej. flyTo),
 *   TypeScript avisará al no existir en la interfaz, evitando falsos positivos con mocks any.
 *
 * - Coherencia del namespace L: al hacer (window as any).L = leafletNamespace y luego L.map / L.marker,
 *   estas propiedades deben existir con la forma esperada; las interfaces actúan como contrato.
 *
 * - Prevención de errores silenciosos: sin interfaces explícitas Jest permitiría crear funciones mock libres
 *   y podríamos pasar argumentos incorrectos sin detectar en compilación (por ejemplo orden distinto en setView).
 *
 * - Mantenibilidad: si cambia la implementación (más métodos usados) solo se amplían las interfaces aquí;
 *   el resto del test sigue consistente sin introducir mocks parciales inconsistentes.
 *
 * - Control del retorno encadenable: los mocks devuelven su propia instancia (mapInstance, markerInstance,
 *   tileLayerInstance). El genérico jest.fn<Return, Args> asegura ese patrón y evita olvidar el return.
 *
 * En resumen: se usan para asegurar que el test refleje con precisión el contrato que el componente espera
 * del API de Leaflet y para que cualquier divergencia futura falle en tiempo de compilación.
 */

import { act, render, screen } from '@testing-library/react'


interface LeafletMapMock {
  setView: jest.Mock<LeafletMapMock, [number[], number]>
  on: jest.Mock
  remove: jest.Mock
  getZoom: jest.Mock<number, []>
}

interface LeafletMarkerMock {
  addTo: jest.Mock<LeafletMarkerMock, [unknown]>
  setLatLng: jest.Mock<LeafletMarkerMock, [number[]]>
  remove: jest.Mock
}

interface LeafletTileLayerMock {
  addTo: jest.Mock<LeafletTileLayerMock, [unknown]>
}

interface LeafletNamespaceMock {
  map: jest.Mock<LeafletMapMock, any[]>
  marker: jest.Mock<LeafletMarkerMock, any[]>
  tileLayer: jest.Mock<LeafletTileLayerMock, any[]>
}

/* -------------------- INSTANCIAS MOCK CON TIPADO -------------------- */

const mapInstance: LeafletMapMock = {
  setView: jest.fn<LeafletMapMock, [number[], number]>(() => mapInstance),
  on: jest.fn(),
  remove: jest.fn(),
  getZoom: jest.fn<number, []>(() => 14),
}

const markerInstance: LeafletMarkerMock = {
  addTo: jest.fn<LeafletMarkerMock, [unknown]>(() => markerInstance),
  setLatLng: jest.fn<LeafletMarkerMock, [number[]]>(() => markerInstance),
  remove: jest.fn(),
}

const tileLayerInstance: LeafletTileLayerMock = {
  addTo: jest.fn<LeafletTileLayerMock, [unknown]>(() => tileLayerInstance),
}

const leafletNamespace: LeafletNamespaceMock = {
  map: jest.fn<LeafletMapMock, any[]>(() => mapInstance),
  tileLayer: jest.fn<LeafletTileLayerMock, any[]>(() => tileLayerInstance),
  marker: jest.fn<LeafletMarkerMock, any[]>(() => markerInstance),
}

/* -------------------- MOCK ensureLeaflet -------------------- */

const ensureLeafletMock = jest.fn(async () => {
  ;(window as any).L = leafletNamespace
  return leafletNamespace
})

jest.mock('@/lib/leaflet', () => ({
  DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 },
  ensureLeaflet: ensureLeafletMock,
}))

/* -------------------- TESTS -------------------- */

describe('OpenStreetMapView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock | undefined)?.mockReset?.()
  })

  it('inicializa el mapa con coordenadas conocidas', async () => {
    const { default: OpenStreetMapView } = await import('@/components/OpenStreetMapView')

    render(<OpenStreetMapView title="Ubicación" latitude={40.2} longitude={-3.7} />)

    await act(async () => Promise.resolve())

    expect(ensureLeafletMock).toHaveBeenCalled()
    expect(mapInstance.setView).toHaveBeenCalledWith([40.2, -3.7], expect.any(Number))

    await act(async () => Promise.resolve())

    expect(markerInstance.addTo).toHaveBeenCalled()
  })

  it('muestra mensaje de error cuando no se encuentra la dirección', async () => {
    const { default: OpenStreetMapView } = await import('@/components/OpenStreetMapView')

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => []
    })) as unknown as typeof fetch

    render(<OpenStreetMapView address="Desconocida 123" />)

    await screen.findByText('Dirección: Desconocida 123')
    await screen.findByText('Buscando ubicación en OpenStreetMap…')

    await act(async () => Promise.resolve())

    await screen.findByText('No se pudo localizar la dirección proporcionada.')
  })
})
