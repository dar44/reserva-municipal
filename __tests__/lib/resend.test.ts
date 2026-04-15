/**
 * @jest-environment node
 */

describe('resend client', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('no crea cliente cuando falta RESEND_API_KEY', async () => {
    delete process.env.RESEND_API_KEY

    const { getResendClient } = await import('@/lib/resend')

    expect(getResendClient()).toBeNull()
  })

  it('crea y reutiliza el cliente cuando RESEND_API_KEY existe', async () => {
    process.env.RESEND_API_KEY = 're_test_key'

    const { getResendClient } = await import('@/lib/resend')

    const firstClient = getResendClient()
    const secondClient = getResendClient()

    expect(firstClient).not.toBeNull()
    expect(secondClient).toBe(firstClient)
  })
})
