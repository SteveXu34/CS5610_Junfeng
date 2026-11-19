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

/**
 * S4: Historical emergency department duration.
 *
 * GET /api/s4/er-wait?town=Bangor&state=ME
 *
 * OP-18b measures historical ED arrival-to-departure time,
 * not live waiting time.
 */

/** A hospital with a published ED duration. */
export interface S4Hospital extends Hospital {
  median_minutes: number;
  period_start: string | null;
  period_end: string | null;
}

/** A hospital without an available ED duration. */
export interface S4MissingHospital extends Hospital {
  footnote_code: string | null;
  reason: string | null;
}

/** Data returned by the S4 API endpoint. */
export interface S4Data {
  origin: {
    town: string;
    state: string;
  };
  hospitals: S4Hospital[];
  no_data: S4MissingHospital[];
}

/** Complete S4 response, including CMS source information. */
export type S4Response = ApiResponse<S4Data>;

/** A measure's metadata inside a report. */
export interface ReportMeasure {
  label: string;
  unit: string | null;
  direction: string | null;
  description: string;
}

/** A hospital row inside a report (superset of the shared Hospital). */
export interface ReportHospital extends Hospital {
  hospital_type?: string | null;
  ownership?: string | null;
  emergency_services?: boolean | null;
  county?: string | null;
  value?: number | null;
  overall_rating?: number | null;
  interval?: { lower: number | null; higher: number | null };
  inspection?: {
    survey_count: number; citation_count: number; memo_count: number;
    condition_count: number; earliest_survey: string | null; latest_survey: string | null;
  };
}

export interface ReportSummary {
  in_scope: number | null; with_value: number; missing: number | null;
  min?: number; max?: number; avg?: number;
  best?: { facility_id: string; name: string; value: number | null };
  worst?: { facility_id: string; name: string; value: number | null };
}

export interface ReportProfileMeasure {
  measure: string; label: string; value: number | null;
  caveats: string[]; sources: CmsSource[];
  summary?: Record<string, number | null>;
  categories?: { description: string; count: number }[];
}

/** The structured report from /api/s5/ask (data.report) and /api/chat (data.report). */
export interface Report {
  title: string;
  question: string;
  scope: { measure: string | null; filters: Record<string, unknown> };
  headline: string;
  measure: ReportMeasure | null;
  caveats: string[];
  sources: (CmsSource & { url?: string | null })[];
  data_as_of: string | null;
  generated_at: string | null;
  hospitals?: ReportHospital[];
  summary?: ReportSummary;
  metric?: Record<string, number>;
  hospital?: Partial<ReportHospital> & { facility_id: string };
  measures?: ReportProfileMeasure[];
}

export type ChatStatus = 'answered' | 'cannot_answer' | 'refused' | 'clarify';
export interface ChatSessionStart { session_id: number; greeting: string; }
export interface ChatTurn { session_id: number; status: ChatStatus; answer: string; report: Report | null; }
export interface ChatSessionMeta { session_id: number; created_at: string; updated_at: string; }
export interface ChatMessage { sender_role: string; content: string; message_order: number; created_at: string; }

export interface SavedReportMeta {
  report_id: number; title: string; created_at: string;
  data_as_of: string | null; query_parameters: Record<string, unknown>;
}
export interface SavedReportFull extends SavedReportMeta { report_content: Report; }

export interface SearchHospital extends Hospital {
  hospital_type: string | null; ownership: string | null;
  emergency_services: boolean | null; county: string | null; overall_rating: number | null;
}
export interface SearchFiltersInput {
  state: string; min_rating?: string; hospital_type?: string;
  ownership?: string; emergency_services?: boolean; city?: string;
}
