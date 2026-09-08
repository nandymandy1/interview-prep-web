# Interview Prep Web

Next.js 16.3 + TypeScript frontend starter for the interview-preparation assessment.

## Stack

- Next.js 16.3 App Router
- React 19.2
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui-compatible component setup
- Axios only for HTTP
- TanStack React Query for server state
- Zustand for global client state

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default. The Express backend is expected on `http://localhost:4000` unless `API_PROXY_TARGET` is changed.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## HTTP rule

Application code must not use the Fetch API. All network traffic goes through `ApiClientService`, which is backed by Axios. Feature services depend on that client through constructor injection.

## Same-origin API proxy

Browser requests are intentionally same-origin on port 3000 in local development; Next proxies `/api` requests to Express on port 4000. The browser Network panel correctly shows `localhost:3000/api/...` — do not point browser code at the backend origin to change that display.

- `API_PROXY_TARGET` (default `http://localhost:4000`) is the server-side proxy destination. If it is missing or invalid, Next starts with a warning and `/api` requests are not proxied.
- `NEXT_PUBLIC_API_BASE_URL` stays `/api` so session cookies remain same-origin.

## Backend capability status

The backend currently registers only `/health` and `/api/auth`. Kit endpoints (`GET /api/kits`, kit detail/status/regenerate/question/practice routes) do not exist yet and answer `404 Route ... not found`; the dashboard names this state explicitly instead of showing a generic failure. Kit persistence lands in its real phase — no fabricated kit responses are returned.

## Directory ownership

```text
src/app                 routes and layouts
src/components/ui       reusable shadcn-style primitives
src/components/<name>   feature components
src/hooks/<name>        React Query and feature hooks
src/providers           app providers + service composition root
src/services            Axios-backed service layer
src/stores              Zustand stores
src/types/<name>        domain/API type declarations
src/constants           shared constants and endpoint declarations
src/lib                 pure framework utilities
```
