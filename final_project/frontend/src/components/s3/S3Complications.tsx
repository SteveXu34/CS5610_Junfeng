/**
 * S3 result component: combined hip/knee replacement complications for one state.
 *
 * Renders only what the backend returns, in the backend's order
 * (docs/api.md section 6: complication rate ascending). This is a COMBINED
 * hip and knee measure, never knee-only. A missing value is shown as text
 * ("Not available"), never as 0. Layout and navigation belong to the
 * Explore Data page.
 */

import { useEffect, useState } from 'react';
import {
  getS3HipKnee,
  type HipKneeHospital,
  type S3HipKneeResponse,
  type UnavailableHospital,
} from '../../api/s3';
import type { CmsSource } from '../../api/types';
import './S3Complications.css';

const NOT_AVAILABLE = 'Not available';

interface S3ComplicationsProps {
  /** Two-letter state code, e.g. "ME". */
  state: string;
}

/** The last finished request, remembered with the state it was for. */
type LoadResult =
  | { state: string; status: 'success'; response: S3HipKneeResponse }
  | { state: string; status: 'error'; message: string };

/**
 * Fetches S3 results for `state` and shows loading, error or the results.
 */
export function S3Complications({ state }: S3ComplicationsProps) {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getS3HipKnee(state, controller.signal)
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
      <p className="s3-status" role="status">
        Loading hip/knee complications for {state}…
      </p>
    );
  }

  if (result.status === 'error') {
    return (
      <p className="s3-status s3-error" role="alert">
        Could not load hip/knee complications for {state}: {result.message}
      </p>
    );
  }

  return <S3ComplicationsView response={result.response} />;
}

interface S3ComplicationsViewProps {
  response: S3HipKneeResponse;
}

/**
 * Presentational part: renders a successful S3 response as returned.
 */
export function S3ComplicationsView({ response }: S3ComplicationsViewProps) {
  const { hospitals, unavailable } = response.data;

  return (
    <section
      className="s3-results"
      aria-label="Hip/knee replacement complications"
    >
      <h3>Hip/knee replacement complications</h3>

      {hospitals.length === 0 ? (
        <p className="s3-empty">
          No hospital in this state has a published combined hip/knee
          complication rate.
        </p>
      ) : (
        <div className="s3-table-wrap">
          <table className="s3-table">
            <thead>
              <tr>
                <th scope="col">Hospital</th>
                <th scope="col">City</th>
                <th scope="col">Complication rate</th>
                <th scope="col">Uncertainty interval</th>
                <th scope="col">Compared to national</th>
                <th scope="col">Reporting period</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital.facility_id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.city ?? 'Not listed'}</td>
                  <td>{hospital.complication_rate}</td>
                  <td>{formatInterval(hospital)}</td>
                  <td>{hospital.compared_to_national ?? NOT_AVAILABLE}</td>
                  <td>
                    {formatPeriod(hospital.period_start, hospital.period_end)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unavailable.length > 0 && (
        <details className="s3-unavailable">
          <summary>
            {unavailable.length} hospital(s) without a published rate
          </summary>
          <ul>
            {unavailable.map((hospital) => (
              <li key={hospital.facility_id}>
                {hospital.name}
                {hospital.city ? `, ${hospital.city}` : ''} —{' '}
                {describeReason(hospital)}
              </li>
            ))}
          </ul>
        </details>
      )}

      <footer className="s3-footer">
        {response.notes.length > 0 && (
          <ul className="s3-notes">
            {response.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}

        {response.source.length > 0 && (
          <div className="s3-sources">
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

/** "lower–higher", or "Not available" when CMS withheld an estimate; never 0. */
function formatInterval(hospital: HipKneeHospital): string {
  if (hospital.lower_estimate === null || hospital.higher_estimate === null) {
    return NOT_AVAILABLE;
  }

  return `${hospital.lower_estimate}–${hospital.higher_estimate}`;
}

/** The CMS footnote reason, or the code, or a neutral fallback. */
function describeReason(hospital: UnavailableHospital): string {
  if (hospital.reason) {
    return hospital.reason;
  }

  return hospital.footnote_code !== null
    ? `CMS footnote ${hospital.footnote_code}`
    : 'No reason given by CMS';
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
