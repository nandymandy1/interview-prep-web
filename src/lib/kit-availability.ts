import { ApiClientError } from '@/services/http/api-client.service';

// Collection-root GET never 404s once implemented, so a 404 on the kits list
// query means the backend has no kit routes in this build — not a broken kit.
export const KIT_API_UNAVAILABLE_MESSAGE =
  'Kit storage is not wired yet: the backend has no /api/kits routes in this build. Sign-in and health checks work; kit persistence lands in its real phase.';

export const getKitListErrorMessage = (error: unknown): string | null =>
  error instanceof ApiClientError && error.statusCode === 404 ? KIT_API_UNAVAILABLE_MESSAGE : null;
