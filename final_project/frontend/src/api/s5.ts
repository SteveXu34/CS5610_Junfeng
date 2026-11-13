/**
 * S5 API service: plain-English questions about hospital quality.
 *
 * Contract: docs/api.md section 8, POST /api/s5/ask.
 *
 * The backend's LLM only routes the question to an approved read-only tool; it
 * never changes data and never invents facts. Every answer is either backed by
 * the database ("answered"), declined ("cannot_answer"), or refused ("refused").
 */

import { apiPost } from './client';
import type { ApiResponse } from './types';

/** The three outcomes the backend may return (docs/api.md section 8.4). */
export type S5Status = 'answered' | 'cannot_answer' | 'refused';

/** The `data` object of the S5 response. */
export interface S5AskData {
  status: S5Status;
  /** Short plain-English answer. */
  answer: string;
  /**
   * The chosen tool's structured result (same shape as that tool's REST
   * endpoint) when answered, otherwise null. Heterogeneous across tools.
   */
  result: Record<string, unknown> | null;
}

export type S5AskResponse = ApiResponse<S5AskData>;

/**
 * POST /api/s5/ask with a natural-language question (1–500 characters).
 */
export function askS5(
  question: string,
  signal?: AbortSignal
): Promise<S5AskResponse> {
  return apiPost<S5AskResponse>('/s5/ask', { question }, signal);
}
