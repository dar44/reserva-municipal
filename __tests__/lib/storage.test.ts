import nodeCrypto from 'node:crypto'
import {
  USER_PROFILE_FOLDER,
  buildStorageUrl,
  buildUserProfilePath,
  getPublicStorageUrl,
  getPublicUrlFromStorage,
  isUserProfileObject,
  listBucketPrefix,
} from '@/lib/storage'

describe('storage helpers', () => {
  describe('getPublicStorageUrl', () => {
    it('devuelve la URL pública cuando bucket y path son válidos', () => {
      const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://files.test/avatar.png' } })
      const supabase = {
        storage: { from: jest.fn().mockReturnValue({ getPublicUrl }) },
      }

      const url = getPublicStorageUrl(supabase as any, 'avatar.png', 'usuarios')

      expect(url).toBe('https://files.test/avatar.png')
      expect(getPublicUrl).toHaveBeenCalledWith('avatar.png')
    })

    it('retorna null cuando falta bucket o path', () => {
      const supabase = { storage: { from: jest.fn() } }

      expect(getPublicStorageUrl(supabase as any, null, 'usuarios')).toBeNull()
      expect(getPublicStorageUrl(supabase as any, 'avatar.png', null)).toBeNull()
    })
  })

  describe('getPublicUrlFromStorage', () => {
    it('delegates en getPublicStorageUrl con los campos recibidos', () => {
      const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://files.test/profile.png' } })
      const from = jest.fn().mockReturnValue({ getPublicUrl })
      const supabase = { storage: { from } }

      const url = getPublicUrlFromStorage(supabase as any, { image: 'profile.png', image_bucket: 'usuarios' })

      expect(url).toBe('https://files.test/profile.png')
      expect(from).toHaveBeenCalledWith('usuarios')
    })
  })

  describe('buildUserProfilePath', () => {
    let randomSpy: jest.SpyInstance<string, []>

    beforeEach(() => {
      const cryptoObj = (globalThis.crypto ?? nodeCrypto.webcrypto) as Crypto
      randomSpy = jest.spyOn(cryptoObj, 'randomUUID').mockReturnValue('rnd')
      if (!globalThis.crypto) {
        ;(globalThis as typeof globalThis & { crypto?: Crypto }).crypto = cryptoObj
      }
    })

    afterEach(() => {
      randomSpy.mockRestore()
    })

    it('normaliza el nombre y conserva la extensión en minúsculas', () => {
      const path = buildUserProfilePath('uid-123', 'Mi Foto!!.PNG')

      expect(path).toBe(`${USER_PROFILE_FOLDER}/uid-123/Mi-Foto-rnd.png`)
    })
  })

  describe('isUserProfileObject', () => {
    it('verifica si el path pertenece al usuario', () => {
      expect(isUserProfileObject(`${USER_PROFILE_FOLDER}/uid-9/avatar.png`, 'uid-9')).toBe(true)
      expect(isUserProfileObject(`${USER_PROFILE_FOLDER}/uid-8/avatar.png`, 'uid-9')).toBe(false)
      expect(isUserProfileObject(null, 'uid-9')).toBe(false)
    })
  })

  describe('buildStorageUrl', () => {
    it('prefiere URLs firmadas cuando están disponibles', async () => {
      const createSignedUrl = jest.fn().mockResolvedValue({ data: { signedUrl: 'https://signed' }, error: null })
      const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://public' } })
      const client = {
        storage: {
          from: jest.fn().mockReturnValue({ createSignedUrl, getPublicUrl }),
        },
      }

      const url = await buildStorageUrl(client as any, 'usuarios', 'avatar.png')

      expect(url).toBe('https://signed')
      expect(getPublicUrl).not.toHaveBeenCalled()
    })

    it('usa la URL pública como fallback cuando createSignedUrl falla', async () => {
      const createSignedUrl = jest.fn().mockResolvedValue({ data: { signedUrl: null }, error: { message: 'denied' } })
      const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://public' } })
      const client = {
        storage: {
          from: jest.fn().mockReturnValue({ createSignedUrl, getPublicUrl }),
        },
      }

      const url = await buildStorageUrl(client as any, 'usuarios', 'avatar.png')

      expect(url).toBe('https://public')
      expect(getPublicUrl).toHaveBeenCalledWith('avatar.png')
    })

    it('retorna null cuando faltan bucket o path', async () => {
      const client = { storage: { from: jest.fn() } }

      await expect(buildStorageUrl(client as any, null, 'avatar.png')).resolves.toBeNull()
      await expect(buildStorageUrl(client as any, 'usuarios', null)).resolves.toBeNull()
    })
  })

  describe('listBucketPrefix', () => {
    it('filtra objetos inválidos y compone paths completos', async () => {
      const list = jest.fn().mockResolvedValue({
        data: [
          { name: 'a.png', metadata: { size: 100 } },
          { name: null, metadata: { size: 50 } },
          { name: 'empty', metadata: {} },
        ],
        error: null,
      })
      const client = {
        storage: {
          from: jest.fn().mockReturnValue({ list }),
        },
      }

      const objects = await listBucketPrefix(client as any, 'usuarios', 'perfiles/uid-1/')

      expect(objects).toEqual([
        { name: 'a.png', path: 'perfiles/uid-1/a.png' },
      ])
    })

    it('devuelve arreglo vacío ante errores o datos nulos', async () => {
      const list = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
      const client = { storage: { from: jest.fn().mockReturnValue({ list }) } }

      const objects = await listBucketPrefix(client as any, 'usuarios', 'perfiles/')

      expect(objects).toEqual([])
    })
  })
})