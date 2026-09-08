# Web architecture adapter

Root [`../ARCHITECTURE.md`](../ARCHITECTURE.md) is canonical for workspace architecture and repository boundaries.

This application owns the Next.js interface. Pages compose routes, services own HTTP access, TanStack Query owns server state, and Zustand is reserved for genuine global client state. It consumes API contracts over HTTP and never imports backend source.
