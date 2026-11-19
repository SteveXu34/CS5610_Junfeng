import { useEffect, useRef, useState, type FormEvent } from 'react';
import { sendTurn, startSession } from '../../api/chat';
import { saveReport } from '../../api/reports';
import type { ChatStatus, Report } from '../../api/types';
import { ReportView } from '../report/ReportView';
import './ChatPanel.css';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  report?: Report | null;
  status?: ChatStatus;
  saved?: boolean;
}

/** One-click starters, one per story. Clicking sends the full question through the chat. */
const SCENARIOS: string[] = [
  'Which Maine hospitals have a five-star overall rating?',
  'Which Maine hospital has the lowest heart-failure readmission ratio?',
  'Which Maine hospital has the lowest hip/knee complication rate?',
  'Which Maine hospitals have the shortest median emergency department time?',
  'Which Maine hospitals have the most inspection citations?',
];

export function ChatPanel() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  async function begin() {
    setError(null);
    setMessages([]);
    setSessionId(null);
    try {
      const r = await startSession();
      setSessionId(r.data.session_id);
      setMessages([{ role: 'assistant', content: r.data.greeting }]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => { void begin(); }, []);
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy || sessionId == null) return;
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    try {
      const r = await sendTurn(sessionId, msg);
      setMessages((m) => [...m, {
        role: 'assistant', content: r.data.answer, report: r.data.report, status: r.data.status,
      }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'The assistant is temporarily unavailable, please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send(text);
  }

  async function onSave(idx: number) {
    const msg = messages[idx];
    if (!msg.report) return;
    try {
      await saveReport(msg.report);
      setMessages((m) => m.map((x, i) => (i === idx ? { ...x, saved: true } : x)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const disabled = busy || sessionId == null;

  return (
    <div className="chat-panel">
      <div className="chat-thread" ref={threadRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-${m.role}`}>
            {m.role === 'assistant' && <div className="chat-avatar chat-avatar-bot" aria-hidden="true">✳</div>}
            <div className="chat-bubble">
              <div className="chat-text">{m.content}</div>
              {m.report && <ReportView report={m.report} />}
              {m.report && (m.saved
                ? <span className="chat-saved">Saved ✓</span>
                : <button className="chat-save" type="button" onClick={() => void onSave(i)}>💾 Save report</button>)}
            </div>
            {m.role === 'user' && <div className="chat-avatar chat-avatar-you" aria-hidden="true">ME</div>}
          </div>
        ))}
      </div>
      {error && <p className="chat-error">{error}</p>}
      <form className="chat-input" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message… (context is remembered)"
          maxLength={500}
          disabled={disabled}
        />
        <button type="submit" disabled={busy || !input.trim()}>{busy ? '…' : 'Send'}</button>
      </form>
      <div className="chat-footer">
        <button className="chat-new" type="button" onClick={() => void begin()}>＋ New chat</button>
        <p className="chat-scenarios-label">You might ask:</p>
        <div className="chat-scenarios">
          {SCENARIOS.map((q) => (
            <button
              key={q}
              type="button"
              className="chat-scenario"
              disabled={disabled}
              onClick={() => void send(q)}
            >
              <span className="chat-scenario-q">{q}</span>
              <span className="chat-scenario-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
