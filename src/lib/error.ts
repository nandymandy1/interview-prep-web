import { ApiClientError } from '@/services/http/api-client.service';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
