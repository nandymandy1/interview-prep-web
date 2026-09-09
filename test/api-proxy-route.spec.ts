import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('axios', () => ({
  default: { request: requestMock },
}));

const { GET, HEAD, POST } = await import('@/app/api/[...path]/route');

const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

beforeEach(() => {
  process.env.API_PROXY_TARGET = 'https://api.example.test';
  requestMock.mockReset();
});

afterEach(() => {
  delete process.env.API_PROXY_TARGET;
});

describe('runtime API proxy route', () => {
  it('fails clearly when the runtime target is missing', async () => {
    delete process.env.API_PROXY_TARGET;

    const response = await GET(
      new NextRequest('https://web.example.test/api/auth/me'),
      context(['auth', 'me']),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'API proxy is not configured.' });
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('preserves path, query, cookies, upstream status, and response body', async () => {
    requestMock.mockResolvedValue({
      status: 401,
      data: Buffer.from('{"error":"Authentication required"}'),
      headers: { 'content-type': 'application/json', 'content-length': '999' },
    });

    const response = await GET(
      new NextRequest('https://web.example.test/api/auth/me?source=browser', {
        headers: {
          accept: 'application/json',
          cookie: 'session=session-id',
          host: 'web.example.test',
        },
      }),
      context(['auth', 'me']),
    );

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.test/api/auth/me?source=browser',
        method: 'GET',
        headers: expect.objectContaining({
          accept: 'application/json',
          cookie: 'session=session-id',
        }),
        data: undefined,
      }),
    );
    expect(requestMock.mock.calls[0]?.[0].headers).not.toHaveProperty('host');
    expect(response.status).toBe(401);
    expect(response.headers.get('content-length')).toBeNull();
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
  });

  it('forwards request bodies and upstream session cookies', async () => {
    requestMock.mockResolvedValue({
      status: 200,
      data: Buffer.from('{"user":{"id":"user-1"}}'),
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'gzip',
        'set-cookie': ['session=abc; Path=/; HttpOnly; SameSite=Lax'],
      },
    });

    const response = await POST(
      new NextRequest('https://web.example.test/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.test', password: 'secret' }),
      }),
      context(['auth', 'login']),
    );

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.test/api/auth/login',
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        data: expect.any(Buffer),
      }),
    );
    expect(response.headers.get('set-cookie')).toContain('session=abc');
    expect(response.headers.get('content-encoding')).toBeNull();
  });

  it('returns no body for HEAD while preserving upstream status', async () => {
    requestMock.mockResolvedValue({ status: 204, data: Buffer.alloc(0), headers: {} });

    const response = await HEAD(
      new NextRequest('https://web.example.test/api/auth/me', { method: 'HEAD' }),
      context(['auth', 'me']),
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });
});
