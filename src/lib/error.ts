import { ApiClientError } from '@/services/http/api-client.service';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    // A 409 from a builder mutation means another edit won the race. The
    // hooks already refetch the latest kit; the message tells the user why.
    if (error.statusCode === 409) {
      return 'Kit changed; refreshing latest version.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
