import axios, { type AxiosResponseHeaders, type RawAxiosResponseHeaders } from 'axios';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type ApiRouteContext = Readonly<{
  params: Promise<{
    path: string[];
  }>;
}>;

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const OMITTED_REQUEST_HEADERS = new Set([...HOP_BY_HOP_HEADERS, 'content-length', 'host']);
const OMITTED_RESPONSE_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  'content-encoding',
  'content-length',
  'set-cookie',
]);

const getProxyTarget = (): URL | undefined => {
  const configuredTarget = process.env.API_PROXY_TARGET?.trim();

  if (!configuredTarget) {
    return undefined;
  }

  try {
    const target = new URL(configuredTarget);

    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return undefined;
    }

    return target;
  } catch {
    return undefined;
  }
};

const requestHeaders = (request: NextRequest): Record<string, string> => {
  const headers: Record<string, string> = {};

  request.headers.forEach((value, name) => {
    if (!OMITTED_REQUEST_HEADERS.has(name.toLowerCase())) {
      headers[name] = value;
    }
  });

  return headers;
};

const responseHeaders = (
  upstreamHeaders: RawAxiosResponseHeaders | AxiosResponseHeaders,
): Headers => {
  const headers = new Headers();

  Object.entries(upstreamHeaders).forEach(([name, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !OMITTED_RESPONSE_HEADERS.has(name.toLowerCase())
    ) {
      headers.set(name, Array.isArray(value) ? value.join(', ') : String(value));
    }
  });

  const cookies = upstreamHeaders['set-cookie'];

  if (Array.isArray(cookies)) {
    cookies.forEach((cookie) => headers.append('set-cookie', cookie));
  } else if (cookies) {
    headers.append('set-cookie', String(cookies));
  }

  return headers;
};

const proxyRequest = async (request: NextRequest, context: ApiRouteContext): Promise<Response> => {
  const proxyTarget = getProxyTarget();

  if (!proxyTarget) {
    return Response.json({ error: 'API proxy is not configured.' }, { status: 500 });
  }

  const { path } = await context.params;
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join('/');
  const upstreamUrl = new URL(`/api/${encodedPath}`, proxyTarget);
  upstreamUrl.search = request.nextUrl.search;
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const upstreamResponse = await axios.request<ArrayBuffer>({
      url: upstreamUrl.toString(),
      method: request.method,
      headers: requestHeaders(request),
      data: hasBody ? Buffer.from(await request.arrayBuffer()) : undefined,
      responseType: 'arraybuffer',
      maxRedirects: 0,
      validateStatus: () => true,
    });

    return new Response(request.method === 'HEAD' ? null : upstreamResponse.data, {
      status: upstreamResponse.status,
      headers: responseHeaders(upstreamResponse.headers),
    });
  } catch {
    return Response.json({ error: 'API proxy request failed.' }, { status: 502 });
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const PUT = proxyRequest;
export const HEAD = proxyRequest;
