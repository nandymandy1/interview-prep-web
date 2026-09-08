// Pure proxy-target helpers shared by next.config.ts and unit tests.
// Kept dependency-free so the Next config loader can import this file directly.

export const resolveApiProxyTarget = (value: string | undefined): string | undefined => {
  const normalized = value?.trim().replace(/\/+$/, '');
  if (!normalized) {
    return undefined;
  }

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return normalized;
};

export const resolveProxyDestination = (
  apiProxyTarget: string | undefined,
  path: string,
): string | undefined => (apiProxyTarget === undefined ? undefined : `${apiProxyTarget}${path}`);
