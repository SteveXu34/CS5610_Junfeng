/**
 * S4: Historical Emergency Department Duration
 *
 * Reusable presentation for hospital search results
 * and a future Hospital Profile extraction.
 *
 * OP-18b is historical arrival-to-departure time,
 * not a live ER waiting-time estimate.
 */

import type {
  S4Hospital,
  S4Response,
} from '../../api/types';

import './S4EmergencyCare.css';

// ==========================================================
// 1. Hospital duration metric
// ==========================================================

interface S4EmergencyCareProps {
  data?: S4Hospital | null;
  variant?: 'result' | 'profile';
}

export function S4EmergencyCare({
  data,
  variant = 'result',
}: S4EmergencyCareProps) {
  if (!data) {
    return null;
  }

  if (variant === 'profile') {
    return (
      <div className="s4-profile-metric">
        <dt>
          Historical ED visit duration (S4)
        </dt>

        <dd>
          {data.median_minutes} minutes

          {data.period_start &&
            data.period_end && (
              <small>
                {data.period_start}
                {' to '}
                {data.period_end}
              </small>
            )}
        </dd>
      </div>
    );
  }

  return (
    <span className="s4-result-metric">
      Historical ED duration (S4):{' '}

      <strong>
        {data.median_minutes} min
      </strong>
    </span>
  );
}

// ==========================================================
// 2. S4 source disclosure
// ==========================================================

interface S4EmergencySourcesProps {
  response: S4Response | null;
}

export function S4EmergencySources({
  response,
}: S4EmergencySourcesProps) {
  if (!response) {
    return null;
  }

  return (
    <details className="s4-sources">
      <summary>
        S4 emergency care: data sources and limitations
      </summary>

      {response.source.map((source, index) => (
        <p
          key={
            `${source.dataset_id ?? source.dataset}-${index}`
          }
        >
          <strong>
            {source.dataset}
          </strong>

          {source.period_start &&
            source.period_end && (
              <span>
                {' · '}
                {source.period_start}
                {' to '}
                {source.period_end}
              </span>
            )}

          {source.release_date && (
            <span>
              {' · Released '}
              {source.release_date}
            </span>
          )}
        </p>
      ))}

      {response.notes.map((note, index) => (
        <p key={index}>
          {note}
        </p>
      ))}

      <p>
        OP-18b measures historical emergency department
        arrival-to-departure duration. It is not a live
        wait-time estimate.
      </p>
    </details>
  );
}
