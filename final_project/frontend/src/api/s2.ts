/**
 * S2 API service: heart-failure readmissions by state.
 *
 * Contract: docs/api.md section 5, GET /api/s2/heart-failure?state=ME.
 */

import { apiGet } from './client';
import type { ApiResponse, Hospital } from './types';

/** One hospital's heart-failure readmission metrics. */
export interface HeartFailureHospital extends Hospital {
  /** HRRP READM-30-HF-HRRP excess readmission ratio; null when unavailable. */
  excess_readmission_ratio: number | null;
  predicted_readmission_rate: number | null;
  expected_readmission_rate: number | null;
  /** true when ratio < 1, false when ratio >= 1, null when there is no ratio. */
  better_than_expected: boolean | null;
  /** Unplanned Hospital Visits READM_30_HF rate (a different measure). */
  readmission_rate: number | null;
  compared_to_national: string | null;
  /** HRRP footnote, explaining a missing ratio when present. */
  footnote_code: string | null;
  /** HRRP reporting period of this hospital's ratio. */
  period_start: string | null;
  period_end: string | null;
}

/** The `data` object of the S2 response. */
export interface S2HeartFailureData {
  hospitals: HeartFailureHospital[];
}

export type S2HeartFailureResponse = ApiResponse<S2HeartFailureData>;

/**
 * GET /api/s2/heart-failure for one state (two uppercase letters, e.g. "ME").
 *
 * The backend sorts by ratio ascending with missing ratios last; callers
 * keep that order.
 */
export function getS2HeartFailure(
  state: string,
  signal?: AbortSignal
): Promise<S2HeartFailureResponse> {
  const query = new URLSearchParams({ state });

  return apiGet<S2HeartFailureResponse>(`/s2/heart-failure?${query}`, signal);
}
