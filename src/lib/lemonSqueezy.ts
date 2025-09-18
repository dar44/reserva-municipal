import crypto from 'node:crypto'

type CheckoutRequest = {
  variantId: string
  storeId: string
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

export async function createCheckout ({
  variantId,
  storeId,
  customPrice,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata
}: CheckoutRequest): Promise<CheckoutResponse> {
  const apiKey = getLemonApiKey()
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'reserva-municipal/1.0'
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: customerEmail,
            custom: metadata
          },
          product_options: {
            redirect_url: successUrl,
            cancel_url: cancelUrl
          },
          custom_price: customPrice,
          store_id: Number(storeId)
        },
        relationships: {
          store: {
            data: { type: 'stores', id: storeId }
          },
          variant: {
            data: { type: 'variants', id: variantId }
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