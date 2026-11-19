/**
 * S4 API service.
 *
 * Fetches historical emergency department duration data
 * through the existing shared HTTP client.
 *
 * Vite forwards /api requests to FastAPI in development.
 */

import { apiGet } from './client';
import type { S4Response } from './types';

/**
 * Search for hospitals offering emergency services
 * in a specified city and state.
 *
 * @param town - City name, e.g. "Bangor".
 * @param state - Two-letter state code, e.g. "ME".
 * @param signal - Optional signal for cancelling requests.
 */
export function getEmergencyDepartmentTimes(
  town: string,
  state: string = 'ME',
  signal?: AbortSignal
): Promise<S4Response> {
  // URLSearchParams safely encodes user-provided values.
  const params = new URLSearchParams({
    town: town.trim(),
    state: state.trim().toUpperCase(),
  });

  return apiGet<S4Response>(
    `/s4/er-wait?${params.toString()}`,
    signal
  );
}
