import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api/api.type';

export class ApiClientError extends Error {
  readonly statusCode?: number;
  readonly details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

type ApiClientServiceDependencies = {
  baseURL: string;
  timeoutMs: number;
};

export class ApiClientService {
  private readonly client: AxiosInstance;

  constructor({ baseURL, timeoutMs }: ApiClientServiceDependencies) {
    this.client = axios.create({
      baseURL,
      timeout: timeoutMs,
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        const statusCode = error.response?.status;
        const responseBody = error.response?.data;
        const message =
          responseBody?.message ||
          (error.code === 'ECONNABORTED'
            ? 'The request timed out.'
            : 'Unable to complete the request.');

        return Promise.reject(new ApiClientError(message, statusCode, responseBody?.details));
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiSuccessResponse<T>>(url, config);
    return this.unwrap(response);
  }

  async post<T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<ApiSuccessResponse<T>>(url, body, config);
    return this.unwrap(response);
  }

  async patch<T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<ApiSuccessResponse<T>>(url, body, config);
    return this.unwrap(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiSuccessResponse<T>>(url, config);
    return this.unwrap(response);
  }

  private unwrap<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
    return response.data.data;
  }
}

export const createApiClientService = (): ApiClientService =>
  new ApiClientService({
    baseURL: API_BASE_URL,
    timeoutMs: API_TIMEOUT_MS,
  });
