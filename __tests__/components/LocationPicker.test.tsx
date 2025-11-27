import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type MapHandler = (event: { latlng: { lat: number; lng: number } }) => void

const mapOnMock: jest.Mock<void, [event: string, handler: MapHandler]> = jest.fn()
let storedHandler: MapHandler | null = null

mapOnMock.mockImplementation((event, handler) => {
  if (event === 'click') {
    storedHandler = handler
  }
})

interface MockMap {
  setView: (...args: any[]) => MockMap
  on: jest.Mock<void, [event: string, handler: MapHandler]>
  remove: () => void
  getZoom: () => number
}

const mapInstance: MockMap = {
  setView: jest.fn(() => mapInstance),
  on: mapOnMock,
  remove: jest.fn(),
  getZoom: jest.fn(() => 13),
}

interface MockMarker {
  addTo: (...args: any[]) => MockMarker
  setLatLng: (...args: any[]) => MockMarker
  remove: () => void
}

const markerInstance: MockMarker = {
  addTo: jest.fn(() => markerInstance),
  setLatLng: jest.fn(() => markerInstance),
  remove: jest.fn(),
}

interface MockTileLayer {
  addTo: (...args: any[]) => MockTileLayer
}

const tileLayerInstance: MockTileLayer = {
  addTo: jest.fn(() => tileLayerInstance),
}

const leafletNamespace = {
  map: jest.fn(() => mapInstance),
  tileLayer: jest.fn(() => tileLayerInstance),
  marker: jest.fn(() => markerInstance),
}

const ensureLeafletMock = jest.fn(async () => {
  window.L = leafletNamespace as any
  return leafletNamespace as any
})

jest.mock('@/lib/leaflet', () => ({
  DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 },
  ensureLeaflet: ensureLeafletMock,
}))

describe('LocationPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    storedHandler = null
    ;(global.fetch as jest.Mock | undefined)?.mockReset?.()
    global.fetch = jest.fn(async (input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/search')) {
        return {
          ok: true,
          json: async () => [
            {
              place_id: 101,
              display_name: 'Calle Falsa 123, Madrid',
              lat: '40.1',
              lon: '-3.7',
              address: {
                road: 'Calle Falsa',
                house_number: '123',
                city: 'Madrid',
                postcode: '28080',
                state: 'Madrid',
              },
            },
          ],
        } as Response
      }
      return {
        ok: true,
        json: async () => ({
          display_name: 'Click result',
          place_id: 202,
          address: {
            road: 'Otra calle',
            city: 'Madrid',
            postcode: '28080',
            state: 'Madrid',
          },
          lat: '40.2',
          lon: '-3.71',
        }),
      } as Response
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('realiza búsquedas y actualiza los campos al seleccionar una sugerencia', async () => {
    jest.useFakeTimers()
    const { default: LocationPicker } = await import('@/components/LocationPicker')
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(
      <LocationPicker
        valueNames={{
          address: 'address',
          city: 'city',
          postalCode: 'postal',
          province: 'province',
          region: 'region',
          latitude: 'lat',
          longitude: 'lng',
        }}
      />
    )

    const search = screen.getByRole('searchbox')
    await user.type(search, 'Mad')

    await act(async () => {
      jest.advanceTimersByTime(400)
      await Promise.resolve()
    })

    const suggestion = await screen.findByText('Calle Falsa 123, Madrid')
    expect(suggestion).toBeInTheDocument()

    await act(async () => {
      suggestion.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })

    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle Falsa 123')
    expect((document.querySelector('input[name="lat"]') as HTMLInputElement).value).toBe('40.1')
    expect((document.querySelector('input[name="lng"]') as HTMLInputElement).value).toBe('-3.7')
  })

  it('actualiza coordenadas tras click en el mapa', async () => {
    const { default: LocationPicker } = await import('@/components/LocationPicker')

    render(
      <LocationPicker
        valueNames={{ address: 'address', latitude: 'lat', longitude: 'lng' }}
        defaultValues={{ address: '', latitude: undefined, longitude: undefined }}
      />
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(ensureLeafletMock).toHaveBeenCalled()
    expect(storedHandler).toBeTruthy()

    await act(async () => {
      await storedHandler?.({ latlng: { lat: 40.25, lng: -3.71 } })
    })

    expect((document.querySelector('input[name="lat"]') as HTMLInputElement).value).toBe('40.25')
    expect((document.querySelector('input[name="lng"]') as HTMLInputElement).value).toBe('-3.71')
  })
})