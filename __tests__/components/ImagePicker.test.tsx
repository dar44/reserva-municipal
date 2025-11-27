/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/lib/recintoImages', () => ({
  RECINTO_DEFAULT_IMAGES: [{ path: 'recinto/default.jpg', label: 'Recinto default' }],
  RECINTO_DEFAULT_IMAGE_PATH: 'recinto/default.jpg',
  isDefaultRecintoImage: (img?: string | null) => img === 'recinto/default.jpg',
}))

jest.mock('@/lib/cursoImages', () => ({
  COURSE_IMAGE_BUCKET: 'course-defaults',
  isCourseDefaultImage: () => true,
}))

jest.mock('@/lib/storage', () => ({
  USER_DEFAULTS_FOLDER: 'defaults',
  USER_STORAGE_BUCKET: 'avatars',
}))

// helper para obtener el input hidden del modo
function getHiddenModeInput() {
  return screen
    .getAllByDisplayValue('keep')
    .find((el) => (el as HTMLInputElement).name === 'image_mode') as HTMLInputElement
}

describe('RecintoImagePicker', () => {
  it('rellena la imagen por defecto y actualiza el modo correctamente', async () => {
    const { default: RecintoImagePicker } = await import('@/components/RecintoImagePicker')

    render(<RecintoImagePicker initialImage="recinto/default.jpg" />)

    const hidden = getHiddenModeInput()
    expect(hidden).toHaveAttribute('name', 'image_mode')

    const defaultRadio = screen.getByRole('radio', { name: /Usar imagen predeterminada/ })
    await userEvent.click(defaultRadio)

    expect(hidden.value).toBe('default')
    expect(screen.getByRole('combobox')).toHaveValue('recinto/default.jpg')
  })
})

describe('CourseImagePicker', () => {
  it('empieza en modo mantener y permite seleccionar la imagen predeterminada', async () => {
    const { default: CourseImagePicker } = await import('@/components/CursoImagePicker')
    const defaults = [{ path: 'course/a.jpg', name: 'A' }]

    render(
      <CourseImagePicker
        defaultImages={defaults}
        initialImage="course/a.jpg"
        initialBucket="course-defaults"
      />,
    )

    const hidden = getHiddenModeInput()
    expect(hidden).toBeInTheDocument()

    const defaultRadio = screen.getByRole('radio', { name: /Usar imagen predeterminada/ })
    await userEvent.click(defaultRadio)

    expect(screen.getByRole('combobox')).toHaveValue('course/a.jpg')
    expect(hidden.value).toBe('default')
  })
})

describe('UserImagePicker', () => {
  it('detecta correctamente una imagen por defecto y permite borrarla', async () => {
    const { default: UserImagePicker } = await import('@/components/UserImagePicker')
    const defaults = [{ path: 'defaults/a.png', name: 'Avatar A' }]

    render(
      <UserImagePicker
        defaultImages={defaults}
        initialImage="defaults/a.png"
        initialBucket="avatars"
      />,
    )

    const hidden = getHiddenModeInput()
    expect(hidden).toBeInTheDocument()

    const combo = screen.getByRole('combobox') as HTMLSelectElement
    expect(combo).toHaveValue('defaults/a.png')

    await userEvent.click(screen.getByRole('radio', { name: 'Sin imagen' }))

    expect(hidden.value).toBe('none')
    expect(combo).toBeDisabled()
  })
})
