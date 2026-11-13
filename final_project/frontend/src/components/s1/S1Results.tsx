/**
 * S1 result component: five-star and unrated hospitals for one state.
 *
 * Renders only what the backend returns, in the backend's order
 * (docs/api.md section 4). A missing rating is shown as "Not rated",
 * never as 0. Layout and navigation belong to the Explore Data page.
 */

import { useEffect, useState } from 'react';
import { getS1Ratings, type S1RatingsResponse } from '../../api/s1';
import type { CmsSource } from '../../api/types';
import './S1Results.css';

/** Shown when CMS gives no footnote text for a missing rating (docs/api.md §4). */
const NO_REASON = 'No reason given by CMS';
const NOT_LISTED = 'Not listed';

interface S1ResultsProps {
  /** Two-letter state code, e.g. "ME". */
  state: string;
}

/** The last finished request, remembered with the state it was for. */
type LoadResult =
  | { state: string; status: 'success'; response: S1RatingsResponse }
  | { state: string; status: 'error'; message: string };

/**
 * Fetches S1 results for `state` and shows loading, error or the results.
 */
export function S1Results({ state }: S1ResultsProps) {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getS1Ratings(state, controller.signal)
      .then((response) =>
        setResult({ state, status: 'success', response })
      )
      .catch((err: unknown) => {
        // A newer request (or unmount) cancelled this one; ignore it.
        if (controller.signal.aborted) {
          return;
        }

        setResult({
          state,
          status: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.',
        });
      });

    return () => controller.abort();
  }, [state]);

  // Loading until a result for the *current* state has arrived.
  if (result === null || result.state !== state) {
    return (
      <p className="s1-status" role="status">
        Loading five-star hospitals for {state}…
      </p>
    );
  }

  if (result.status === 'error') {
    return (
      <p className="s1-status s1-error" role="alert">
        Could not load five-star hospitals for {state}:{' '}
        {result.message}
      </p>
    );
  }

  return <S1ResultsView response={result.response} />;
}

interface S1ResultsViewProps {
  response: S1RatingsResponse;
}

/**
 * Presentational part: renders a successful S1 response as returned.
 */
export function S1ResultsView({ response }: S1ResultsViewProps) {
  const { five_star: fiveStar, unrated } = response.data;

  return (
    <section className="s1-results" aria-label="Five-star and unrated hospitals">
      <h3>Five-star hospitals</h3>

      {fiveStar.length === 0 ? (
        <p className="s1-empty">
          No hospital in this state has a five-star CMS overall rating.
        </p>
      ) : (
        <div className="s1-table-wrap">
          <table className="s1-table">
            <thead>
              <tr>
                <th scope="col">Hospital</th>
                <th scope="col">City</th>
                <th scope="col">ZIP code</th>
                <th scope="col">Overall rating</th>
              </tr>
            </thead>
            <tbody>
              {fiveStar.map((hospital) => (
                <tr key={hospital.facility_id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.city ?? NOT_LISTED}</td>
                  <td>{hospital.zip_code ?? NOT_LISTED}</td>
                  <td>
                    <span aria-hidden="true">★★★★★ </span>
                    {hospital.overall_rating} of 5 stars
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Hospitals without an overall rating</h3>

      {unrated.length === 0 ? (
        <p className="s1-empty">
          Every hospital in this state has a CMS overall rating.
        </p>
      ) : (
        <div className="s1-table-wrap">
          <table className="s1-table">
            <thead>
              <tr>
                <th scope="col">Hospital</th>
                <th scope="col">City</th>
                <th scope="col">ZIP code</th>
                <th scope="col">Overall rating</th>
                <th scope="col">Reason</th>
              </tr>
            </thead>
            <tbody>
              {unrated.map((hospital) => (
                <tr key={hospital.facility_id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.city ?? NOT_LISTED}</td>
                  <td>{hospital.zip_code ?? NOT_LISTED}</td>
                  <td>Not rated</td>
                  <td>
                    {hospital.reason ?? NO_REASON}
                    {hospital.footnote_code !== null && (
                      <span className="s1-footnote">
                        {' '}(CMS footnote {hospital.footnote_code})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="s1-footer">
        {response.notes.length > 0 && (
          <ul className="s1-notes">
            {response.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}

        {response.source.length > 0 && (
          <div className="s1-sources">
            <strong>Source</strong>
            {response.source.map((source) => (
              <p key={`${source.dataset}-${source.dataset_id ?? ''}`}>
                {describeSource(source)}
              </p>
            ))}
          </div>
        )}
      </footer>
    </section>
  );
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
