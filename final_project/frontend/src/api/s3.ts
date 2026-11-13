/**
 * S3 API service: combined hip/knee replacement complications by state.
 *
 * Contract: docs/api.md section 6, GET /api/s3/hip-knee?state=ME.
 */

import { apiGet } from './client';
import type { ApiResponse, Hospital } from './types';

/** A hospital with a published combined hip/knee complication rate. */
export interface HipKneeHospital extends Hospital {
  /** Risk-standardized combined hip/knee complication rate; lower is better. */
  complication_rate: number;
  /** Uncertainty interval; either bound is null when CMS did not publish it. */
  lower_estimate: number | null;
  higher_estimate: number | null;
  compared_to_national: string | null;
  period_start: string | null;
  period_end: string | null;
}

/** A hospital with no published rate, with the CMS footnote reason if any. */
export interface UnavailableHospital extends Hospital {
  footnote_code: string | null;
  reason: string | null;
}

/** The `data` object of the S3 response. */
export interface S3HipKneeData {
  hospitals: HipKneeHospital[];
  unavailable: UnavailableHospital[];
}

export type S3HipKneeResponse = ApiResponse<S3HipKneeData>;

/**
 * GET /api/s3/hip-knee for one state (two uppercase letters, e.g. "ME").
 *
 * The backend sorts hospitals by complication_rate ascending; callers keep
 * that order. This is a COMBINED hip and knee measure, never knee-only.
 */
export function getS3HipKnee(
  state: string,
  signal?: AbortSignal
): Promise<S3HipKneeResponse> {
  const query = new URLSearchParams({ state });

  return apiGet<S3HipKneeResponse>(`/s3/hip-knee?${query}`, signal);
}
