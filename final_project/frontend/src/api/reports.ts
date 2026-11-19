/** Saved reports. Contract: docs/api.md section 8.1. */
import { apiDelete, apiGet, apiPost } from './client';
import type { ApiResponse, Report, SavedReportFull, SavedReportMeta } from './types';

export function saveReport(report: Report, signal?: AbortSignal) {
  return apiPost<ApiResponse<{ report_id: number; title: string; created_at: string }>>(
    '/reports', { report }, signal);
}
export function listReports(signal?: AbortSignal) {
  return apiGet<ApiResponse<{ reports: SavedReportMeta[] }>>('/reports', signal);
}
export function getReport(id: number, signal?: AbortSignal) {
  return apiGet<ApiResponse<SavedReportFull>>(`/reports/${id}`, signal);
}
export function deleteReport(id: number, signal?: AbortSignal) {
  return apiDelete<ApiResponse<{ status: string; report_id: number }>>(`/reports/${id}`, signal);
}
