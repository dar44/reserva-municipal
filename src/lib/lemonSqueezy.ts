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

type CheckoutDetails = {
  id: string
  status?: string | null
  orderId?: string | null
}

type OrderDetails = {
  id: string
  status?: string | null
  total?: number | null
  currency?: string | null
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

  // ✅ JSON:API siempre
  headers.set('Accept', 'application/vnd.api+json')
  headers.set('Authorization', `Bearer ${apiKey}`)
  headers.set('User-Agent', 'reserva-municipal/1.0')

  // Para POST/PUT con body
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
  cancelUrl: _cancelUrl, // <- no se usa en el payload
  metadata
}: CheckoutRequest): Promise<CheckoutResponse> {
  void _cancelUrl // para evitar linter no usado
  const variantInfo = await resolveVariant(variantId)
  const resolvedStoreId = storeId && storeId === variantInfo.storeId
    ? storeId
    : variantInfo.storeId

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        custom_price: customPrice, // requiere "Allow custom price" en la variante
        checkout_data: {
          email: customerEmail,
          custom: serializeMetadata(metadata)
        },
        //  redirect_url va en product_options
        product_options: {
          redirect_url: successUrl,
          enabled_variants: [String(variantInfo.variantId)]
        }

      },
      relationships: {
        ...(resolvedStoreId ? {
          store: { data: { type: 'stores', id: String(resolvedStoreId) } }
        } : {}),
        variant: { data: { type: 'variants', id: String(variantInfo.variantId) } }
      }
    }
  }

  const response = await lemonFetch('/checkouts', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: { id: string; attributes?: { url?: string } }
  }

  const checkoutUrl = payload.data?.attributes?.url
  const checkoutId = payload.data?.id
  if (!checkoutUrl || !checkoutId) throw new Error('Respuesta de Lemon Squeezy incompleta')

  return { id: checkoutId, url: checkoutUrl }
}

type CheckoutApiResponse = {
  data?: {
    id?: string
    attributes?: Record<string, unknown>
    relationships?: Record<
      string,
      { data?: { id?: string | number | null } | Array<{ id?: string | number | null }> | null }
    >
  }
  included?: Array<{
    type?: string
    id?: string | number | null
    attributes?: Record<string, unknown>
  }>
}

export type CheckoutStatusResult = {
  id: string
  status?: string
  orderId?: string | null
}

export async function getCheckoutStatus (checkoutId: string): Promise<CheckoutStatusResult | null> {
  const response = await lemonFetch(`/checkouts/${checkoutId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as CheckoutApiResponse

  const id = payload.data?.id
  if (!id) {
    throw new Error('Respuesta de Lemon Squeezy incompleta al consultar el checkout')
  }

  const attributes = (payload.data?.attributes ?? {}) as Record<string, unknown>
  const relationships = (payload.data?.relationships ?? {}) as Record<
    string,
    { data?: { id?: string | number | null } | Array<{ id?: string | number | null }> | null }
  >
  const included = (payload.included ?? []) as Array<{
    type?: string
    id?: string | number | null
    attributes?: Record<string, unknown>
  }>

  let status: string | undefined

  const directStatus = attributes['status']
  if (typeof directStatus === 'string') {
    status = directStatus
  } else {
    const checkoutStatus = attributes['checkout_status']
    if (typeof checkoutStatus === 'string') {
      status = checkoutStatus
    }
  }

  let orderId: string | null = null
  const attributeOrderId = attributes['order_id']
  if (typeof attributeOrderId === 'string' || typeof attributeOrderId === 'number') {
    orderId = String(attributeOrderId)
  } else {
    const firstOrderId = attributes['first_order_id']
    if (typeof firstOrderId === 'string' || typeof firstOrderId === 'number') {
      orderId = String(firstOrderId)
    }
  }

  const orderRelationship = relationships.order
  let orderRelationshipId: string | number | null | undefined
  if (orderRelationship) {
    if (Array.isArray(orderRelationship.data)) {
      orderRelationshipId = orderRelationship.data[0]?.id
    } else {
      orderRelationshipId = orderRelationship.data?.id
    }
  }

  if (orderId == null && (typeof orderRelationshipId === 'string' || typeof orderRelationshipId === 'number')) {
    orderId = String(orderRelationshipId)
  }

  const orderRecord = included.find((item) => item.type === 'orders' && (
    (orderId != null && item.id === orderId) ||
    (orderRelationshipId != null && item.id === orderRelationshipId)
  ))

  if (!status && orderRecord?.attributes) {
    const orderAttributes = orderRecord.attributes as Record<string, unknown>
    const orderStatus = orderAttributes['status']
    if (typeof orderStatus === 'string') {
      status = orderStatus
    }
  }

  return {
    id,
    status,
    orderId: orderId ?? null
  }
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

export async function getCheckout (checkoutId: string): Promise<CheckoutDetails> {
  const response = await lemonFetch(`/checkouts/${checkoutId}`)

  if (response.status === 404) {
    throw new Error('checkout_not_found')
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: {
      id?: string
      attributes?: {
        status?: string | null
        order_id?: number | string | null
      }
      relationships?: {
        order?: { data?: { id?: string | number | null } | null }
      }
    }
  }

  const data = payload.data ?? {}
  const attributes = data.attributes ?? {}
  const relationships = data.relationships ?? {}

  let orderId: string | null = null
  const relOrderId = relationships.order?.data?.id
  if (relOrderId != null) orderId = String(relOrderId)
  const attrOrderId = attributes.order_id
  if (!orderId && attrOrderId != null) orderId = String(attrOrderId)

  return {
    id: data.id ?? checkoutId,
    status: attributes.status ?? null,
    orderId
  }
}

export async function getOrder (orderId: string): Promise<OrderDetails> {
  const response = await lemonFetch(`/orders/${orderId}`)

  if (response.status === 404) {
    throw new Error('order_not_found')
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as {
    data?: {
      id?: string
      attributes?: {
        status?: string | null
        total?: number | null
        currency?: string | null
      }
    }
  }

  const data = payload.data ?? {}
  const attributes = data.attributes ?? {}

  return {
    id: data.id ?? orderId,
    status: attributes.status ?? null,
    total: attributes.total ?? null,
    currency: attributes.currency ?? null
  }
}
type OrdersListResponse = {
  data?: Array<{
    id?: string | number | null
    attributes?: {
      status?: string | null
      total?: number | null
      currency?: string | null
      [key: string]: unknown
    } | null
  }> | null
}

export async function findOrderByCheckoutId (checkoutId: string): Promise<OrderDetails | null> {
  const response = await lemonFetch(`/orders?filter[checkout_id]=${encodeURIComponent(checkoutId)}&page[size]=1`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Lemon Squeezy error: ${response.status} ${error}`)
  }

  const payload = await response.json() as OrdersListResponse
  const first = payload.data?.[0]
  if (!first?.id) {
    return null
  }

  const attributes = first.attributes ?? {}

  return {
    id: String(first.id),
    status: typeof attributes.status === 'string' ? attributes.status : null,
    total: typeof attributes.total === 'number' ? attributes.total : null,
    currency: typeof attributes.currency === 'string' ? attributes.currency : null
  }
}