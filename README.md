# AI Interview Prep Kit — Web

Next.js 16.3 + TypeScript frontend for the AI Interview Prep Kit
(Trao Full-Stack Engineering Assessment).

## Submission

Live application (this repo, deployed):
https://interview-prep-web-delta.vercel.app

Backend API:
https://nandy1.i-dacs.com

Frontend source (this repository):
https://github.com/nandymandy1/interview-prep-web

Backend architecture + mandatory evaluator:
https://github.com/nandymandy1/interview-prep-api

Walkthrough video:
[To be added before submission]

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
git clone https://github.com/nandymandy1/interview-prep-web.git
cd interview-prep-web

cp .env.example .env.local
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

The Express backend is expected on `http://localhost:4000` unless
`API_PROXY_TARGET` is changed.

## Environment

```text
API_PROXY_TARGET=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_APP_NAME=Interview Prep AI
```

Production `API_PROXY_TARGET`:

```text
https://nandy1.i-dacs.com
```

No backend secrets belong here: no OpenAI/Brave keys, no Mongo/Redis URIs.

## API proxy architecture

Browser requests are intentionally same-origin: the browser only ever calls
`/api/...` on the frontend origin, and Next.js rewrites proxy them to
`API_PROXY_TARGET` (the Express backend). Session cookies therefore stay
first-party — do not point browser code at the backend origin. `rewrites()`
resolves `API_PROXY_TARGET` at build time: if it is missing or invalid, Next
logs `[web] API_PROXY_TARGET is missing or invalid` and `/api` is not proxied.

## Production deployment

- Vercel Container via `Dockerfile.vercel` (multi-stage, Node 22, non-root,
  `PORT=3000`, production runs `node server.js` from the standalone output)
- `API_PROXY_TARGET` must be set for Production (and Preview, if previews
  should reach a backend) and available at BUILD time — changing it requires a
  redeploy because rewrites are baked in

## Main user flow

Register/login → dashboard (paginated kit list) → new kit (JD + company URL +
days) → live generation progress (research → JD analysis → questions →
coverage → schedule) → Ready kit (overview, requirements, company brief,
questions, flashcards, schedule) → builder edits with regeneration that
preserves manual edits → weakest-first flashcard practice with confidence
recording → logout. Failed kits offer Retry generation on the same kit.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

Backend architecture, generation pipeline, and the mandatory batch evaluator
live in the backend repository:
https://github.com/nandymandy1/interview-prep-api

## Submission Links

Application:
https://interview-prep-web-delta.vercel.app

Backend API:
https://nandy1.i-dacs.com

Backend / evaluator repository:
https://github.com/nandymandy1/interview-prep-api

Frontend repository:
https://github.com/nandymandy1/interview-prep-web

Walkthrough video:
https://drive.google.com/file/d/11KwL8ugSSeCx9sIyq4DmFOCxlO14DlLn/view
