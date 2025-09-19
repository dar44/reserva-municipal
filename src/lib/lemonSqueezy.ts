import crypto from 'node:crypto'
type CheckoutRequest = {
  variantId: string
  storeId?: string
  customPrice: number
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata: Record<string, string | number | boolean | null | undefined>
}

type CheckoutResponse = {
  id: string
  url: string
}

type VariantInfo = {
  variantId: string
  storeId: string
}

const API_BASE_URL = 'https://api.lemonsqueezy.com/v1'
const VARIANT_CACHE = new Map<string, VariantInfo>()

function requiredEnv (name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

export function getLemonApiKey (): string {
  return requiredEnv('LEMONSQUEEZY_API_KEY')
}

export function getReservaVariantId (): string {
  return requiredEnv('LEMONSQUEEZY_VARIANT_RESERVA_ID')
}

export function getInscripcionVariantId (): string {
  return requiredEnv('LEMONSQUEEZY_VARIANT_INSCRIPCION_ID')
}

export function getLemonStoreId (): string {
  return requiredEnv('LEMONSQUEEZY_STORE_ID')
}

export function getWebhookSecret (): string {
  return requiredEnv('LEMONSQUEEZY_WEBHOOK_SECRET')
}

function serializeMetadata (metadata: CheckoutRequest['metadata']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, value === null ? '' : String(value)])
  )
}

async function lemonFetch (path: string, init: RequestInit = {}): Promise<Response> {
  const apiKey = getLemonApiKey()
  const headers = new Headers(init.headers ?? {})
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${apiKey}`)
  headers.set('User-Agent', 'reserva-municipal/1.0')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/vnd.api+json')
  }
  try {
    return await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    throw new Error(`No se pudo conectar con Lemon Squeezy: ${message}`)
  }
}

async function fetchVariant (variantId: string): Promise<VariantInfo | null> {
  const cache = VARIANT_CACHE.get(variantId)
  if (cache) return cache

  const response = await lemonFetch(`/variants/${variantId}`)
  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: {
      id?: string
      attributes?: {
        store_id?: number
      }
    }
  }

  const id = payload.data?.id
  const storeId = payload.data?.attributes?.store_id
  if (!id) {
    throw new Error('Respuesta de Lemon Squeezy incompleta al obtener la variante')
  }

  const info: VariantInfo = {
    variantId: id,
    storeId: storeId != null ? String(storeId) : getLemonStoreId()
  }
  VARIANT_CACHE.set(variantId, info)
  VARIANT_CACHE.set(id, info)
  return info
}

async function fetchVariantFromProduct (productId: string): Promise<VariantInfo | null> {
  const cache = VARIANT_CACHE.get(productId)
  if (cache) return cache

  const response = await lemonFetch(`/products/${productId}?include=variants`)
  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: {
      relationships?: {
        variants?: {
          data?: Array<{ id?: string | null }>
        }
      }
    }
    included?: Array<{
      type?: string
      id?: string
      attributes?: {
        store_id?: number
      }
    }>
  }

  const variantsRel = payload.data?.relationships?.variants?.data ?? []
  const firstVariantId = variantsRel.find((variant) => Boolean(variant?.id))?.id

  const includedVariants = (payload.included ?? []).filter((item) => item.type === 'variants')
  const variantRecord = includedVariants.find((variant) => variant.id === firstVariantId) ?? includedVariants[0]

  const resolvedId = variantRecord?.id
  if (!resolvedId) {
    throw new Error('El producto de Lemon Squeezy no tiene variantes disponibles')
  }

  const storeId = variantRecord?.attributes?.store_id
  const info: VariantInfo = {
    variantId: resolvedId,
    storeId: storeId != null ? String(storeId) : getLemonStoreId()
  }
  VARIANT_CACHE.set(productId, info)
  VARIANT_CACHE.set(resolvedId, info)
  return info
}

async function resolveVariant (value: string): Promise<VariantInfo> {
  const direct = await fetchVariant(value)
  if (direct) return direct

  const fromProduct = await fetchVariantFromProduct(value)
  if (fromProduct) return fromProduct

  throw new Error(`No se encontró la variante o producto ${value} en Lemon Squeezy`)
}

export async function createCheckout ({
  variantId,
  storeId,
  customPrice,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata
}: CheckoutRequest): Promise<CheckoutResponse> {
  const variantInfo = await resolveVariant(variantId)
  const resolvedStoreId = storeId && storeId === variantInfo.storeId
    ? storeId
    : variantInfo.storeId

  const response = await lemonFetch('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: customerEmail,
            custom: serializeMetadata(metadata)
          },
          checkout_options: {
            success_url: successUrl,
            cancel_url: cancelUrl
          },
          custom_price: customPrice,
          ...(resolvedStoreId ? { store_id: Number(resolvedStoreId) } : {})
        },
        relationships: {
          ...(resolvedStoreId
            ? {
                store: {
                  data: { type: 'stores', id: resolvedStoreId }
                }
              }
            : {}),
          variant: {
            data: { type: 'variants', id: variantInfo.variantId }
          }
        }
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: {
      id: string
      attributes?: {
        url?: string
      }
    }
  }

  const checkoutUrl = payload.data?.attributes?.url
  const checkoutId = payload.data?.id

  if (!checkoutUrl || !checkoutId) {
    throw new Error('Respuesta de Lemon Squeezy incompleta')
  }

  return { id: checkoutId, url: checkoutUrl }
}

export function verifyWebhookSignature (payload: string, signature: string | null): boolean {
  if (!signature) return false
  const secret = getWebhookSecret()
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload, 'utf8')
  const digest = hmac.digest('hex')
  const received = Buffer.from(signature, 'hex')
  const expected = Buffer.from(digest, 'hex')
  if (received.length !== expected.length) {
    return false
  }
  return crypto.timingSafeEqual(received, expected)
}