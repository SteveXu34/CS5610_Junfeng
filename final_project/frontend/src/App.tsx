import { useState, type FormEvent } from 'react';
import { apiPost } from './api/client';
import type { ApiResponse } from './api/types';
import './App.css';

/**
 * S5 response structure defined in docs/api.md.
 */
interface AiAnswer {
  status: 'answered' | 'cannot_answer' | 'refused';
  answer: string;
  sql: string | null;
  columns: string[];
  rows: unknown[][];
}

interface ChatResult {
  question: string;
  response: ApiResponse<AiAnswer>;
}

/**
 * Suggested questions based on the HQE user stories.
 * These are examples, not precomputed answers.
 */
const suggestedQuestions = [
  'Which Maine hospitals have a five-star rating?',
  'Which Maine hospitals have no overall rating?',
  'Which Maine hospitals have a heart-failure ERR below 1?',
];

const topics = [
  {
    number: '01',
    title: 'Hospital ratings',
    description:
      'Discover CMS overall hospital star ratings and understand why some hospitals are unrated.',
    label: 'Quality ratings',
  },
  {
    number: '02',
    title: 'Readmissions',
    description:
      'Explore reported heart-failure readmissions and compare hospitals using published measures.',
    label: 'Patient outcomes',
  },
  {
    number: '03',
    title: 'Complications',
    description:
      'Compare available surgical complication measures while understanding the limitations.',
    label: 'Clinical measures',
  },
  {
    number: '04',
    title: 'Emergency care',
    description:
      'Explore historical emergency department duration data, with reporting periods clearly shown.',
    label: 'Timely care',
  },
];

function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChatResult | null>(null);

  /**
   * Submit a natural-language question to S5.
   *
   * This uses the shared FastAPI contract.
   * S5 may not be available until the teammate's
   * backend integration is merged.
   */
  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedQuestion = question.trim();

    if (!submittedQuestion || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiPost<ApiResponse<AiAnswer>>(
        '/s5/ask',
        { question: submittedQuestion }
      );

      setResult({
        question: submittedQuestion,
        response,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';

      setError(
        `The question could not be processed: ${message}. ` +
        'If S5 is still being integrated, please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="site-shell">
      {/* Header */}
      <header className="site-header">
        <a className="site-brand" href="/" aria-label="HQE homepage">
          <div className="site-brand-mark">H</div>
          <span>Hospital Quality Explorer</span>
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#explore">Explore data</a>
          <a href="#ask">Ask HQE</a>
          <a href="#about">About the data</a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-intro">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" />
              PUBLIC HEALTH DATA, MADE CLEAR
            </div>

            <h1>
              Better hospital information.
              <span> Clearer decisions.</span>
            </h1>

            <p className="hero-description">
              Explore hospital quality information from the
              Centers for Medicare &amp; Medicaid Services.
              Compare published measures, ask questions, and
              understand what the data can really tell you.
            </p>

            <div className="hero-note">
              <span className="hero-note-icon">✳</span>
              <span>
                Based on publicly available CMS hospital data
              </span>
            </div>
          </div>

          {/* AI Question Box */}
          <section className="ask-card" id="ask">
            <div className="ask-heading">
              <div className="assistant-symbol">✳</div>

              <div>
                <div className="ask-title">Ask HQE</div>
                <p>
                  Your hospital quality research assistant
                </p>
              </div>
            </div>

            <h2>
              What would you like to know?
            </h2>

            <p className="ask-description">
              Ask about hospital ratings, readmissions,
              or other available quality measures.
            </p>

            <form onSubmit={handleAsk}>
              <label className="sr-only" htmlFor="question">
                Ask a hospital quality question
              </label>

              <div className="question-input">
                <textarea
                  id="question"
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder="Ask anything about hospital quality..."
                  maxLength={500}
                  rows={3}
                />

                <div className="question-input-footer">
                  <span>{question.length}/500</span>

                  <button
                    type="submit"
                    disabled={!question.trim() || loading}
                    className="ask-submit"
                  >
                    {loading ? 'Asking...' : 'Ask HQE'}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="suggestions">
              <p>TRY ASKING</p>

              <div className="suggestion-list">
                {suggestedQuestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setQuestion(suggestion)}
                  >
                    {suggestion}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Only render actual results from the API. */}
            {result && (
              <div className="chat-result" aria-live="polite">
                <p className="chat-result-label">
                  HQE RESPONSE
                </p>

                <p className="chat-result-question">
                  {result.question}
                </p>

                <div className="chat-answer">
                  {result.response.data.answer}
                </div>

                {result.response.source.length > 0 && (
                  <div className="chat-sources">
                    <strong>Sources</strong>

                    {result.response.source.map(
                      (source, index) => (
                        <p key={`${source.dataset}-${index}`}>
                          {source.dataset}
                          {source.release_date
                            ? ` · ${source.release_date}`
                            : ''}
                        </p>
                      )
                    )}
                  </div>
                )}

                {result.response.notes.length > 0 && (
                  <div className="chat-notes">
                    {result.response.notes.map(
                      (note, index) => (
                        <p key={index}>{note}</p>
                      )
                    )}
                  </div>
                )}

                {result.response.data.sql && (
                  <details className="sql-details">
                    <summary>View SQL query</summary>
                    <pre>
                      {result.response.data.sql}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {error && (
              <p className="chat-error" role="alert">
                {error}
              </p>
            )}

            <p className="ask-disclaimer">
              HQE uses published data when available.
              AI responses may be limited and are not
              medical advice.
            </p>
          </section>
        </section>

        {/* Explore topics */}
        <section className="explore-section" id="explore">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">
                EXPLORE THE DATA
              </p>

              <h2>
                A closer look at hospital quality.
              </h2>
            </div>

            <p>
              Different measures tell different stories.
              Explore the information behind hospital quality.
            </p>
          </div>

          <div className="topics-grid">
            {topics.map((topic) => (
              <article className="topic-card" key={topic.number}>
                <div className="topic-top">
                  <span className="topic-number">
                    {topic.number}
                  </span>
                  <span className="topic-decoration">✳</span>
                </div>

                <div>
                  <p className="topic-label">
                    {topic.label}
                  </p>
                  <h3>{topic.title}</h3>
                  <p className="topic-description">
                    {topic.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Data transparency */}
        <section className="data-section" id="about">
          <div className="data-section-mark">✳</div>

          <div>
            <h2>
              Good decisions start with understanding
              the data.
            </h2>

            <p>
              Hospital Quality Explorer uses public CMS
              datasets. Measures may have different reporting
              periods, missing values, and clinical
              limitations. Historical quality measures are
              not real-time hospital conditions.
            </p>
          </div>

          <a
            href="https://data.cms.gov/provider-data/topics/hospitals"
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            View CMS data ↗
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <span>© Hospital Quality Explorer</span>
        <span>Built around transparent, public hospital data.</span>
      </footer>
    </div>
  );
}

export default App;
