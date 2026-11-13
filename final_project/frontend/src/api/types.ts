/**
 * Shared API response types for Hospital Quality Explorer.
 *
 * All story endpoints use the same response envelope.
 * The health endpoint is the exception.
 */

/** Metadata identifying the CMS dataset used. */
export interface CmsSource {
  dataset: string;
  dataset_id: string | null;
  release_date: string | null;
  period_start?: string | null;
  period_end?: string | null;
}

/** Standard successful response from the HQE backend. */
export interface ApiResponse<T> {
  data: T;
  source: CmsSource[];
  notes: string[];
}

/** Standard error response from the HQE backend. */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/** Shared hospital fields used by multiple stories. */
export interface Hospital {
  facility_id: string;
  name: string;
  city: string | null;
  state: string;
  zip_code: string | null;
}

/** Response from GET /api/health. */
export interface HealthResponse {
  status: string;
}
