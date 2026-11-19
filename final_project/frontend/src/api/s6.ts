/**
 * S6: Hospital Inspections API
 *
 * Provides typed access to QCOR hospital inspection
 * history and original inspector narratives.
 *
 * Facility IDs are CMS Certification Numbers (CCNs).
 *
 * Backend:
 * backend/app/routers/s6_inspections.py
 */

import { apiGet } from './client';

import type {
  ApiResponse,
  Hospital,
} from './types';

// ==========================================================
// 1. Inspection finding
// ==========================================================

/**
 * One published QCOR deficiency or memo row.
 *
 * finding_id identifies the original narrative record.
 *
 * narrative_included describes whether the list response
 * includes narrative text. It does not indicate whether
 * the separate narrative endpoint has that text.
 */
export interface S6Finding {
  finding_id: number | null;

  deficiency_tag: string | null;
  description: string | null;

  tag_type:
    | 'Standard'
    | 'Condition'
    | 'Memo'
    | null;

  narrative_included: boolean;
}

// ==========================================================
// 2. Inspection event
// ==========================================================

/**
 * One hospital survey event.
 *
 * Each event may contain multiple findings.
 */
export interface S6Inspection {
  inspection_id: string;

  survey_date: string | null;
  survey_type: string | null;

  findings: S6Finding[];

  report_url: string | null;
}

// ==========================================================
// 3. Hospital inspection response
// ==========================================================

export interface S6Data {
  hospital: Hospital;
  inspections: S6Inspection[];
}

export type S6Response = ApiResponse<S6Data>;

// ==========================================================
// 4. Original inspector narrative response
// ==========================================================

/**
 * Original written findings for one QCOR finding.
 *
 * The backend retrieves the narrative from private
 * Supabase Storage. The frontend never accesses
 * the private Storage bucket directly.
 */
export interface S6NarrativeData {
  finding_id: number;
  facility_id: string;

  survey_date: string | null;
  deficiency_tag: string | null;
  description: string | null;

  tag_type:
    | 'Standard'
    | 'Condition'
    | 'Memo'
    | null;

  narrative: string | null;
}

export type S6NarrativeResponse =
  ApiResponse<S6NarrativeData>;

// ==========================================================
// 5. Hospital lookup response
// ==========================================================

export type HospitalLookupResponse = ApiResponse<{
  hospitals: Hospital[];
}>;

// ==========================================================
// 6. Hospital lookup API
// ==========================================================

/**
 * Retrieve hospitals in a selected state.
 *
 * Example:
 * GET /api/hospitals?state=ME
 */
export function getHospitalsByState(
  state: string,
  signal?: AbortSignal
): Promise<HospitalLookupResponse> {
  const params = new URLSearchParams({
    state: state.trim().toUpperCase(),
  });

  return apiGet<HospitalLookupResponse>(
    `/hospitals?${params.toString()}`,
    signal
  );
}

// ==========================================================
// 7. Hospital inspection history API
// ==========================================================

/**
 * Retrieve dated inspection events for one hospital.
 *
 * Example:
 * GET /api/s6/hospitals/200033/inspections
 */
export function getHospitalInspections(
  facilityId: string,
  signal?: AbortSignal
): Promise<S6Response> {
  return apiGet<S6Response>(
    `/s6/hospitals/${encodeURIComponent(
      facilityId
    )}/inspections`,
    signal
  );
}

// ==========================================================
// 8. Original inspector narrative API
// ==========================================================

/**
 * Fetch the original written findings for one record.
 *
 * Example:
 * GET /api/s6/findings/12345/narrative
 *
 * This endpoint requires a valid HQE session cookie.
 * The shared API client sends same-origin cookies
 * automatically.
 *
 * Possible responses:
 * - 200: Narrative returned, or narrative is null
 * - 401: User is not authenticated
 * - 404: Finding does not exist
 * - 503: Narrative Storage is unavailable
 */
export function getFindingNarrative(
  findingId: number,
  signal?: AbortSignal
): Promise<S6NarrativeResponse> {
  return apiGet<S6NarrativeResponse>(
    `/s6/findings/${encodeURIComponent(
      String(findingId)
    )}/narrative`,
    signal
  );
}
