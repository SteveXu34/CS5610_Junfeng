/**
 * S1 API service: five-star and unrated hospitals.
 *
 * Contract: docs/api.md section 4, GET /api/s1/ratings?state=ME.
 */

import { apiGet } from './client';
import type { ApiResponse, Hospital } from './types';

/** A hospital whose CMS overall rating is 5. */
export interface FiveStarHospital extends Hospital {
  overall_rating: number;
}

/** A hospital without a published CMS overall rating. */
export interface UnratedHospital extends Hospital {
  /** Always null: a missing rating is not a zero rating. */
  overall_rating: null;
  footnote_code: string | null;
  /** CMS footnote text, or null when no explanation is available. */
  reason: string | null;
}

/** The `data` object of the S1 response. */
export interface S1RatingsData {
  five_star: FiveStarHospital[];
  unrated: UnratedHospital[];
}

export type S1RatingsResponse = ApiResponse<S1RatingsData>;

/**
 * GET /api/s1/ratings for one state (two uppercase letters, e.g. "ME").
 *
 * The backend sorts both lists by name; callers keep that order.
 */
export function getS1Ratings(
  state: string,
  signal?: AbortSignal
): Promise<S1RatingsResponse> {
  const query = new URLSearchParams({ state });

  return apiGet<S1RatingsResponse>(`/s1/ratings?${query}`, signal);
}
