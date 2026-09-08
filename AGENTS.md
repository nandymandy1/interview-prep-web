# Web adapter

The root [`../AGENTS.md`](../AGENTS.md) is authoritative. Read it first, then apply the installed Karpathy and Ponytail skills it names. This file records web-specific navigation only; it does not override root policy.

- This repository is the Next.js frontend and must remain independent from `interview-prep-api/`.
- `src/app` owns route composition; shared UI lives in `src/components/ui` and feature UI in `src/components`.
- API access stays behind `src/services`; server state belongs in TanStack Query and true global client state in Zustand.
- Reusable API/domain types live in `src/types`; use the existing `@/*` alias.
- Keep product-specific implementation details with the relevant source module rather than duplicating root governance here.
