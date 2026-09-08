import { describe, expect, it } from 'vitest';
import { resolveApiProxyTarget, resolveProxyDestination } from '@/lib/proxy-target';

describe('API proxy target resolution', () => {
  it('trims whitespace and strips trailing slashes', () => {
    expect(resolveApiProxyTarget('  http://localhost:4000/  ')).toBe('http://localhost:4000');
  });

  it('rejects missing, blank, non-HTTP, and malformed values', () => {
    expect(resolveApiProxyTarget(undefined)).toBeUndefined();
    expect(resolveApiProxyTarget('   ')).toBeUndefined();
    expect(resolveApiProxyTarget('not-a-url')).toBeUndefined();
    expect(resolveApiProxyTarget('ftp://files.local')).toBeUndefined();
  });

  it('maps proxied paths onto the Express origin', () => {
    const target = resolveApiProxyTarget('http://localhost:4000');
    expect(resolveProxyDestination(target, '/api/auth/me')).toBe(
      'http://localhost:4000/api/auth/me',
    );
    expect(resolveProxyDestination(target, '/api/kits')).toBe('http://localhost:4000/api/kits');
  });

  it('resolves to undefined without a target so rewrites stay empty', () => {
    expect(resolveProxyDestination(undefined, '/api/kits')).toBeUndefined();
  });
});
