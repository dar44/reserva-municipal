import { render, screen, waitFor } from '@testing-library/react'
import OpenStreetMapView from '@/components/OpenStreetMapView'

// Mock fetch for geocoding tests
const originalFetch = global.fetch

describe('OpenStreetMapView', () => {
  let mockMap: {
    setView: jest.Mock
    getZoom: jest.Mock
    on: jest.Mock
    remove: jest.Mock
  }
  let mockMarker: {
    addTo: jest.Mock
    setLatLng: jest.Mock
    remove: jest.Mock
  }
  let mockTileLayer: {
    addTo: jest.Mock
  }

  beforeEach(() => {
    // Mock Leaflet functionality
    mockMarker = {
      addTo: jest.fn().mockReturnThis(),
      setLatLng: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    }

    mockTileLayer = {
      addTo: jest.fn().mockReturnThis(),
    }

    mockMap = {
      setView: jest.fn().mockReturnThis(),
      getZoom: jest.fn().mockReturnValue(10),
      on: jest.fn(),
      remove: jest.fn(),
    }

    // Mock the global Leaflet object
    ;(global as { window?: { L?: unknown } }).window = {
      L: {
        map: jest.fn().mockReturnValue(mockMap),
        tileLayer: jest.fn().mockReturnValue(mockTileLayer),
        marker: jest.fn().mockReturnValue(mockMarker),
      },
    }

    // Mock fetch
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('muestra el título cuando se proporciona', () => {
    render(
      <OpenStreetMapView
        title="Ubicación del evento"
        latitude={40.4168}
        longitude={-3.7038}
      />
    )

    expect(screen.getByText('Ubicación del evento')).toBeInTheDocument()
  })

  it('muestra la dirección cuando se proporciona', () => {
    render(
      <OpenStreetMapView
        address="Calle Mayor 1, Madrid"
        latitude={40.4168}
        longitude={-3.7038}
      />
    )

    expect(screen.getByText(/Dirección: Calle Mayor 1, Madrid/)).toBeInTheDocument()
  })

  it('muestra un error cuando no se proporciona dirección ni coordenadas', () => {
    render(<OpenStreetMapView />)

    expect(
      screen.getByText('No se ha especificado una dirección válida para mostrar el mapa.')
    ).toBeInTheDocument()
  })

  it('usa coordenadas directamente cuando se proporcionan latitud y longitud', async () => {
    render(
      <OpenStreetMapView
        latitude={40.4168}
        longitude={-3.7038}
      />
    )

    // Should not show loading or error messages
    expect(screen.queryByText(/Buscando ubicación/)).not.toBeInTheDocument()
    expect(screen.queryByText(/No se pudo/)).not.toBeInTheDocument()

    // Should not call fetch for geocoding
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('muestra estado de carga durante la geocodificación', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(<OpenStreetMapView address="Madrid, España" />)

    expect(screen.getByText('Buscando ubicación en OpenStreetMap…')).toBeInTheDocument()
  })

  it('geocodifica correctamente una dirección válida', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: '40.4168',
          lon: '-3.7038',
        },
      ],
    })

    render(<OpenStreetMapView address="Madrid, España" />)

    // Should show loading state first
    expect(screen.getByText('Buscando ubicación en OpenStreetMap…')).toBeInTheDocument()

    // Wait for geocoding to complete
    await waitFor(() => {
      expect(screen.queryByText('Buscando ubicación en OpenStreetMap…')).not.toBeInTheDocument()
    })

    // Should have called fetch with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('nominatim.openstreetmap.org/search'),
      }),
      expect.objectContaining({
        headers: {
          'Accept-Language': 'es',
        },
      })
    )
  })

  it('muestra error cuando la geocodificación falla (sin resultados)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [], // Empty results
    })

    render(<OpenStreetMapView address="Dirección inexistente 123456" />)

    await waitFor(() => {
      expect(screen.getByText('No se pudo localizar la dirección proporcionada.')).toBeInTheDocument()
    })
  })

  it('prefiere coordenadas sobre dirección cuando ambas están presentes', async () => {
    render(
      <OpenStreetMapView
        address="Madrid, España"
        latitude={41.3851}
        longitude={2.1734}
      />
    )

    // Should not call fetch since coordinates are provided
    expect(global.fetch).not.toHaveBeenCalled()

    // Should not show loading state
    expect(screen.queryByText('Buscando ubicación en OpenStreetMap…')).not.toBeInTheDocument()
  })

  it('aplica className personalizado al contenedor', () => {
    const { container } = render(
      <OpenStreetMapView
        latitude={40.4168}
        longitude={-3.7038}
        className="mi-clase-custom"
      />
    )

    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv).toHaveClass('mi-clase-custom')
  })

  it('cachea resultados de geocodificación para la misma dirección', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          lat: '40.4168',
          lon: '-3.7038',
        },
      ],
    })

    const address = 'Calle Única Para Cache 123'

    // First render
    const { unmount } = render(<OpenStreetMapView address={address} />)

    // Wait for loading to start
    expect(screen.getByText('Buscando ubicación en OpenStreetMap…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Buscando ubicación en OpenStreetMap…')).not.toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)

    unmount()

    // Second render with same address
    render(<OpenStreetMapView address={address} />)

    // With caching, it should resolve immediately without loading state
    await waitFor(() => {
      expect(screen.queryByText('Buscando ubicación en OpenStreetMap…')).not.toBeInTheDocument()
    })

    // Should still only be called once due to caching
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('ignora direcciones vacías o con solo espacios', () => {
    render(<OpenStreetMapView address="   " />)

    expect(
      screen.getByText('No se ha especificado una dirección válida para mostrar el mapa.')
    ).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
