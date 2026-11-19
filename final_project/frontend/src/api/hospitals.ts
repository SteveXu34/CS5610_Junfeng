/** Structured hospital search. Contract: docs/api.md section 3 (/api/hospitals/search). */
import { apiGet } from './client';
import type { ApiResponse, SearchFiltersInput, SearchHospital } from './types';

export function searchHospitals(f: SearchFiltersInput, signal?: AbortSignal) {
  const q = new URLSearchParams({ state: f.state });
  if (f.min_rating) q.set('min_rating', f.min_rating);
  if (f.hospital_type) q.set('hospital_type', f.hospital_type);
  if (f.ownership) q.set('ownership', f.ownership);
  if (f.emergency_services !== undefined) q.set('emergency_services', String(f.emergency_services));
  if (f.city) q.set('city', f.city);
  return apiGet<ApiResponse<{ hospitals: SearchHospital[] }>>(`/hospitals/search?${q.toString()}`, signal);
}
