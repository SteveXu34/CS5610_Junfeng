/** Conversational chat endpoints. Contract: docs/api.md section Chat. */
import { apiGet, apiPost } from './client';
import type {
  ApiResponse, ChatMessage, ChatSessionMeta, ChatSessionStart, ChatTurn,
} from './types';

export function startSession(signal?: AbortSignal) {
  return apiPost<ApiResponse<ChatSessionStart>>('/chat/sessions', {}, signal);
}
export function sendTurn(sessionId: number, message: string, signal?: AbortSignal) {
  return apiPost<ApiResponse<ChatTurn>>('/chat', { session_id: sessionId, message }, signal);
}
export function listSessions(signal?: AbortSignal) {
  return apiGet<ApiResponse<{ sessions: ChatSessionMeta[] }>>('/chat/sessions', signal);
}
export function getSession(id: number, signal?: AbortSignal) {
  return apiGet<ApiResponse<{ session_id: number; messages: ChatMessage[] }>>(
    `/chat/sessions/${id}`, signal);
}
