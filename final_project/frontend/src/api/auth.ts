/**
 * HQE authentication API.
 *
 * Backend endpoints:
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 *
 * Authentication uses an HttpOnly session cookie.
 * Never store the password or session token in browser storage.
 */

import type {
  ApiErrorResponse,
  ApiResponse,
} from './types';

// ==========================================================
// 1. Authentication types
// ==========================================================

export interface AuthUser {
  user_id: number;
  email: string;
  role: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

type AuthResponse = ApiResponse<AuthUser>;

type LogoutResponse = ApiResponse<{
  status: string;
}>;

// ==========================================================
// 2. Shared response handling
// ==========================================================

/**
 * Convert a failed API response to a human-readable error.
 * The backend uses the { error: { code, message } } shape.
 */
async function readResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const body =
        (await response.json()) as ApiErrorResponse;

      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // Preserve the status message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

/**
 * Auth requests use same-origin /api routes. The browser
 * attaches the HttpOnly session cookie automatically.
 */
async function postAuth<T>(
  path: string,
  body?: AuthCredentials
): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return readResponse<T>(response);
}

// ==========================================================
// 3. Public auth actions
// ==========================================================

export async function getCurrentUser(
  signal?: AbortSignal
): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  // No session yet is a normal state, not a startup error.
  if (response.status === 401) {
    return null;
  }

  const result = await readResponse<AuthResponse>(
    response
  );

  return result.data;
}

export async function loginAccount(
  credentials: AuthCredentials
): Promise<AuthUser> {
  const response = await postAuth<AuthResponse>(
    'login',
    credentials
  );

  return response.data;
}

export async function registerAccount(
  credentials: AuthCredentials
): Promise<AuthUser> {
  const response = await postAuth<AuthResponse>(
    'register',
    credentials
  );

  return response.data;
}

export async function logoutAccount(): Promise<void> {
  await postAuth<LogoutResponse>('logout');
}
