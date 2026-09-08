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
