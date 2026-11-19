/**
 * Hospital Profile
 *
 * Presents CMS hospital information and quality measures in one
 * cohesive overview. Inspection history has its own tab.
 *
 * No new backend endpoints or inferred measurements.
 */

import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  getS1Ratings,
  type S1RatingsResponse,
} from '../../api/s1';

import {
  getS2HeartFailure,
  type S2HeartFailureResponse,
} from '../../api/s2';

import {
  getS3HipKnee,
  type S3HipKneeResponse,
} from '../../api/s3';

import { getEmergencyDepartmentTimes } from '../../api/s4';

import type {
  ApiResponse,
  Hospital,
  S4Hospital,
  S4Response,
} from '../../api/types';

import InspectionHistory from '../s6/S6Inspections';

import './HospitalProfile.css';

// ==========================================================
// 1. Types
// ==========================================================

export interface HospitalProfileHospital extends Hospital {
  overall_rating?: number | null;
  hospital_type?: string | null;
  ownership?: string | null;
  county?: string | null;
  emergency_services?: boolean | null;
}

interface HospitalProfileProps {
  hospital: HospitalProfileHospital;
  emergencyData?: S4Hospital | null;
  onBack: () => void;
}

type ProfileTab = 'overview' | 'inspections';

type QualityKey = 's1' | 's2' | 's3' | 's4';

interface QualityState {
  key: string;
  loading: boolean;
  s1: S1RatingsResponse | null;
  s2: S2HeartFailureResponse | null;
  s3: S3HipKneeResponse | null;
  s4: S4Response | null;
  failed: QualityKey[];
}

// ==========================================================
// 2. Formatting and source helpers
// ==========================================================

function showValue(
  value: string | number | null | undefined,
  suffix = ''
): string {
  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }

  return `${value}${suffix}`;
}

function showPeriod(
  start: string | null | undefined,
  end: string | null | undefined
): string | null {
  if (start && end) {
    return `Reporting period: ${start} to ${end}`;
  }

  return null;
}

interface MetricCardProps {
  label: string;
  value: string;
  description?: ReactNode;
  period?: string | null;
  compact?: boolean;
}

/** One presentation style for every quality metric, regardless of API source. */
function MetricCard({
  label,
  value,
  description,
  period,
  compact = false,
}: MetricCardProps) {
  return (
    <article className={`hqe-profile-stat ${compact ? 'hqe-profile-stat--compact' : ''}`}>
      {compact ? <h4>{label}</h4> : <h3>{label}</h3>}
      <p className="hqe-profile-stat-value">{value}</p>
      {description && (
        <div className="hqe-profile-stat-description">{description}</div>
      )}
      {period && <p className="hqe-profile-stat-period">{period}</p>}
    </article>
  );
}

interface SourceEntry {
  label: string;
  response: ApiResponse<unknown> | null;
}

/** One disclosure for all CMS provenance and limitations. */
function DataSources({ entries }: { entries: SourceEntry[] }) {
  const available = entries.filter(
    ({ response }) =>
      response && (response.source.length > 0 || response.notes.length > 0)
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <details className="hqe-profile-sources">
      <summary>CMS data sources and limitations</summary>
      <p className="hqe-profile-sources-intro">
        These measures come from different published datasets and may cover
        different reporting periods. Missing values do not mean a score of zero.
      </p>

      <div className="hqe-profile-source-list">
        {available.map(({ label, response }) => (
          <div className="hqe-profile-source-item" key={label}>
            <h4>{label}</h4>
            {response?.source.map((source, index) => (
              <p key={`${source.dataset_id ?? source.dataset}-${index}`}>
                {source.dataset}
                {source.release_date && ` · Released ${source.release_date}`}
                {source.period_start && source.period_end &&
                  ` · ${source.period_start} to ${source.period_end}`}
              </p>
            ))}
            {response?.notes.map((note, index) => (
              <p key={`note-${index}`}>{note}</p>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}

// ==========================================================
// 3. Hospital Profile
// ==========================================================

export default function HospitalProfile({
  hospital,
  emergencyData,
  onBack,
}: HospitalProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const [quality, setQuality] = useState<QualityState>({
    key: '',
    loading: true,
    s1: null,
    s2: null,
    s3: null,
    s4: null,
    failed: [],
  });

  const requestKey = [
    hospital.facility_id,
    hospital.state,
    hospital.city ?? '',
  ].join(':');

  // Keep all existing API calls and match results by CMS facility ID.
  useEffect(() => {
    const controller = new AbortController();

    async function loadQuality() {
      const requests = [
        getS1Ratings(hospital.state, controller.signal),
        getS2HeartFailure(hospital.state, controller.signal),
        getS3HipKnee(hospital.state, controller.signal),
        hospital.city
          ? getEmergencyDepartmentTimes(
              hospital.city,
              hospital.state,
              controller.signal
            )
          : Promise.resolve(null),
      ] as const;

      const results = await Promise.allSettled(requests);
      if (controller.signal.aborted) return;

      const failed: QualityKey[] = [];
      const keys: QualityKey[] = ['s1', 's2', 's3', 's4'];
      results.forEach((result, index) => {
        if (result.status === 'rejected') failed.push(keys[index]);
      });

      setQuality({
        key: requestKey,
        loading: false,
        s1: results[0].status === 'fulfilled' ? results[0].value : null,
        s2: results[1].status === 'fulfilled' ? results[1].value : null,
        s3: results[2].status === 'fulfilled' ? results[2].value : null,
        s4: results[3].status === 'fulfilled' ? results[3].value : null,
        failed,
      });
    }

    void loadQuality();
    return () => controller.abort();
  }, [hospital.city, hospital.state, requestKey]);

  const currentQuality = quality.key === requestKey ? quality : null;
  const loading = !currentQuality || currentQuality.loading;

  const s1 = currentQuality?.s1 ?? null;
  const s2 = currentQuality?.s2 ?? null;
  const s3 = currentQuality?.s3 ?? null;
  const s4 = currentQuality?.s4 ?? null;

  const unrated = s1?.data.unrated.find(
    (item) => item.facility_id === hospital.facility_id
  );
  const s2Hospital = s2?.data.hospitals.find(
    (item) => item.facility_id === hospital.facility_id
  );
  const s3Hospital = s3?.data.hospitals.find(
    (item) => item.facility_id === hospital.facility_id
  );
  const s3Unavailable = s3?.data.unavailable.find(
    (item) => item.facility_id === hospital.facility_id
  );
  const s4Hospital = emergencyData ?? s4?.data.hospitals.find(
    (item) => item.facility_id === hospital.facility_id
  ) ?? null;
  const s4Unavailable = s4?.data.no_data.find(
    (item) => item.facility_id === hospital.facility_id
  );

  const isFiveStar = s1?.data.five_star.some(
    (item) => item.facility_id === hospital.facility_id
  ) ?? false;
  const isKnownUnrated = hospital.overall_rating === null || Boolean(unrated);
  const overallRating = typeof hospital.overall_rating === 'number'
    ? hospital.overall_rating
    : isFiveStar ? 5 : null;

  const failedNames: Record<QualityKey, string> = {
    s1: 'overall hospital ratings',
    s2: 'heart-failure readmissions',
    s3: 'hip/knee complications',
    s4: 'emergency department visit durations',
  };

  const ratingValue = overallRating != null
    ? `${overallRating} / 5 stars`
    : loading && hospital.overall_rating === undefined
      ? 'Loading…'
      : isKnownUnrated
        ? 'Not rated'
        : 'Not available';

  const heartFailurePeriod = showPeriod(
    s2Hospital?.period_start, s2Hospital?.period_end
  );
  const hipKneePeriod = showPeriod(
    s3Hospital?.period_start, s3Hospital?.period_end
  );
  const emergencyPeriod = showPeriod(
    s4Hospital?.period_start, s4Hospital?.period_end
  );

  const relativeReadmissions = s2Hospital?.better_than_expected === null ||
    s2Hospital?.better_than_expected === undefined
      ? 'Not available'
      : s2Hospital.better_than_expected
        ? 'Lower than expected'
        : 'At or above expected';

  const hipKneeInterval = s3Hospital && (
    s3Hospital.lower_estimate != null || s3Hospital.higher_estimate != null
  )
    ? `${showValue(s3Hospital.lower_estimate, '%')} to ${showValue(s3Hospital.higher_estimate, '%')}`
    : 'Not available';

  const sourceEntries: SourceEntry[] = [
    { label: 'Overall hospital rating', response: s1 },
    { label: 'Heart-failure readmissions', response: s2 },
    { label: 'Hip/knee replacement complications', response: s3 },
    { label: 'Emergency department visit duration', response: s4 },
  ];

  return (
    <main className="hqe-profile-page">
      <button
        className="hqe-profile-back"
        type="button"
        onClick={onBack}
      >
        ← Back to search results
      </button>

      <header className="hqe-profile-header">
        <p className="hqe-profile-eyebrow">HOSPITAL PROFILE</p>
        <h1>{hospital.name}</h1>
        <p>
          {[hospital.city, hospital.state, hospital.zip_code]
            .filter(Boolean).join(', ')}
          {' · '}CMS facility ID {hospital.facility_id}
        </p>
      </header>

      <div
        className="hqe-profile-tabs"
        role="group"
        aria-label="Hospital profile sections"
      >
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          aria-pressed={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={activeTab === 'inspections' ? 'active' : ''}
          aria-pressed={activeTab === 'inspections'}
          onClick={() => setActiveTab('inspections')}
        >
          Inspection
        </button>
      </div>

      {activeTab === 'overview' ? (
        <section className="hqe-profile-panel" aria-label="Hospital overview">
          <div className="hqe-profile-intro">
            <h2>Hospital overview</h2>
            <p>
              Explore this hospital’s published CMS quality and care data.
              Reporting periods vary by measure; missing data does not
              indicate poor performance.
            </p>
          </div>

          {loading && (
            <p className="hqe-profile-loading" role="status">
              Loading hospital quality measures…
            </p>
          )}
          {!loading && Boolean(currentQuality?.failed.length) && (
            <p className="hqe-profile-warning" role="alert">
              Some measurements could not be loaded: {' '}
              {currentQuality?.failed.map((key) => failedNames[key]).join(', ')}.
              Available information is still shown.
            </p>
          )}

          <section className="hqe-profile-content-section" aria-labelledby="hqe-quality-heading">
            <div className="hqe-profile-content-heading">
              <h2 id="hqe-quality-heading">Quality and care measures</h2>
              <p>Published quality indicators for this hospital.</p>
            </div>

            <div className="hqe-profile-highlights">
              <MetricCard
                label="Overall hospital rating"
                value={ratingValue}
                description={!loading && isKnownUnrated
                  ? <>{unrated?.reason ?? 'CMS has not published an overall rating for this hospital.'}{unrated?.footnote_code && ` (CMS footnote ${unrated.footnote_code})`}</>
                  : !loading && currentQuality?.failed.includes('s1') && overallRating == null
                    ? 'Rating information is temporarily unavailable.'
                    : undefined}
              />
              <MetricCard
                label="Heart-failure readmission ratio"
                value={loading ? 'Loading…' : showValue(s2Hospital?.excess_readmission_ratio)}
                description={loading
                  ? undefined
                  : s2Hospital
                    ? <>
                        {relativeReadmissions}. A ratio below 1 means fewer readmissions
                        than expected.{s2Hospital.footnote_code && ` CMS footnote: ${s2Hospital.footnote_code}.`}
                      </>
                    : currentQuality?.failed.includes('s2')
                      ? 'Readmission information is temporarily unavailable.'
                      : 'No heart-failure readmission ratio was returned for this hospital.'}
                period={heartFailurePeriod}
              />
              <MetricCard
                label="Hip/knee replacement complication rate"
                value={loading ? 'Loading…' : showValue(s3Hospital?.complication_rate, '%')}
                description={loading
                  ? undefined
                  : s3Hospital
                    ? 'Combined hip and knee replacement complications.'
                    : currentQuality?.failed.includes('s3')
                      ? 'Complication information is temporarily unavailable.'
                      : <>{s3Unavailable?.reason ?? 'CMS has not published a combined hip/knee complication rate for this hospital.'}{s3Unavailable?.footnote_code && ` (CMS footnote ${s3Unavailable.footnote_code})`}</>}
                period={hipKneePeriod}
              />
              <MetricCard
                label="Emergency department visit duration"
                value={s4Hospital
                  ? `${s4Hospital.median_minutes} minutes`
                  : loading ? 'Loading…' : 'Not available'}
                description={s4Hospital
                  ? 'Historical arrival-to-departure duration, not a live emergency-room wait time.'
                  : loading ? undefined
                    : currentQuality?.failed.includes('s4')
                      ? 'Emergency department information is temporarily unavailable.'
                      : <>{s4Unavailable?.reason ?? 'No historical emergency department visit duration was published for this hospital.'}{s4Unavailable?.footnote_code && ` (CMS footnote ${s4Unavailable.footnote_code})`}</>}
                period={emergencyPeriod}
              />
            </div>

            <h3 className="hqe-profile-more-heading">Additional quality information</h3>
            <div className="hqe-profile-support-grid">
              <MetricCard compact
                label="Readmissions compared with expected"
                value={loading ? 'Loading…' : relativeReadmissions}
              />
              <MetricCard compact
                label="Predicted readmission rate"
                value={loading ? 'Loading…' : showValue(s2Hospital?.predicted_readmission_rate, '%')}
              />
              <MetricCard compact
                label="Expected readmission rate"
                value={loading ? 'Loading…' : showValue(s2Hospital?.expected_readmission_rate, '%')}
              />
              <MetricCard compact
                label="30-day readmission rate"
                value={loading ? 'Loading…' : showValue(s2Hospital?.readmission_rate, '%')}
                description="A different measure from the excess readmission ratio."
              />
              <MetricCard compact
                label="Heart-failure readmissions vs. national rate"
                value={loading ? 'Loading…' : s2Hospital?.compared_to_national ?? 'Not available'}
              />
              <MetricCard compact
                label="Hip/knee complications vs. national rate"
                value={loading ? 'Loading…' : s3Hospital?.compared_to_national ?? 'Not available'}
              />
              <MetricCard compact
                label="Hip/knee complication published interval"
                value={loading ? 'Loading…' : hipKneeInterval}
              />
            </div>
          </section>

          <section className="hqe-profile-content-section" aria-labelledby="hqe-details-heading">
            <div className="hqe-profile-content-heading">
              <h2 id="hqe-details-heading">Hospital details</h2>
            </div>
            <dl className="hqe-profile-details">
              <div>
                <dt>Location</dt>
                <dd>{[hospital.city, hospital.state, hospital.zip_code].filter(Boolean).join(', ') || 'Not available'}</dd>
              </div>
              <div>
                <dt>CMS facility ID</dt>
                <dd>{hospital.facility_id}</dd>
              </div>
              {hospital.county && <div><dt>County</dt><dd>{hospital.county}</dd></div>}
              {hospital.hospital_type && <div><dt>Hospital type</dt><dd>{hospital.hospital_type}</dd></div>}
              {hospital.ownership && <div><dt>Ownership</dt><dd>{hospital.ownership}</dd></div>}
              {hospital.emergency_services != null && (
                <div><dt>Emergency services</dt><dd>{hospital.emergency_services ? 'Yes' : 'No'}</dd></div>
              )}
            </dl>
          </section>

          <DataSources entries={sourceEntries} />
        </section>
      ) : (
        <section className="hqe-profile-panel" aria-label="Inspection">
          <div className="hqe-profile-section-heading">
            <h2>Inspection history</h2>
            <p>
              Compare cited categories across survey dates and read
              the original inspector narratives where available.
            </p>
          </div>
          <InspectionHistory
            facilityId={hospital.facility_id}
            showHeading={false}
          />
        </section>
      )}
    </main>
  );
}
