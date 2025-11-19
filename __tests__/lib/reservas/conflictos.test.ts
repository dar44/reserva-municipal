import { hasRecintoConflicts } from '@/lib/reservas/conflicts'

type QueryResponse = { data: Array<{ id: number }> | null; error: { message: string } | null }

type QueryBuilder = {
  select: jest.Mock
  eq: jest.Mock
  lt: jest.Mock
  gt: jest.Mock
  neq: jest.Mock
  in: jest.Mock
  not: jest.Mock
  limit: jest.Mock<Promise<QueryResponse>>
}

function createQueryBuilder (response: QueryResponse): QueryBuilder {
  const builder: Partial<QueryBuilder> = {}
  builder.select = jest.fn().mockReturnValue(builder)
  builder.eq = jest.fn().mockReturnValue(builder)
  builder.lt = jest.fn().mockReturnValue(builder)
  builder.gt = jest.fn().mockReturnValue(builder)
  builder.neq = jest.fn().mockReturnValue(builder)
  builder.in = jest.fn().mockReturnValue(builder)
  builder.not = jest.fn().mockReturnValue(builder)
  builder.limit = jest.fn().mockResolvedValue(response)
  return builder as QueryBuilder
}

describe('hasRecintoConflicts', () => {
  const baseOptions = {
    recintoId: 77,
    startAt: '2024-05-01T10:00:00Z',
    endAt: '2024-05-01T11:00:00Z',
  }

  it('detecta conflictos ciudadanos y excluye canceladas por defecto', async () => {
    const courseQuery = createQueryBuilder({ data: [], error: null })
    const citizenQuery = createQueryBuilder({ data: [{ id: 1 }], error: null })
    const supabase = {
      from: jest.fn((table: string) => (table === 'curso_reservas' ? courseQuery : citizenQuery)),
    }

    const result = await hasRecintoConflicts({
      supabase: supabase as any,
      ...baseOptions,
    })

    expect(result).toEqual({ conflict: true, error: null })
    expect(courseQuery.select).toHaveBeenCalledWith('id')
    expect(citizenQuery.not).toHaveBeenCalledWith('status', 'eq', 'cancelada')
  })

  it('aplica filtros personalizados y omite IDs cuando se indican', async () => {
    const courseQuery = createQueryBuilder({ data: [{ id: 10 }], error: null })
    const citizenQuery = createQueryBuilder({ data: [], error: null })
    const supabase = {
      from: jest.fn((table: string) => (table === 'curso_reservas' ? courseQuery : citizenQuery)),
    }

    const result = await hasRecintoConflicts({
      supabase: supabase as any,
      ...baseOptions,
      ignoreCitizenReservationId: 55,
      ignoreCourseReservationId: 88,
      citizenStatuses: ['pendiente', 'aprobada'],
      courseStatuses: ['aprobada'],
    })

    expect(result).toEqual({ conflict: true, error: null })
    expect(citizenQuery.neq).toHaveBeenCalledWith('id', 55)
    expect(courseQuery.neq).toHaveBeenCalledWith('id', 88)
    expect(citizenQuery.in).toHaveBeenCalledWith('status', ['pendiente', 'aprobada'])
    expect(courseQuery.in).toHaveBeenCalledWith('status', ['aprobada'])
    expect(citizenQuery.not).not.toHaveBeenCalled()
  })

  it('propaga errores cuando la consulta de cursos falla', async () => {
    const failingCourseQuery = createQueryBuilder({ data: null, error: { message: 'db down' } })
    const citizenQuery = createQueryBuilder({ data: [], error: null })
    const supabase = {
      from: jest.fn((table: string) => (table === 'curso_reservas' ? failingCourseQuery : citizenQuery)),
    }

    const result = await hasRecintoConflicts({
      supabase: supabase as any,
      ...baseOptions,
    })

    expect(result).toEqual({ conflict: false, error: { message: 'db down' } })
    expect(citizenQuery.select).not.toHaveBeenCalled()
  })
})