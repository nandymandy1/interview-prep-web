import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/services/http/api-client.service';
import { KIT_API_UNAVAILABLE_MESSAGE, getKitListErrorMessage } from '@/lib/kit-availability';

describe('kit list error mapping', () => {
  it('names the unimplemented kit API instead of a generic failure for route 404s', () => {
    const error = new ApiClientError('Route GET /api/kits not found', 404);
    expect(getKitListErrorMessage(error)).toBe(KIT_API_UNAVAILABLE_MESSAGE);
    expect(KIT_API_UNAVAILABLE_MESSAGE).toContain('/api/kits');
  });

  it('never presents other failures as the missing kit API', () => {
    expect(getKitListErrorMessage(new ApiClientError('Internal server error', 500))).toBeNull();
    expect(getKitListErrorMessage(new ApiClientError('Unauthorized', 401))).toBeNull();
    expect(getKitListErrorMessage(new Error('Unable to complete the request.'))).toBeNull();
    expect(getKitListErrorMessage(null)).toBeNull();
  });

  it('preserves the backend status code on the underlying error', () => {
    const error = new ApiClientError('Route GET /api/kits not found', 404);
    expect(error.statusCode).toBe(404);
    expect(error.message).not.toBe('Internal server error');
  });
});
