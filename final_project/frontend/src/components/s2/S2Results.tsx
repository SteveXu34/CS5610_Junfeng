/**
 * S2 result component: heart-failure readmissions for one state.
 *
 * Renders only what the backend returns, in the backend's order
 * (docs/api.md section 5: ratio ascending, missing ratios last).
 * A missing value is shown as text ("No ratio", "Not available"),
 * never as 0. Layout and navigation belong to the Explore Data page.
 */

import { useEffect, useState } from 'react';
import {
  getS2HeartFailure,
  type HeartFailureHospital,
  type S2HeartFailureResponse,
} from '../../api/s2';
import type { CmsSource } from '../../api/types';
import './S2Results.css';

const NOT_AVAILABLE = 'Not available';

interface S2ResultsProps {
  /** Two-letter state code, e.g. "ME". */
  state: string;
}

/** The last finished request, remembered with the state it was for. */
type LoadResult =
  | { state: string; status: 'success'; response: S2HeartFailureResponse }
  | { state: string; status: 'error'; message: string };

/**
 * Fetches S2 results for `state` and shows loading, error or the results.
 */
export function S2Results({ state }: S2ResultsProps) {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getS2HeartFailure(state, controller.signal)
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
      <p className="s2-status" role="status">
        Loading heart-failure readmissions for {state}…
      </p>
    );
  }

  if (result.status === 'error') {
    return (
      <p className="s2-status s2-error" role="alert">
        Could not load heart-failure readmissions for {state}:{' '}
        {result.message}
      </p>
    );
  }

  return <S2ResultsView response={result.response} />;
}

interface S2ResultsViewProps {
  response: S2HeartFailureResponse;
}

/**
 * Presentational part: renders a successful S2 response as returned.
 */
export function S2ResultsView({ response }: S2ResultsViewProps) {
  const { hospitals } = response.data;

  return (
    <section className="s2-results" aria-label="Heart-failure readmissions">
      <h3>Heart-failure readmissions</h3>

      {hospitals.length === 0 ? (
        <p className="s2-empty">
          No hospital in this state has heart-failure readmission data.
        </p>
      ) : (
        <div className="s2-table-wrap">
          <table className="s2-table">
            <thead>
              <tr>
                <th scope="col">Hospital</th>
                <th scope="col">City</th>
                <th scope="col">Excess readmission ratio</th>
                <th scope="col">Compared with expected</th>
                <th scope="col">Predicted rate (%)</th>
                <th scope="col">Expected rate (%)</th>
                <th scope="col">HRRP period</th>
                <th scope="col">30-day readmission rate (%)</th>
                <th scope="col">Compared to national</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.facility_id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.city ?? 'Not listed'}</td>
                  <td>{describeRatio(hospital)}</td>
                  <td>
                    <ExpectedBadge value={hospital.better_than_expected} />
                  </td>
                  <td>{formatNumber(hospital.predicted_readmission_rate)}</td>
                  <td>{formatNumber(hospital.expected_readmission_rate)}</td>
                  <td>{formatPeriod(hospital.period_start, hospital.period_end)}</td>
                  <td>{formatNumber(hospital.readmission_rate)}</td>
                  <td>{hospital.compared_to_national ?? NOT_AVAILABLE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="s2-footer">
        {response.notes.length > 0 && (
          <ul className="s2-notes">
            {response.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}

        {response.source.length > 0 && (
          <div className="s2-sources">
            <strong>Sources</strong>
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

/** Badge only for true; plain text otherwise, so false/null never look like a result. */
function ExpectedBadge({ value }: { value: boolean | null }) {
  if (value === true) {
    return <span className="s2-badge">Better than expected</span>;
  }

  if (value === false) {
    return <span className="s2-muted">Not better than expected</span>;
  }

  return <span className="s2-muted">No ratio to compare</span>;
}

/** The ratio as published, or "No ratio" with the CMS footnote code if there is one. */
function describeRatio(hospital: HeartFailureHospital): string {
  if (hospital.excess_readmission_ratio !== null) {
    return String(hospital.excess_readmission_ratio);
  }

  return hospital.footnote_code !== null
    ? `No ratio (CMS footnote ${hospital.footnote_code})`
    : 'No ratio';
}

/** A published number as-is, or "Not available"; never 0 for a missing value. */
function formatNumber(value: number | null): string {
  return value === null ? NOT_AVAILABLE : String(value);
}

function formatPeriod(start: string | null, end: string | null): string {
  return start && end ? `${start} to ${end}` : NOT_AVAILABLE;
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
