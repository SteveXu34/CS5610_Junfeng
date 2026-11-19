import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import { apiGet } from './api/client';
import { searchHospitals } from './api/hospitals';

import type {
  ApiResponse,
  CmsSource,
  Hospital,
  S4Response,
  SearchFiltersInput,
  SearchHospital as ApiSearchHospital,
} from './api/types';

import { getEmergencyDepartmentTimes } from './api/s4';

import {
  getS2HeartFailure,
  type S2HeartFailureResponse,
} from './api/s2';

import {
  getS3HipKnee,
  type S3HipKneeResponse,
} from './api/s3';

import HospitalProfile from './components/hospitals/HospitalProfile';

import { ChatPanel } from './components/chat/ChatPanel';

import { SavedReports } from './components/reports/SavedReports';

import {
  S4EmergencyCare,
  S4EmergencySources,
} from './components/s4/S4EmergencyCare';

import './App.css';

// ==========================================================
// 1. Types
// ==========================================================

type Mode = 'chat' | 'search';

type SearchMode = 'full' | 'basic';

// Use the shared SearchHospital from types.ts (non-optional nulls).
type SearchHospital = ApiSearchHospital;

interface SearchFilters {
  state: string;
  city: string;
  min_rating: string;
  hospital_type: string;
  ownership: string;
  emergency_services: '' | 'true' | 'false';
  unrated_only: boolean;
  s2_status: '' | 'below' | 'at-or-above' | 'no-data';
  s3_status: '' | 'available' | 'unavailable';
  s4_max_minutes: string;
}

type SearchResponse = ApiResponse<{
  hospitals: SearchHospital[];
}>;

type HospitalListResponse = ApiResponse<{
  hospitals: Hospital[];
}>;

// ==========================================================
// 2. Constants
// ==========================================================

const initialFilters: SearchFilters = {
  state: '',
  city: '',
  min_rating: '',
  hospital_type: '',
  ownership: '',
  emergency_services: '',
  unrated_only: false,
  s2_status: '',
  s3_status: '',
  s4_max_minutes: '',
};

/**
 * State dropdown options.
 *
 * The value sent to the backend is the two-letter
 * code, while the user sees the full state name.
 */
const stateOptions = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['PR', 'Puerto Rico'],
  ['GU', 'Guam'],
  ['VI', 'U.S. Virgin Islands'],
  ['AS', 'American Samoa'],
  ['MP', 'Northern Mariana Islands'],
] as const;

const hospitalTypes = [
  'Acute Care Hospitals',
  'Critical Access Hospitals',
  'Psychiatric',
  'Acute Care - Veterans Administration',
];

// ==========================================================
// 3. Formatting helpers
// ==========================================================

/**
 * Convert API field names into readable labels.
 *
 * Example:
 * "overall_rating" -> "Overall Rating"
 */
function titleCase(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

// ==========================================================
// 4. CMS sources
// ==========================================================

interface SourceListProps {
  sources: CmsSource[];
  notes: string[];
}

function SourceList({
  sources,
  notes,
}: SourceListProps) {
  if (
    sources.length === 0 &&
    notes.length === 0
  ) {
    return null;
  }

  return (
    <details className="hqe-disclosure">
      <summary>
        CMS sources and limitations
      </summary>

      {sources.map((source, index) => (
        <p
          key={
            `${source.dataset_id ?? source.dataset}-${index}`
          }
        >
          {source.dataset}

          {source.release_date &&
            ` · Released ${source.release_date}`}

          {source.period_start &&
            source.period_end &&
            ` · ${source.period_start} to ${source.period_end}`}
        </p>
      ))}

      {notes.map((note, index) => (
        <p key={index}>
          {note}
        </p>
      ))}
    </details>
  );
}

// ==========================================================
// 5. Main Application
// ==========================================================

function App() {
  // --------------------------------------------------------
  // Homepage mode
  // --------------------------------------------------------

  const [mode, setMode] =
    useState<Mode>('chat');

  // --------------------------------------------------------
  // Selected hospital for Hospital Profile
  // --------------------------------------------------------

  const [
    selectedHospital,
    setSelectedHospital,
  ] = useState<SearchHospital | null>(null);

  // --------------------------------------------------------
  // Hospital search state
  // --------------------------------------------------------

  const [filters, setFilters] =
    useState<SearchFilters>(
      initialFilters
    );

  // Dependent City dropdown
  const [cityOptions, setCityOptions] =
    useState<string[]>([]);

  const [ownershipOptions, setOwnershipOptions] =
    useState<string[]>([]);

  const [cityLoading, setCityLoading] =
    useState(false);

  const [cityError, setCityError] =
    useState<string | null>(null);

  const cityRequestRef =
    useRef<AbortController | null>(null);

  // Main hospital-search request and supplementary S4 request.
  const searchRequestRef =
    useRef<AbortController | null>(null);

  // Search results
  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState<string | null>(null);

  const [searchResult, setSearchResult] =
    useState<SearchResponse | null>(null);

  const [searchMode, setSearchMode] =
    useState<SearchMode>('full');

  // S2/S3 state-level metrics and S4 city metrics.
  const [s2Result, setS2Result] =
    useState<S2HeartFailureResponse | null>(null);

  const [s3Result, setS3Result] =
    useState<S3HipKneeResponse | null>(null);

  const [edResult, setEdResult] =
    useState<S4Response | null>(null);

  // Number of optional filters currently selected.
  const advancedFilterCount = [
    filters.ownership,
    filters.emergency_services,
    filters.s2_status,
    filters.s3_status,
    filters.s4_max_minutes,
  ].filter(Boolean).length;

  // ========================================================
  // 6. Effects
  // ========================================================

  /**
   * Cancel outstanding City requests when
   * the component unmounts.
   */
  useEffect(() => {
    return () => {
      cityRequestRef.current?.abort();
      searchRequestRef.current?.abort();
    };
  }, []);

  // ========================================================
  // 7. State and City dropdown handlers
  // ========================================================

  /**
   * When a State changes:
   *
   * 1. Clear the selected City.
   * 2. Cancel the previous City request.
   * 3. Load cities in the new State.
   */
  function handleStateChange(
    state: string
  ) {
    // Cancel requests tied to the previously selected state.
    cityRequestRef.current?.abort();
    searchRequestRef.current?.abort();

    setFilters((current) => ({
      ...current,
      state,
      city: '',
      s4_max_minutes: '',
    }));

    setCityOptions([]);
    setOwnershipOptions([]);
    setCityLoading(false);
    setCityError(null);

    setSearchLoading(false);
    setSearchError(null);
    setSearchResult(null);
    setS2Result(null);
    setS3Result(null);
    setEdResult(null);

    if (!state) {
      return;
    }

    const controller = new AbortController();
    cityRequestRef.current = controller;
    setCityLoading(true);

    // A failed backend/database request should not leave the
    // City dropdown showing "Loading cities" forever.
    const timer = window.setTimeout(() => {
      if (
        cityRequestRef.current === controller &&
        !controller.signal.aborted
      ) {
        controller.abort();
        setCityLoading(false);
        setCityError(
          'City loading timed out. Check FastAPI/database connectivity, ' +
          'or search the whole state.'
        );
      }
    }, 12000);

    // The supported search endpoint includes ownership/type,
    // so dropdown values come from the actual CMS import.
    void apiGet<SearchResponse>(
      `/hospitals/search?state=${encodeURIComponent(state)}`,
      controller.signal
    )
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        const cities = response.data.hospitals
          .map((hospital) => hospital.city?.trim())
          .filter(
            (city): city is string => Boolean(city)
          );

        setCityOptions(
          [...new Set(cities)].sort((a, b) =>
            a.localeCompare(b)
          )
        );

        const ownerships = response.data.hospitals
          .map((hospital) => hospital.ownership?.trim())
          .filter(
            (value): value is string => Boolean(value)
          );

        setOwnershipOptions(
          [...new Set(ownerships)].sort((a, b) =>
            a.localeCompare(b)
          )
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const detail = error instanceof Error
          ? error.message
          : 'Unknown request error';

        setCityError(
          `Could not load cities: ${detail}. ` +
          'You can still search the whole state.'
        );
      })
      .finally(() => {
        window.clearTimeout(timer);

        if (cityRequestRef.current === controller) {
          cityRequestRef.current = null;
          setCityLoading(false);
        }
      });
  }

  /**
   * Update one hospital search filter.
   */
  function updateFilter<
    K extends keyof SearchFilters
  >(
    name: K,
    value: SearchFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /**
   * Clear filters, City options, and search results.
   */
  function clearFilters() {
    cityRequestRef.current?.abort();
    searchRequestRef.current?.abort();

    setFilters(initialFilters);

    setCityOptions([]);
    setOwnershipOptions([]);
    setCityLoading(false);
    setCityError(null);

    setSearchLoading(false);
    setSearchError(null);
    setSearchResult(null);
    setS2Result(null);
    setS3Result(null);
    setEdResult(null);
  }

  // ========================================================
  // 10. Hospital Search
  // ========================================================

  /**
   * Search hospitals using the newer API.
   *
   * If the new endpoint is unavailable, fall back to
   * basic State/City searching only.
   *
   * Filters that the older endpoint cannot support
   * must never be silently ignored.
   */
  async function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!filters.state) {
      setSearchError('Please choose a state.');
      return;
    }

    if (filters.unrated_only && filters.min_rating) {
      setSearchError('Choose either unrated hospitals or a minimum rating.');
      return;
    }

    if (filters.s4_max_minutes && !filters.city) {
      setSearchError(
        'Choose a city before applying a historical ED duration filter.'
      );
      return;
    }

    // City loading is optional. Searching a whole state
    // should still work if its city list is unavailable.
    const selected = { ...filters };

    searchRequestRef.current?.abort();

    const controller = new AbortController();
    searchRequestRef.current = controller;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setS2Result(null);
    setS3Result(null);
    setEdResult(null);

    try {
      let response: SearchResponse;
      let resultMode: SearchMode = 'full';

      // Build a typed SearchFiltersInput for the shared helper.
      const searchInput: SearchFiltersInput = {
        state: selected.state,
      };
      if (selected.city) searchInput.city = selected.city;
      if (selected.min_rating) searchInput.min_rating = selected.min_rating;
      if (selected.hospital_type) searchInput.hospital_type = selected.hospital_type;
      if (selected.emergency_services === 'true') searchInput.emergency_services = true;
      else if (selected.emergency_services === 'false') searchInput.emergency_services = false;

      try {
        response = await searchHospitals(searchInput, controller.signal);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : '';

        const endpointMissing =
          /404|resource not found/i.test(message);

        if (!endpointMissing) {
          throw error;
        }

        // The old listing endpoint cannot apply advanced
        // filters; never pretend it has applied them.
        if (
          selected.min_rating ||
          selected.hospital_type ||
          selected.ownership ||
          selected.emergency_services ||
          selected.unrated_only
        ) {
          throw new Error(
            'The updated hospital search endpoint is not available. ' +
            'Rating, type, and emergency-service filters require the new backend.',
            { cause: error }
          );
        }

        const basic = await apiGet<HospitalListResponse>(
          `/hospitals?state=${encodeURIComponent(
            selected.state
          )}`,
          controller.signal
        );

        response = {
          ...basic,
          data: {
            hospitals: basic.data.hospitals.filter(
              (hospital) =>
                !selected.city ||
                hospital.city?.trim().toUpperCase() ===
                  selected.city.trim().toUpperCase()
            ) as SearchHospital[],
          },
        };

        resultMode = 'basic';
      }

      if (controller.signal.aborted) {
        return;
      }

      // ----------------------------------------------------
      // Existing story APIs: S2/S3 by state, S4 by city.
      // These are independent real CMS datasets; no fake
      // cross-story backend endpoint is assumed.
      // ----------------------------------------------------

      const [s2Load, s3Load, s4Load] = await Promise.allSettled([
        getS2HeartFailure(selected.state, controller.signal),
        getS3HipKnee(selected.state, controller.signal),
        selected.city
          ? getEmergencyDepartmentTimes(
              selected.city,
              selected.state,
              controller.signal
            )
          : Promise.resolve(null),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      const s2 = s2Load.status === 'fulfilled'
        ? s2Load.value
        : null;

      const s3 = s3Load.status === 'fulfilled'
        ? s3Load.value
        : null;

      const s4 = s4Load.status === 'fulfilled'
        ? s4Load.value
        : null;

      // Never pretend a requested filter ran when its
      // underlying CMS dataset could not be loaded.
      if (selected.s2_status && !s2) {
        throw new Error('Heart-failure data is unavailable. The heart-failure filter was not applied.');
      }

      if (selected.s3_status && !s3) {
        throw new Error('Hip/knee data is unavailable. The hip/knee filter was not applied.');
      }

      if (selected.s4_max_minutes && !s4) {
        throw new Error('ED duration data is unavailable. The ED duration filter was not applied.');
      }

      if (selected.unrated_only && resultMode !== 'full') {
        throw new Error('Unrated-hospital filtering requires the hospital search endpoint.');
      }

      const s2ById = new Map(
        s2?.data.hospitals.map(
          (item) => [item.facility_id, item]
        ) ?? []
      );

      const s3Reported = new Set(
        s3?.data.hospitals.map((item) => item.facility_id) ?? []
      );

      const s3Unavailable = new Set(
        s3?.data.unavailable.map((item) => item.facility_id) ?? []
      );

      const edById = new Map<
        string,
        S4Response['data']['hospitals'][number]
      >(
        s4?.data.hospitals.map(
          (item) => [item.facility_id, item] as const
        ) ?? []
      );

      const filtered = response.data.hospitals.filter((hospital) => {
        if (selected.unrated_only && hospital.overall_rating !== null) {
          return false;
        }

        if (selected.s2_status) {
          const ratio = s2ById.get(hospital.facility_id)
            ?.excess_readmission_ratio ?? null;

          if (selected.s2_status === 'below' && !(ratio != null && ratio < 1)) {
            return false;
          }

          if (selected.s2_status === 'at-or-above' && !(ratio != null && ratio >= 1)) {
            return false;
          }

          if (selected.s2_status === 'no-data' && ratio !== null) {
            return false;
          }
        }

        if (selected.s3_status === 'available' &&
            !s3Reported.has(hospital.facility_id)) {
          return false;
        }

        if (selected.s3_status === 'unavailable' &&
            !s3Unavailable.has(hospital.facility_id)) {
          return false;
        }

        if (selected.s4_max_minutes) {
          const duration = edById.get(hospital.facility_id)
            ?.median_minutes ?? null;

          if (duration === null || duration > Number(selected.s4_max_minutes)) {
            return false;
          }
        }

        return true;
      });

      setSearchResult({
        ...response,
        data: { hospitals: filtered },
        source: [
          ...response.source,
          ...(s2 ? s2.source : []),
          ...(s3 ? s3.source : []),
          ...(s4 ? s4.source : []),
        ],
        notes: [
          ...response.notes,
          ...(s2 ? s2.notes : ['Heart-failure readmission data could not be loaded for these results.']),
          ...(s3 ? s3.notes : ['Hip/knee complication data could not be loaded for these results.']),
          ...(s4 ? s4.notes : []),
        ],
      });

      setSearchMode(resultMode);
      setS2Result(s2);
      setS3Result(s3);
      setEdResult(s4);
    } catch (error: unknown) {
      if (!controller.signal.aborted) {
        setSearchError(
          error instanceof Error
            ? error.message
            : 'Unable to search hospitals.'
        );
      }
    } finally {
      if (searchRequestRef.current === controller) {
        searchRequestRef.current = null;
        setSearchLoading(false);
      }
    }
  }

  // ========================================================
  // 11. Hospital Profile navigation
  // ========================================================

  /**
   * Match S4 ED data to hospital search results
   * using the CMS facility ID.
   */
  const edByFacilityId = new Map(
    edResult?.data.hospitals.map(
      (hospital) => [
        hospital.facility_id,
        hospital,
      ]
    ) ?? []
  );

  const s2ByFacilityId = new Map(
    s2Result?.data.hospitals.map(
      (hospital) => [hospital.facility_id, hospital]
    ) ?? []
  );

  const s3ByFacilityId = new Map(
    s3Result?.data.hospitals.map(
      (hospital) => [hospital.facility_id, hospital]
    ) ?? []
  );

  /**
   * Open a selected Hospital Profile.
   */
  function openHospitalProfile(
    hospital: SearchHospital
  ) {
    setSelectedHospital(hospital);

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }

  /**
   * Return to the search page.
   *
   * All filter selections and search results stay
   * in App state, so the user does not need to search again.
   */
  function returnToSearch() {
    setSelectedHospital(null);

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }

  // ========================================================
  // 12. Render selected Hospital Profile
  // ========================================================

  /**
   * Render a Hospital Profile when a user selects
   * a hospital from the search results.
   *
   * The Profile renders S6 inspection history
   * using the selected hospital's facility ID.
   */
  if (selectedHospital) {
    return (
      <div className="site-shell">
        {/* Profile header */}
        <header className="site-header">
          <div className="site-brand">
            <span className="site-brand-mark">
              H
            </span>

            <span>
              Hospital Quality Explorer
            </span>
          </div>
        </header>

        {/* Selected hospital */}
        <HospitalProfile
          hospital={selectedHospital}
          emergencyData={
            edByFacilityId.get(
              selectedHospital.facility_id
            ) ?? null
          }
          onBack={returnToSearch}
        />

        {/* Footer */}
        <footer className="site-footer">
          <span>
            © Hospital Quality Explorer
          </span>

          <span>
            Built around transparent,
            public hospital data.
          </span>
        </footer>
      </div>
    );
  }

  // ========================================================
  // 13. Render Homepage
  // ========================================================

  return (
    <div className="site-shell">
      {/* ====================================================
          Header
          ==================================================== */}

      <header className="site-header">
        <a
          className="site-brand"
          href="/"
          aria-label="HQE homepage"
        >
          <span className="site-brand-mark">
            H
          </span>

          <span>
            Hospital Quality Explorer
          </span>
        </a>

        <nav
          className="site-nav"
          aria-label="Main navigation"
        >
          <a
            href="#workspace"
            onClick={() =>
              setMode('chat')
            }
          >
            AI Chat
          </a>

          <a
            href="#workspace"
            onClick={() =>
              setMode('search')
            }
          >
            Search hospitals
          </a>

          <a href="#about">
            About the data
          </a>

          <a href="#saved-reports">
            Saved reports
          </a>
        </nav>
      </header>

      <main>
        {/* ==================================================
            Homepage Hero
            ================================================== */}

        <section className="hqe-home-hero">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />

            PUBLIC HEALTH DATA, MADE CLEAR
          </div>

          <h1>
            Better hospital information.
            <span style={{ display: 'block' }}>
              Clearer decisions.
            </span>
          </h1>

          <p>
            Explore published CMS hospital quality data,
            compare hospitals, or ask HQE a question.
          </p>
        </section>

        {/* ==================================================
            Main Workspace
            ================================================== */}

        <section
          className="hqe-workspace"
          id="workspace"
          aria-label="Explore hospital quality"
        >
          {/* AI Chat / Search mode switch */}
          <div
            className="hqe-mode-switch"
            role="group"
            aria-label="Choose a mode"
          >
            <button
              type="button"
              className={
                mode === 'chat'
                  ? 'active'
                  : ''
              }
              aria-pressed={
                mode === 'chat'
              }
              onClick={() =>
                setMode('chat')
              }
            >
              ✳ AI Chat
            </button>

            <button
              type="button"
              className={
                mode === 'search'
                  ? 'active'
                  : ''
              }
              aria-pressed={
                mode === 'search'
              }
              onClick={() =>
                setMode('search')
              }
            >
              ⌕ Search with Filters
            </button>
          </div>

          {/* ==================================================
              S5: AI Chat
              ================================================== */}

          {mode === 'chat' ? (
            <section
              className="hqe-chat-card"
              aria-label="Ask HQE"
            >
              {/* Chat header */}
              <div className="hqe-panel-heading">
                <div>
                  <h2>
                    Ask HQE
                  </h2>

                  <p>
                    Ask about ratings, readmissions,
                    complications, emergency care,
                    or inspections.
                  </p>
                </div>
              </div>

              <ChatPanel />
            </section>
          ) : (
            /* ================================================
               Unified Hospital Search
               ================================================ */

            <section
              className="hqe-search-card"
              aria-label="Hospital search"
            >
              {/* Search heading */}
              <div className="hqe-panel-heading">
                <div>
                  <h2>
                    Explore hospitals
                  </h2>

                  <p>
                    Choose a state and optionally narrow
                    your hospital search.
                  </p>
                </div>
              </div>

              {/* ==================================================
                  Search filters
                  ================================================== */}

              <form
                className="hqe-filter-form"
                onSubmit={handleSearch}
              >
                {/* ============================================
                    Primary filters — always visible
                    ============================================ */}

                {/* State */}
                <label htmlFor="hqe-state">
                  <span>
                    State{' '}
                    <span className="hqe-required">*</span>
                  </span>

                  <select
                    id="hqe-state"
                    required
                    value={filters.state}
                    onChange={(event) =>
                      handleStateChange(event.target.value)
                    }
                  >
                    <option value="">Select a state</option>

                    {stateOptions.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* City */}
                <div className="hqe-city-field">
                  <label htmlFor="hqe-city">
                    City

                    <select
                      id="hqe-city"
                      value={filters.city}
                      onChange={(event) => {
                        updateFilter('city', event.target.value);
                        updateFilter('s4_max_minutes', '');
                      }}
                      disabled={
                        !filters.state ||
                        cityLoading ||
                        Boolean(cityError)
                      }
                    >
                      <option value="">
                        {cityLoading ? 'Loading cities…' : 'Any city'}
                      </option>

                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {titleCase(city.toLowerCase())}
                        </option>
                      ))}
                    </select>
                  </label>

                  {cityLoading && (
                    <small
                      className="hqe-city-status"
                      role="status"
                    >
                      Loading city options. You can still
                      search the whole state.
                    </small>
                  )}

                  {cityError && (
                    <div className="hqe-city-feedback">
                      <small
                        className="hqe-field-error"
                        role="alert"
                      >
                        {cityError}
                      </small>

                      <button
                        type="button"
                        className="hqe-city-retry"
                        onClick={() =>
                          handleStateChange(filters.state)
                        }
                      >
                        Retry cities
                      </button>
                    </div>
                  )}
                </div>

                {/* Hospital type */}
                <label htmlFor="hqe-type">
                  Hospital type

                  <select
                    id="hqe-type"
                    value={filters.hospital_type}
                    onChange={(event) =>
                      updateFilter(
                        'hospital_type',
                        event.target.value
                      )
                    }
                  >
                    <option value="">Any type</option>

                    {hospitalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Rating, including the unrated option */}
                <label htmlFor="hqe-rating">
                  Rating

                  <select
                    id="hqe-rating"
                    value={
                      filters.unrated_only
                        ? 'unrated'
                        : filters.min_rating
                    }
                    onChange={(event) => {
                      const value = event.target.value;

                      setFilters((current) => ({
                        ...current,
                        min_rating:
                          value === 'unrated' ? '' : value,
                        unrated_only: value === 'unrated',
                      }));
                    }}
                  >
                    <option value="">Any rating</option>
                    <option value="unrated">Not rated</option>

                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}+ stars
                      </option>
                    ))}
                  </select>
                </label>

                {/* ============================================
                    Advanced filters — collapsed by default
                    ============================================ */}

                <details className="hqe-advanced-filters">
                  <summary>
                    <span className="hqe-advanced-filters-title">
                      Advanced filters
                    </span>

                    <span className="hqe-advanced-filters-status">
                      {advancedFilterCount > 0
                        ? `${advancedFilterCount} selected`
                        : 'Optional'}
                    </span>

                    <span
                      className="hqe-advanced-filters-chevron"
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </summary>

                  <div className="hqe-advanced-filters-grid">
                    {/* Ownership */}
                    <label htmlFor="hqe-ownership">
                      Ownership

                      <select
                        id="hqe-ownership"
                        value={filters.ownership}
                        disabled={
                          !filters.state ||
                          cityLoading ||
                          Boolean(cityError)
                        }
                        onChange={(event) =>
                          updateFilter(
                            'ownership',
                            event.target.value
                          )
                        }
                      >
                        <option value="">Any ownership</option>

                        {ownershipOptions.map((ownership) => (
                          <option
                            key={ownership}
                            value={ownership}
                          >
                            {ownership}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Emergency services */}
                    <label htmlFor="hqe-emergency">
                      Emergency services

                      <select
                        id="hqe-emergency"
                        value={filters.emergency_services}
                        onChange={(event) =>
                          updateFilter(
                            'emergency_services',
                            event.target.value as
                              SearchFilters['emergency_services']
                          )
                        }
                      >
                        <option value="">Any</option>
                        <option value="true">Available</option>
                        <option value="false">
                          Not available
                        </option>
                      </select>
                    </label>

                    {/* Heart-failure readmissions */}
                    <label htmlFor="hqe-s2-filter">
                      Heart-failure readmissions

                      <select
                        id="hqe-s2-filter"
                        value={filters.s2_status}
                        onChange={(event) =>
                          updateFilter(
                            's2_status',
                            event.target.value as
                              SearchFilters['s2_status']
                          )
                        }
                      >
                        <option value="">Any</option>
                        <option value="below">
                          Below expected (ERR &lt; 1)
                        </option>
                        <option value="at-or-above">
                          At or above expected (ERR ≥ 1)
                        </option>
                        <option value="no-data">
                          No reported ERR
                        </option>
                      </select>
                    </label>

                    {/* Hip/knee complications */}
                    <label htmlFor="hqe-s3-filter">
                      Hip/knee complication data

                      <select
                        id="hqe-s3-filter"
                        value={filters.s3_status}
                        onChange={(event) =>
                          updateFilter(
                            's3_status',
                            event.target.value as
                              SearchFilters['s3_status']
                          )
                        }
                      >
                        <option value="">Any</option>
                        <option value="available">
                          Published complication rate
                        </option>
                        <option value="unavailable">
                          No published rate
                        </option>
                      </select>
                    </label>

                    {/* Historical ED duration */}
                    <label htmlFor="hqe-s4-filter">
                      Historical ED duration

                      <select
                        id="hqe-s4-filter"
                        value={filters.s4_max_minutes}
                        disabled={!filters.city}
                        onChange={(event) =>
                          updateFilter(
                            's4_max_minutes',
                            event.target.value
                          )
                        }
                      >
                        <option value="">Any duration</option>
                        <option value="180">
                          Up to 180 minutes
                        </option>
                        <option value="240">
                          Up to 240 minutes
                        </option>
                        <option value="300">
                          Up to 300 minutes
                        </option>
                        <option value="360">
                          Up to 360 minutes
                        </option>
                      </select>
                    </label>
                  </div>

                  <p className="hqe-advanced-filters-note">
                    ED duration is a historical measure,
                    not a live waiting time. Detailed inspection
                    filters are available on each hospital's
                    Inspections tab.
                  </p>
                </details>

                {/* Search actions */}
                <div className="hqe-filter-actions">
                  <button
                    className="ask-submit"
                    type="submit"
                    disabled={searchLoading}
                  >
                    {searchLoading
                      ? 'Searching…'
                      : 'Search hospitals ↗'}
                  </button>

                  <button
                    className="hqe-text-button"
                    type="button"
                    onClick={clearFilters}
                    disabled={searchLoading}
                  >
                    Clear filters
                  </button>
                </div>
              </form>

              {/* ==================================================
                  Search feedback
                  ================================================== */}

              {searchError && (
                <div
                  className="hqe-inline-error"
                  role="alert"
                >
                  {searchError}
                </div>
              )}

              {searchLoading && (
                <p
                  className="hqe-search-loading"
                  role="status"
                >
                  Searching hospitals…
                </p>
              )}

              {/* ==================================================
                  Hospital search results
                  ================================================== */}

              {searchResult && (
                <section
                  className="hqe-search-results"
                  aria-live="polite"
                >
                  {/* Result count */}
                  <h3>
                    {searchResult.data.hospitals.length}{' '}

                    {searchResult.data.hospitals.length === 1
                      ? 'hospital'
                      : 'hospitals'}{' '}

                    found
                  </h3>

                  {/* Older backend notice */}
                  {searchMode === 'basic' && (
                    <p className="hqe-search-note">
                      Showing basic state/city results.
                      Rating, hospital type, and
                      emergency-service filters require
                      the updated backend.
                    </p>
                  )}

                  {/* No matching hospitals */}
                  {searchResult.data.hospitals.length ===
                    0 && (
                    <p>
                      No hospitals match this search.
                      Try another city or state.
                    </p>
                  )}

                  {/* ==========================================
                      Clickable hospital results
                      ========================================== */}

                  <div className="hqe-hospital-list">
                    {searchResult.data.hospitals.map(
                      (hospital) => {
                        const ed =
                          edByFacilityId.get(hospital.facility_id);

                        const s2 =
                          s2ByFacilityId.get(hospital.facility_id);

                        const s3 =
                          s3ByFacilityId.get(hospital.facility_id);

                        return (
                          <button
                            type="button"
                            key={
                              hospital.facility_id
                            }
                            className={
                              'hqe-hospital-card hqe-hospital-card--interactive'
                            }
                            aria-label={
                              `View ${hospital.name} details and inspections`
                            }
                            onClick={() =>
                              openHospitalProfile(
                                hospital
                              )
                            }
                          >
                            {/* Hospital identity */}
                            <span className="hqe-hospital-card-primary">
                              <span className="hqe-hospital-card-name">
                                {hospital.name}
                              </span>

                              <span className="hqe-hospital-card-location">
                                {[
                                  hospital.city,
                                  hospital.state,
                                  hospital.zip_code,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>

                              <span className="hqe-hospital-card-id">
                                CMS facility ID:{' '}
                                {hospital.facility_id}
                              </span>
                            </span>

                            {/* Hospital metrics */}
                            <span className="hqe-hospital-metrics">
                              {/* S1 rating */}
                              {searchMode === 'full' && (
                                <span>
                                  Rating:{' '}

                                  <strong>
                                    {hospital.overall_rating ==
                                    null
                                      ? 'Not rated'
                                      : `${hospital.overall_rating} / 5`}
                                  </strong>
                                </span>
                              )}

                              {/* Hospital type */}
                              {hospital.hospital_type && (
                                <span>
                                  Type:{' '}

                                  <strong>
                                    {hospital.hospital_type}
                                  </strong>
                                </span>
                              )}

                              {/* Emergency service availability */}
                              {hospital.emergency_services !=
                                null && (
                                <span>
                                  Emergency services:{' '}

                                  <strong>
                                    {hospital.emergency_services
                                      ? 'Yes'
                                      : 'No'}
                                  </strong>
                                </span>
                              )}

                              {/* S2: Heart-failure excess readmission ratio */}
                              {s2?.excess_readmission_ratio != null && (
                                <span>
                                  HF readmission ERR:{' '}
                                  <strong>{s2.excess_readmission_ratio}</strong>
                                </span>
                              )}

                              {/* S3: Combined hip/knee complications */}
                              {s3 && (
                                <span>
                                  Hip/knee complications:{' '}
                                  <strong>{s3.complication_rate}%</strong>
                                </span>
                              )}

                              {/* S4 historical ED duration */}
                              <S4EmergencyCare
                                data={ed ?? null}
                              />

                              {/* Profile navigation */}
                              <span className="hqe-profile-cta">
                                View details and inspections →
                              </span>
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* CMS sources for hospital search */}
                  <SourceList
                    sources={searchResult.source}
                    notes={searchResult.notes}
                  />

                  {/* Additional S4 CMS sources */}
                  <S4EmergencySources
                    response={edResult}
                  />
                </section>
              )}
            </section>
          )}
        </section>

        {/* ==================================================
            About CMS data
            ================================================== */}

        <section
          className="data-section"
          id="about"
        >
          <div
            className="data-section-mark"
            aria-hidden="true"
          >
            ✳
          </div>

          <div>
            <h2>
              Good decisions start with understanding
              the data.
            </h2>

            <p>
              Hospital Quality Explorer uses public
              CMS datasets. Measures have different
              reporting periods and missing-data
              limitations. Historical measurements
              do not describe live hospital conditions.
            </p>
          </div>

          <a
            className="source-link"
            href="https://data.cms.gov/provider-data/topics/hospitals"
            target="_blank"
            rel="noopener noreferrer"
          >
            View CMS data ↗
          </a>
        </section>

        {/* ==================================================
            Saved Reports
            ================================================== */}

        <section
          className="saved-section"
          id="saved-reports"
        >
          <SavedReports />
        </section>
      </main>

      {/* ====================================================
          Footer
          ==================================================== */}

      <footer className="site-footer">
        <span>
          © Hospital Quality Explorer
        </span>

        <span>
          Built around transparent,
          public hospital data.
        </span>
      </footer>
    </div>
  );
}

export default App;
