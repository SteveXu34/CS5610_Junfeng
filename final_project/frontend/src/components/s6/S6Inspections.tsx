/**
 * S6: Hospital Inspection History
 *
 * Helps patients examine whether similar regulatory
 * findings appeared across different inspection dates.
 *
 * Features:
 * - Inspection timeline, newest first
 * - Deficiency counts excluding memos
 * - Repeated tags across distinct survey events
 * - Filters by year, citation status, and category
 * - Original inspector narratives loaded on demand
 *
 * This component does not contain a hospital search form.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getFindingNarrative,
  getHospitalInspections,
  type S6Finding,
  type S6Inspection,
  type S6Response,
} from '../../api/s6';

import './S6Inspections.css';

// ==========================================================
// 1. Types and constants
// ==========================================================

interface InspectionHistoryProps {
  facilityId: string;
  showHeading?: boolean;
}

type SurveyFilter =
  | 'all'
  | 'cited'
  | 'no-citations';

interface RepeatedTag {
  tag: string;
  description: string;
  dates: string[];
  surveyCount: number;
}

const PAGE_SIZE = 8;

// ==========================================================
// 2. Helper functions
// ==========================================================

/**
 * Convert a CMS date into a readable date.
 */
function formatDate(
  value: string | null
): string {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
}

/**
 * Normalize deficiency codes.
 *
 * Examples:
 * A-0747 -> A0747
 * A0747  -> A0747
 */
function normalizeTag(
  tag: string | null
): string {
  return (tag ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Identify memo and non-citation entries.
 *
 * These records must not contribute to
 * deficiency citation counts.
 */
function isMemo(
  finding: S6Finding
): boolean {
  return (
    finding.tag_type === 'Memo' ||
    /not a deficiency citation|initial comments/i.test(
      finding.description ?? ''
    ) ||
    /^(A|C)0{4}$/.test(
      normalizeTag(finding.deficiency_tag)
    )
  );
}

/**
 * Return only cited deficiency rows.
 */
function citedFindings(
  inspection: S6Inspection
): S6Finding[] {
  return inspection.findings.filter(
    (finding) => !isMemo(finding)
  );
}

/**
 * Accept only HTTP(S) source report URLs.
 *
 * Do not invent a report URL when the backend
 * returns null.
 */
function safeReportUrl(
  value: string | null
): string | null {
  return value &&
    /^https?:\/\//i.test(value)
    ? value
    : null;
}

// ==========================================================
// 3. Original inspector narrative component
// ==========================================================

interface FindingNarrativeProps {
  finding: S6Finding;
  facilityId: string;
}

/**
 * Load one inspector narrative only when requested.
 *
 * The API returns original text, not an AI-generated
 * explanation or summary.
 */
function FindingNarrative({
  finding,
  facilityId,
}: FindingNarrativeProps) {
  // --------------------------------------------------------
  // Narrative state
  // --------------------------------------------------------

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');

  const [narrative, setNarrative] = useState<
    string | null
  >(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [expanded, setExpanded] =
    useState(false);

  const controllerRef =
    useRef<AbortController | null>(null);

  // Cancel the request when the component unmounts.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // --------------------------------------------------------
  // Retrieve original inspector text
  // --------------------------------------------------------

  async function loadNarrative() {
    if (
      finding.finding_id == null ||
      status === 'loading'
    ) {
      return;
    }

    controllerRef.current?.abort();

    const controller =
      new AbortController();

    controllerRef.current = controller;

    setStatus('loading');
    setError(null);

    try {
      const response =
        await getFindingNarrative(
          finding.finding_id,
          controller.signal
        );

      if (controller.signal.aborted) {
        return;
      }

      // Verify that the narrative belongs
      // to the selected hospital.
      if (
        response.data.facility_id !== facilityId
      ) {
        throw new Error(
          'The narrative does not match this hospital.'
        );
      }

      setNarrative(
        response.data.narrative
      );

      setStatus('loaded');
    } catch (cause: unknown) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        cause instanceof Error
          ? cause.message
          : 'Unexpected error.';

      // The login-first UI will be implemented
      // on the separate authentication branch.
      setError(
        /not authenticated|unauthorized|401/i.test(
          message
        )
          ? 'Sign in to HQE to read the original inspector text. The login screen is planned for the authentication branch.'
          : message
      );

      setStatus('error');
    }
  }

  // --------------------------------------------------------
  // Finding with no usable ID
  // --------------------------------------------------------

  if (finding.finding_id == null) {
    return (
      <p className="inspection-help">
        Original text cannot be opened because
        this finding has no ID.
      </p>
    );
  }

  // --------------------------------------------------------
  // Narrative display
  // --------------------------------------------------------

  return (
    <div className="inspection-narrative">
      {/* Initial action */}
      {status === 'idle' && (
        <button
          type="button"
          className="inspection-link-button"
          onClick={() =>
            void loadNarrative()
          }
        >
          Read what inspectors wrote ↓
        </button>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <p role="status">
          Loading the original inspector text…
        </p>
      )}

      {/* Error */}
      {status === 'error' && (
        <div
          className="inspection-inline-error"
          role="alert"
        >
          <p>
            {error}
          </p>

          <button
            type="button"
            className="inspection-link-button"
            onClick={() =>
              void loadNarrative()
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* Original written narrative */}
      {status === 'loaded' && (
        <div className="inspection-narrative-text">
          <strong>
            Inspector's original written finding
          </strong>

          {narrative ? (
            <>
              <p
                className={
                  expanded
                    ? ''
                    : 'inspection-narrative-clamped'
                }
              >
                {narrative}
              </p>

              <button
                type="button"
                className="inspection-link-button"
                onClick={() =>
                  setExpanded(
                    (current) => !current
                  )
                }
              >
                {expanded
                  ? 'Show less'
                  : 'Read full text'}
              </button>
            </>
          ) : (
            <p>
              No original narrative text is
              available for this finding.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================================
// 4. Main S6 inspection component
// ==========================================================

export default function InspectionHistory({
  facilityId,
  showHeading = true,
}: InspectionHistoryProps) {
  // --------------------------------------------------------
  // Inspection timeline navigation
  // --------------------------------------------------------

  /**
   * Scroll to the inspection timeline when the user
   * clicks a repeated citation category.
   */
  const timelineRef =
    useRef<HTMLDivElement>(null);

  // --------------------------------------------------------
  // API response state
  // --------------------------------------------------------

  const [loadState, setLoadState] = useState<{
    key: string;
    response: S6Response | null;
    error: string | null;
  }>({
    key: '',
    response: null,
    error: null,
  });

  const [retry, setRetry] =
    useState(0);

  // --------------------------------------------------------
  // Inspection filters
  // --------------------------------------------------------

  const [surveyFilter, setSurveyFilter] =
    useState<SurveyFilter>('all');

  const [yearFilter, setYearFilter] =
    useState('');

  const [tagFilter, setTagFilter] =
    useState('');

  const [keyword, setKeyword] =
    useState('');

  const [conditionOnly, setConditionOnly] =
    useState(false);

  // --------------------------------------------------------
  // Pagination
  // --------------------------------------------------------

  const [paging, setPaging] = useState({
    key: '',
    count: PAGE_SIZE,
  });

  const requestKey =
    `${facilityId}:${retry}`;

  // ========================================================
  // 5. Fetch inspection history
  // ========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    void getHospitalInspections(
      facilityId,
      controller.signal
    )
      .then((response) => {
        if (!controller.signal.aborted) {
          setLoadState({
            key: requestKey,
            response,
            error: null,
          });
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setLoadState({
            key: requestKey,
            response: null,
            error:
              cause instanceof Error
                ? cause.message
                : 'Unexpected error.',
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [facilityId, requestKey]);

  // ========================================================
  // 6. Derived inspection data
  // ========================================================

  const loading =
    loadState.key !== requestKey;

  const response = loading
    ? null
    : loadState.response;

  const error = loading
    ? null
    : loadState.error;

  const inspections = useMemo(
    () => response?.data.inspections ?? [],
    [response]
  );

  /**
   * Count citation rows, excluding memo records.
   */
  const citationCount = inspections.reduce(
    (count, inspection) =>
      count + citedFindings(inspection).length,
    0
  );

  /**
   * Available years for the year dropdown.
   */
  const surveyYears = Array.from(
    new Set(
      inspections
        .map((item) =>
          item.survey_date?.slice(0, 4)
        )
        .filter(
          (year): year is string =>
            Boolean(year)
        )
    )
  ).sort(
    (a, b) => b.localeCompare(a)
  );

  // ========================================================
  // 7. Repeated deficiency tags
  // ========================================================

  /**
   * Group identical deficiency tags across
   * distinct inspection events.
   *
   * A tag repeated within one survey counts as
   * one survey, not multiple separate surveys.
   */
  const repeatedTags = useMemo(() => {
    const tags = new Map<
      string,
      {
        description: string;
        events: Map<string, string>;
      }
    >();

    inspections.forEach(
      (inspection, index) => {
        for (
          const finding of citedFindings(
            inspection
          )
        ) {
          const tag = normalizeTag(
            finding.deficiency_tag
          );

          if (!tag) {
            continue;
          }

          if (!tags.has(tag)) {
            tags.set(tag, {
              description:
                finding.description ??
                'Category unavailable',

              events: new Map(),
            });
          }

          tags.get(tag)?.events.set(
            `${inspection.inspection_id}:${index}`,
            inspection.survey_date ?? ''
          );
        }
      }
    );

    return [...tags.entries()]
      .filter(
        ([, value]) =>
          value.events.size > 1
      )
      .map(
        ([tag, value]): RepeatedTag => ({
          tag,
          description: value.description,
          surveyCount: value.events.size,
          dates: [...value.events.values()].map(
            (date) =>
              formatDate(date || null)
          ),
        })
      )
      .sort(
        (a, b) =>
          b.surveyCount - a.surveyCount ||
          a.tag.localeCompare(b.tag)
      );
  }, [inspections]);

  // ========================================================
  // 8. Filter inspection timeline
  // ========================================================

  const filteredInspections =
    inspections.filter((inspection) => {
      const citations =
        citedFindings(inspection);

      const query =
        keyword.trim().toLowerCase();

      // Filter by citation presence.
      if (
        surveyFilter === 'cited' &&
        citations.length === 0
      ) {
        return false;
      }

      if (
        surveyFilter === 'no-citations' &&
        citations.length > 0
      ) {
        return false;
      }

      // Filter by survey year.
      if (
        yearFilter &&
        inspection.survey_date?.slice(0, 4) !==
          yearFilter
      ) {
        return false;
      }

      // Filter Condition-level surveys.
      if (
        conditionOnly &&
        !citations.some(
          (finding) =>
            finding.tag_type === 'Condition'
        )
      ) {
        return false;
      }

      // Filter by a repeated tag.
      if (
        tagFilter &&
        !citations.some(
          (finding) =>
            normalizeTag(
              finding.deficiency_tag
            ) === tagFilter
        )
      ) {
        return false;
      }

      // Search tag codes and short descriptions.
      if (
        query &&
        !inspection.findings.some(
          (finding) =>
            `${
              finding.deficiency_tag ?? ''
            } ${
              finding.description ?? ''
            }`
              .toLowerCase()
              .includes(query)
        )
      ) {
        return false;
      }

      return true;
    });

  // ========================================================
  // 9. Pagination and filter handlers
  // ========================================================

  const visibleCount =
    paging.key === requestKey
      ? paging.count
      : PAGE_SIZE;

  const visibleInspections =
    filteredInspections.slice(
      0,
      visibleCount
    );

  function resetPage() {
    setPaging({
      key: requestKey,
      count: PAGE_SIZE,
    });
  }

  function resetFilters() {
    setSurveyFilter('all');
    setYearFilter('');
    setTagFilter('');
    setKeyword('');
    setConditionOnly(false);

    resetPage();
  }

  // ==========================================================
  // Navigate to inspections matching a repeated tag
  // ==========================================================

  /**
   * Selecting a repeated citation tag:
   *
   * 1. Filters the timeline to surveys with that tag.
   * 2. Clears conflicting filters.
   * 3. Resets pagination.
   * 4. Scrolls to the inspection timeline.
   */
  function showMatchingInspections(
    tag: string
  ) {
    setTagFilter(tag);

    setSurveyFilter('cited');
    setConditionOnly(false);
    setYearFilter('');
    setKeyword('');

    resetPage();

    // Scroll after React has a chance to render
    // the updated matching inspections.
    window.requestAnimationFrame(() => {
      timelineRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  // ========================================================
  // 10. Render
  // ========================================================

  return (
    <section
      className="inspection-history"
      aria-label="Hospital inspection history"
    >
      {/* Loading */}
      {loading && (
        <p
          className="inspection-status"
          role="status"
        >
          Loading inspection records…
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="inspection-alert"
          role="alert"
        >
          <strong>
            We couldn't load the inspection records.
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setRetry(
                (current) => current + 1
              )
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* Successful response */}
      {!loading && response && (
        <>
          {/* Hospital identity */}
          {showHeading && (
            <header className="inspection-history-heading">
              <p className="inspection-eyebrow">
                HOSPITAL INSPECTIONS · S6
              </p>

              <h2>
                {response.data.hospital.name}
              </h2>

              <p className="inspection-subtitle">
                {response.data.hospital.city},
                {' '}
                {response.data.hospital.state}

                {' · '}CMS facility {facilityId}
              </p>
            </header>
          )}

          {/* Main patient question */}
          <div className="inspection-intro">
            <h3>
              Is it a one-off, or did similar
              problems come up before?
            </h3>

            <p>
              Compare cited regulatory categories
              across survey dates, then read the
              inspectors' original words.
              Repeated tags are clues to review,
              not proof of identical incidents
              or a current safety problem.
            </p>
          </div>

          {/* Summary metrics */}
          <div
            className="inspection-summary"
            aria-label="Inspection summary"
          >
            <div>
              <strong>
                {inspections.length}
              </strong>

              <span>
                Survey events in this import
              </span>
            </div>

            <div>
              <strong>
                {citationCount}
              </strong>

              <span>
                Citation-tag rows (not memos)
              </span>
            </div>

            <div>
              <strong>
                {repeatedTags.length}
              </strong>

              <span>
                Tags cited on multiple surveys
              </span>
            </div>
          </div>

          {/* Coverage caveat */}
          <p className="inspection-caveat">
            These are historical CMS/QCOR survey
            records, not a safety score.
            They may omit accreditation surveys
            or events under earlier facility IDs.
            No imported inspection or citation
            does not prove no problem occurred.
          </p>

          {/* ================================================
              Repeated citation categories
              ================================================ */}

          <section
            className="inspection-patterns"
            aria-label="Repeated deficiency categories"
          >
            <h3>
              Repeated citation categories
            </h3>

            {repeatedTags.length === 0 ? (
              <p>
                No exact deficiency tag was cited
                across multiple survey events in
                these imported records.
                This does not rule out
                recurring problems.
              </p>
            ) : (
              <div className="inspection-pattern-list">
                {repeatedTags
                  .slice(0, 10)
                  .map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      className="inspection-pattern"
                      onClick={() => {
                        showMatchingInspections(item.tag)
                      }}
                    >
                      <strong>
                        {item.tag}
                        {' · '}
                        {item.description}
                      </strong>

                      <span>
                        {item.surveyCount} surveys
                        {' · '}
                        {item.dates.join(' · ')}
                      </span>

                      <small>
                        Show matching inspections →
                      </small>
                    </button>
                  ))}
              </div>
            )}
          </section>

          {/* ================================================
              Inspection timeline filters
              ================================================ */}

          <div
            className="inspection-filter-heading"
            ref={timelineRef}
          >
            <h3>
              Inspection timeline
            </h3>

            <p>
              Most recent survey first.
              Expand a survey to see recorded
              citations and comments.
            </p>
          </div>

          <div className="inspection-filters">
            {/* Citation filter */}
            <label>
              Survey records

              <select
                value={surveyFilter}
                onChange={(event) => {
                  setSurveyFilter(
                    event.target.value as SurveyFilter
                  );

                  resetPage();
                }}
              >
                <option value="all">
                  All surveys
                </option>

                <option value="cited">
                  With cited deficiencies
                </option>

                <option value="no-citations">
                  Without cited deficiencies
                  in this import
                </option>
              </select>
            </label>

            {/* Year filter */}
            <label>
              Year

              <select
                value={yearFilter}
                onChange={(event) => {
                  setYearFilter(
                    event.target.value
                  );

                  resetPage();
                }}
              >
                <option value="">
                  All years
                </option>

                {surveyYears.map((year) => (
                  <option
                    value={year}
                    key={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </label>

            {/* Category search */}
            <label>
              Tag or category keyword

              <input
                value={keyword}
                placeholder="e.g. A0747 or infection"
                onChange={(event) => {
                  setKeyword(
                    event.target.value
                  );

                  resetPage();
                }}
              />
            </label>

            {/* Condition-level findings */}
            <label className="inspection-filter-check">
              <input
                type="checkbox"
                checked={conditionOnly}
                onChange={(event) => {
                  setConditionOnly(
                    event.target.checked
                  );

                  resetPage();
                }}
              />

              Condition-level surveys only
            </label>
          </div>

          <p className="inspection-help">
            Keyword search checks published tag
            codes and category names, not the full
            inspector narratives stored separately.
          </p>

          {/* Active repeated-tag filter */}
          {tagFilter && (
            <p className="inspection-active-filter">
              Showing surveys with tag{' '}

              <strong>
                {tagFilter}
              </strong>
              .{' '}

              <button
                type="button"
                onClick={() => {
                  setTagFilter('');
                  resetPage();
                }}
              >
                Remove tag filter
              </button>
            </p>
          )}

          {/* Clear inspection filters */}
          {(
            surveyFilter !== 'all' ||
            yearFilter ||
            tagFilter ||
            keyword ||
            conditionOnly
          ) && (
            <button
              type="button"
              className="inspection-clear"
              onClick={resetFilters}
            >
              Clear inspection filters
            </button>
          )}

          {/* Result count */}
          <p
            className="inspection-result-count"
            role="status"
          >
            Showing{' '}

            {Math.min(
              visibleCount,
              filteredInspections.length
            )}

            {' '}of{' '}
            {filteredInspections.length}
            {' '}matching survey events
          </p>

          {/* ================================================
              Empty states
              ================================================ */}

          {inspections.length === 0 ? (
            <div className="inspection-empty">
              <strong>
                No inspection records in the
                imported dataset.
              </strong>

              <p>
                This does not mean the hospital
                was never inspected or had
                no deficiencies.
              </p>
            </div>
          ) : filteredInspections.length === 0 ? (
            <div className="inspection-empty">
              <strong>
                No surveys match these filters.
              </strong>

              <p>
                Try clearing the filters to
                review the complete imported history.
              </p>
            </div>
          ) : (
            <>
              {/* ==========================================
                  Inspection event cards
                  ========================================== */}

              <div className="inspection-list">
                {visibleInspections.map(
                  (inspection, index) => {        
                    /**
                     * All actual citations in this survey.
                     */
                    const allCitations =
                      citedFindings(inspection);

                    /**
                     * When investigating a repeated category,
                     * display only findings matching that tag.
                     */
                    const citations = tagFilter
                      ? allCitations.filter(
                          (finding) =>
                            normalizeTag(
                              finding.deficiency_tag
                            ) === tagFilter
                        )
                      : allCitations;

                    /**
                     * Hide unrelated memo records when a
                     * repeated deficiency tag is selected.
                     */
                    const memoCount = tagFilter
                      ? 0
                      : inspection.findings.length -
                        allCitations.length;

                    const reportUrl =
                      safeReportUrl(
                        inspection.report_url
                      );

                    return (
                      <details
                        key={
                          `${inspection.inspection_id}-${tagFilter || 'all'}-${index}`
                        }
                        className="inspection-event"
                        open={
                          Boolean(tagFilter) &&
                          index === 0
                            ? true
                            : undefined
                        }
                      >
                        {/* Survey heading */}
                        <summary>
                          <span className="inspection-event-title">
                            <strong>
                              {formatDate(
                                inspection.survey_date
                              )}
                            </strong>

                            <small>
                              {inspection.survey_type ??
                                'Survey type unavailable'}

                              {' · '}Event{' '}
                              {inspection.inspection_id}
                            </small>
                          </span>

                          <span className="inspection-event-count">
                            {tagFilter ? (
                              <>
                                {citations.length}
                                {' '}
                                {tagFilter}
                                {' '}
                                {citations.length === 1
                                  ? 'finding'
                                  : 'findings'}
                              </>
                            ) : (
                              <>
                                {allCitations.length}
                                {' '}cited deficiency rows
                              </>
                            )}
                          </span>
                        </summary>

                        {/* Survey details */}
                        <div className="inspection-event-body">
                          {/* No cited deficiency rows */}
                          {citations.length === 0 && (
                            <p className="inspection-help">
                              No cited deficiencies
                              identified among this
                              event's imported rows.

                              {memoCount > 0
                                ? ` ${memoCount} memo/non-citation rows are recorded.`
                                : ''}
                            </p>
                          )}

                          {/* Cited findings */}
                          {citations.length > 0 && (
                            <ul className="inspection-findings">
                              {citations.map(
                                (
                                  finding,
                                  findingIndex
                                ) => (
                                  <li
                                    key={
                                      `${finding.finding_id ?? 'finding'}-${findingIndex}`
                                    }
                                  >
                                    <div className="inspection-finding-heading">
                                      <strong>
                                        {normalizeTag(
                                          finding.deficiency_tag
                                        ) ||
                                          'Tag unavailable'}

                                        {' · '}

                                        {finding.description ??
                                          'Category unavailable'}
                                      </strong>

                                      <span className="inspection-tag">
                                        {finding.tag_type ??
                                          'Level unavailable'}
                                      </span>
                                    </div>

                                    <p className="inspection-help">
                                      The title above is
                                      the regulatory category,
                                      not a summary of the
                                      inspectors' observations.
                                    </p>

                                    <FindingNarrative
                                      finding={finding}
                                      facilityId={facilityId}
                                    />

                                    {/* Repeated tag indicator */}
                                    {repeatedTags.some(
                                      (item) =>
                                        item.tag ===
                                        normalizeTag(
                                          finding.deficiency_tag
                                        )
                                    ) && (
                                      <p className="inspection-repeat-note">
                                        ↺ This tag is also
                                        cited in other dated
                                        surveys in this import.
                                      </p>
                                    )}
                                  </li>
                                )
                              )}
                            </ul>
                          )}

                          {/* Memo and non-citation records */}
                          {memoCount > 0 && (
                            <details className="inspection-memos">
                              <summary>
                                Inspector comments /
                                non-citations ({memoCount})
                              </summary>

                              <ul className="inspection-findings">
                                {inspection.findings
                                  .filter(isMemo)
                                  .map(
                                    (
                                      finding,
                                      findingIndex
                                    ) => (
                                      <li
                                        key={
                                          `${finding.finding_id ?? 'memo'}-${findingIndex}`
                                        }
                                      >
                                        <strong>
                                          {normalizeTag(
                                            finding.deficiency_tag
                                          )}

                                          {' · '}

                                          {finding.description}
                                        </strong>

                                        <FindingNarrative
                                          finding={finding}
                                          facilityId={facilityId}
                                        />
                                      </li>
                                    )
                                  )}
                              </ul>
                            </details>
                          )}

                          {/* Verified report link only */}
                          {reportUrl && (
                            <a
                              href={reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open original report ↗
                            </a>
                          )}
                        </div>
                      </details>
                    );
                  }
                )}
              </div>

              {/* Pagination */}
              {visibleCount <
                filteredInspections.length && (
                <button
                  className="inspection-load-more"
                  type="button"
                  onClick={() =>
                    setPaging({
                      key: requestKey,
                      count:
                        visibleCount + PAGE_SIZE,
                    })
                  }
                >
                  Show more (
                  {visibleCount} of{' '}
                  {filteredInspections.length}
                  {' '}shown)
                </button>
              )}
            </>
          )}

          {/* ================================================
              CMS sources and limitations
              ================================================ */}

          <details className="inspection-sources">
            <summary>
              Sources and coverage limitations
            </summary>

            <ul>
              {response.source.map(
                (source, index) => (
                  <li
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
                          {' · '}Coverage{' '}

                          {formatDate(
                            source.period_start
                          )}

                          {' – '}

                          {formatDate(
                            source.period_end
                          )}
                        </span>
                      )}

                    {source.release_date && (
                      <span>
                        {' · '}Released{' '}

                        {formatDate(
                          source.release_date
                        )}
                      </span>
                    )}
                  </li>
                )
              )}
            </ul>

            {response.notes.map(
              (note, index) => (
                <p key={index}>
                  {note}
                </p>
              )
            )}

            <p>
              The imported QCOR events may differ
              from other providers' report collections.
              Counts reflect imported records,
              not all possible inspections.
            </p>

            <a
              href="https://qcor.cms.gov/Hospital_2567_Reports"
              target="_blank"
              rel="noopener noreferrer"
            >
              Search official CMS QCOR reports ↗
            </a>
          </details>
        </>
      )}
    </section>
  );
}
