import { render, screen } from '@testing-library/react'

import { Button } from '@/components/ui/button'

describe('Button (shadcn)', () => {
  it('renderiza con la variante por defecto', () => {
    render(<Button>Primario</Button>)
    const button = screen.getByRole('button', { name: 'Primario' })
    expect(button).toHaveClass('bg-primary')
  })

  it('admite la variante de enlace y tamaños', () => {
    render(<Button variant="link" size="sm">Enlace</Button>)
    const button = screen.getByRole('button', { name: 'Enlace' })
    expect(button).toHaveClass('text-primary')
    expect(button).toHaveClass('h-8')
  })

  it('usa Slot cuando asChild es true', () => {
    render(<Button asChild><a href="#">Ir</a></Button>)
    const link = screen.getByRole('link', { name: 'Ir' })
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})