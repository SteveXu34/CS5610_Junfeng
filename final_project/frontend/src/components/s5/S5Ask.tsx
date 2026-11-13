/**
 * S5 component: ask a hospital-quality question in plain English.
 *
 * Self-contained basic component (input + Ask + answer) following the house
 * style; the frontend lead wires the homepage "Ask HQE" box to this later.
 *
 * It shows the backend's plain-English answer and its outcome. It never
 * invents data: "cannot_answer" and "refused" are shown as-is, not as a blank
 * or a guess. Layout and navigation belong to the Explore Data page.
 */

import { useRef, useState, type FormEvent } from 'react';
import { askS5, type S5AskResponse, type S5Status } from '../../api/s5';
import type { CmsSource } from '../../api/types';
import './S5Ask.css';

const MAX_QUESTION_LENGTH = 500; // matches the backend's 1–500 validation

/** What to render below the form. */
type AskState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; response: S5AskResponse };

export function S5Ask() {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<AskState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = question.trim();
    if (trimmed === '') {
      return;
    }

    // Cancel any in-flight question before starting a new one.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: 'loading' });

    askS5(trimmed, controller.signal)
      .then((response) => setState({ status: 'done', response }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.',
        });
      });
  }

  return (
    <section className="s5-ask" aria-label="Ask HQE">
      <form className="s5-ask-form" onSubmit={handleSubmit}>
        <input
          className="s5-ask-input"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question about hospital quality…"
          maxLength={MAX_QUESTION_LENGTH}
          aria-label="Your question"
        />
        <button
          className="s5-ask-button"
          type="submit"
          disabled={state.status === 'loading' || question.trim() === ''}
        >
          {state.status === 'loading' ? 'Asking…' : 'Ask'}
        </button>
      </form>

      {state.status === 'loading' && (
        <p className="s5-status" role="status">
          Asking…
        </p>
      )}

      {state.status === 'error' && (
        <p className="s5-status s5-error" role="alert">
          Could not get an answer: {state.message}
        </p>
      )}

      {state.status === 'done' && <S5Answer response={state.response} />}
    </section>
  );
}

interface S5AnswerProps {
  response: S5AskResponse;
}

/** Renders one answered / cannot_answer / refused response. */
export function S5Answer({ response }: S5AnswerProps) {
  const { status, answer } = response.data;

  return (
    <div className="s5-answer" aria-live="polite">
      <StatusBadge status={status} />
      <p className="s5-answer-text">{answer}</p>

      {status === 'answered' && (
        <footer className="s5-footer">
          {response.notes.length > 0 && (
            <ul className="s5-notes">
              {response.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}

          {response.source.length > 0 && (
            <div className="s5-sources">
              <strong>Sources</strong>
              {response.source.map((source) => (
                <p key={`${source.dataset}-${source.dataset_id ?? ''}`}>
                  {describeSource(source)}
                </p>
              ))}
            </div>
          )}
        </footer>
      )}
    </div>
  );
}

/** A short label for each outcome; only "answered" reads as a positive result. */
function StatusBadge({ status }: { status: S5Status }) {
  if (status === 'answered') {
    return <span className="s5-badge s5-badge-ok">Answered</span>;
  }

  if (status === 'refused') {
    return <span className="s5-badge s5-badge-muted">Refused</span>;
  }

  return <span className="s5-badge s5-badge-muted">Can&rsquo;t answer</span>;
}

/** "Dataset (id) · Released … · Reporting period …", never inventing a date. */
function describeSource(source: CmsSource): string {
  const id = source.dataset_id ? ` (${source.dataset_id})` : '';
  const released = source.release_date
    ? `Released ${source.release_date}`
    : 'Release date not available';
  const period =
    source.period_start && source.period_end
      ? ` · Reporting period ${source.period_start} to ${source.period_end}`
      : '';

  return `${source.dataset}${id} · ${released}${period}`;
}
