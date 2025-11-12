/**
 * @jest-environment node
 */

describe('POST /api/signup', () => {
  const ORIGINAL_ENV = process.env;

  // helpers que reutilizaremos en los tests
  const setEnv = () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.test',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    };
  };

  const mockNextServer = () => {
    jest.doMock('next/server', () => {
      // import real para no romper tipos
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const actual = jest.requireActual('next/server');
      return {
        ...actual,
        NextResponse: { ...actual.NextResponse, json: jest.fn() },
      };
    });
  };

  const mockSupabaseAdmin = () => {
    jest.doMock('@/lib/supabaseAdmin', () => {
      const createUser = jest.fn();
      const updateUserById = jest.fn();
      return {
        __esModule: true,
        supabaseAdmin: {
          auth: { admin: { createUser, updateUserById } },
        },
        __mock: { createUser, updateUserById },
      };
    });
  };

  beforeEach(() => {
    jest.resetModules(); // importantísimo para re-evaluar con el nuevo env
    setEnv();
    mockNextServer();
    mockSupabaseAdmin();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  it('valida env + signup OK', async () => {
  // importar mocks ya registrados con doMock en el beforeEach
  const { __mock: sa } = (await import('@/lib/supabaseAdmin')) as any;
  const { NextResponse } = await import('next/server');

  // prepara el spy de json para que devuelva algo asertable
  const jsonSpy = (NextResponse as any).json as jest.Mock;
  jsonSpy.mockImplementation((body: any, init?: any) => ({ body, init }));

  // configura los mocks para el flujo OK
  sa.createUser.mockResolvedValue({ data: { user: { id: 'uid-123' } }, error: null });
  sa.updateUserById.mockResolvedValue({ error: null });

  // importa el handler ya con los mocks activos
  const { POST } = await import('@/app/api/signup/route');

  // request
  const req = new Request('http://localhost/api/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'secret',
      name: 'Ada',
      surname: 'Lovelace',
      dni: '38373926K',
      phone: '653890271',
    }),
  });

  // ejc handler
  const res = await POST(req);

  // Assert
  expect(sa.createUser).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'secret',
    email_confirm: true,
    user_metadata: {
      name: 'Ada',
      surname: 'Lovelace',
      dni: '38373926K',
      phone: '653890271',
    },
    app_metadata: { role: 'citizen' },
  });
  expect(sa.updateUserById).toHaveBeenCalledWith('uid-123', {
    app_metadata: { role: 'citizen' },
  });

  // NextResponse.json fue llamado una vez SIN segundo argumento:
  expect(jsonSpy).toHaveBeenCalledTimes(1);
  expect(jsonSpy).toHaveBeenCalledWith({ ok: true, uid: 'uid-123' });

  expect(res).toEqual({ body: { ok: true, uid: 'uid-123' }, init: undefined });
});

  it('400 cuando createUser falla', async () => {
    const { __mock: sa } = (await import('@/lib/supabaseAdmin')) as any;
    const { NextResponse } = await import('next/server');
    (NextResponse as any).json.mockImplementation((body: any, init?: any) => ({ body, init }));

    sa.createUser.mockResolvedValue({ data: { user: null }, error: { message: 'email_exists' } });

    const { POST } = await import('@/app/api/signup/route');

    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'secret',
        name: 'Ada',
        surname: 'Lovelace',
        dni: '38373926K',
        phone: '653890271',
      }),
    });

    const res = await POST(req);

    expect(sa.updateUserById).not.toHaveBeenCalled();
    expect((NextResponse as any).json).toHaveBeenCalledWith(
      { message: 'email_exists' },
      { status: 400 }
    );
    expect(res).toEqual({ body: { message: 'email_exists' }, init: { status: 400 } });
  });

  it('400 cuando updateUserById falla', async () => {
    const { __mock: sa } = (await import('@/lib/supabaseAdmin')) as any;
    const { NextResponse } = await import('next/server');
    (NextResponse as any).json.mockImplementation((body: any, init?: any) => ({ body, init }));

    sa.createUser.mockResolvedValue({ data: { user: { id: 'uid-456' } }, error: null });
    sa.updateUserById.mockResolvedValue({ error: { message: 'update_failed' } });

    const { POST } = await import('@/app/api/signup/route');

    const req = new Request('http://localhost/api/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'secret',
        name: 'Ada',
        surname: 'Lovelace',
        dni: '38373926K',
        phone: '653890271',
      }),
    });

    const res = await POST(req);

    expect((NextResponse as any).json).toHaveBeenCalledWith(
      { error: 'update_failed' },
      { status: 400 }
    );
    expect(res).toEqual({ body: { error: 'update_failed' }, init: { status: 400 } });
  });

  it('500 cuando el body no es JSON válido', async () => {
    const { __mock: sa } = (await import('@/lib/supabaseAdmin')) as any;
    const { NextResponse } = await import('next/server');
    (NextResponse as any).json.mockImplementation((body: any, init?: any) => ({ body, init }));

    const { POST } = await import('@/app/api/signup/route');

    // request inválida simulada
    const badReq = {
      headers: { get: () => 'application/json' },
      json: jest.fn().mockRejectedValue(new Error('invalid_payload')),
      url: 'http://localhost/api/signup',
    } as unknown as Request;

    const res = await POST(badReq);

    expect(sa.createUser).not.toHaveBeenCalled();
    expect((NextResponse as any).json).toHaveBeenCalledWith(
      { error: 'invalid_payload' },
      { status: 500 }
    );
    expect(res).toEqual({ body: { error: 'invalid_payload' }, init: { status: 500 } });
  });
});
