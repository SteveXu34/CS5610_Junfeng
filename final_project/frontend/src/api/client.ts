/**
 * Shared HTTP client for Hospital Quality Explorer.
 *
 * All frontend requests use relative /api URLs.
 * Vite forwards them to FastAPI in local development.
 */

import type {
  ApiErrorResponse,
  HealthResponse,
} from './types';

const API_BASE = '/api';

/**
 * Execute a request and return a typed JSON response.
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body =
        (await response.json()) as ApiErrorResponse & {
          detail?: string;
        };

      message =
        body.error?.message ??
        body.detail ??
        message;
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

/**
 * GET request.
 */
export function apiGet<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'GET',
    signal,
  });
}

/**
 * POST request with JSON body.
 */
export function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });
}

/**
 * DELETE request.
 */
export function apiDelete<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  return apiRequest<T>(path, {
    method: 'DELETE',
    signal,
  });
}

/**
 * Backend health endpoint.
 *
 * GET /api/health
 */
export function getHealth(
  signal?: AbortSignal
): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health', signal);
}
