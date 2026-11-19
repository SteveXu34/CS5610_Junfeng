/**
 * HQE authentication entry gate.
 *
 * The main HQE app is shown only after the backend
 * confirms a valid session via GET /api/auth/me.
 *
 * This is a frontend navigation gate. Backend API
 * authorization must also be enforced server-side
 * wherever private access is required.
 */

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import App from '../../App';

import {
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  type AuthUser,
} from '../../api/auth';

import './AuthGate.css';

// ==========================================================
// 1. Types
// ==========================================================

type AuthMode = 'login' | 'register';

type SessionState =
  | { status: 'checking'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'authenticated'; user: AuthUser };

interface AuthScreenProps {
  onAuthenticated: () => Promise<void>;
  connectionError: string | null;
  onRetryConnection: () => void;
}

// ==========================================================
// 2. Login and registration entry screen
// ==========================================================

function AuthScreen({
  onAuthenticated,
  connectionError,
  onRetryConnection,
}: AuthScreenProps) {
  const [mode, setMode] =
    useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  // --------------------------------------------------------
  // Change between login and registration
  // --------------------------------------------------------

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setShowPassword(false);
  }

  // --------------------------------------------------------
  // Submit credentials
  // --------------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (
      mode === 'register' &&
      password !== confirmPassword
    ) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password,
      };

      if (mode === 'login') {
        await loginAccount(credentials);
      } else {
        await registerAccount(credentials);
      }

      // Confirm that the browser retained the cookie.
      // A successful login response alone is not enough.
      await onAuthenticated();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Authentication failed. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ========================================================
  // 3. Authentication screen
  // ========================================================

  return (
    <main className="hqe-auth-page">
      <div className="hqe-auth-layout">
        {/* Brand and context */}
        <section className="hqe-auth-intro">
          <div className="hqe-auth-brand">
            <span className="hqe-auth-brand-mark">
              H
            </span>
            <span>
              Hospital Quality Explorer
            </span>
          </div>

          <p className="hqe-auth-eyebrow">
            HOSPITAL DATA, MADE UNDERSTANDABLE
          </p>

          <h1>
            Better hospital information.
            <span> Clearer decisions.</span>
          </h1>

          <p className="hqe-auth-description">
            Sign in to explore published hospital
            quality data, compare facilities, ask
            questions, and read historical inspection
            findings.
          </p>

          <p className="hqe-auth-context">
            HQE provides historical information,
            not a real-time hospital safety rating.
          </p>
        </section>

        {/* Login / registration form */}
        <section
          className="hqe-auth-card"
          aria-label="HQE account access"
        >
          <div className="hqe-auth-tabs">
            <button
              type="button"
              className={
                mode === 'login' ? 'active' : ''
              }
              aria-pressed={mode === 'login'}
              disabled={submitting}
              onClick={() => changeMode('login')}
            >
              Log in
            </button>

            <button
              type="button"
              className={
                mode === 'register' ? 'active' : ''
              }
              aria-pressed={mode === 'register'}
              disabled={submitting}
              onClick={() => changeMode('register')}
            >
              Create account
            </button>
          </div>

          <div className="hqe-auth-card-content">
            <h2>
              {mode === 'login'
                ? 'Welcome back'
                : 'Create your account'}
            </h2>

            <p className="hqe-auth-card-subtitle">
              {mode === 'login'
                ? 'Log in to continue to HQE.'
                : 'Register to start exploring HQE.'}
            </p>

            {connectionError && (
              <div
                className="hqe-auth-error"
                role="alert"
              >
                <p>
                  Unable to verify the current
                  session: {connectionError}
                </p>

                <button
                  type="button"
                  className="hqe-auth-text-action"
                  onClick={onRetryConnection}
                >
                  Retry connection
                </button>
              </div>
            )}

            <form onSubmit={(event) => {
              void handleSubmit(event);
            }}>
              <label htmlFor="hqe-auth-email">
                Email address
              </label>

              <input
                id="hqe-auth-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                value={email}
                disabled={submitting}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <label htmlFor="hqe-auth-password">
                Password
              </label>

              <input
                id="hqe-auth-password"
                type={
                  showPassword ? 'text' : 'password'
                }
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                required
                minLength={
                  mode === 'register' ? 8 : undefined
                }
                maxLength={128}
                value={password}
                disabled={submitting}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              {mode === 'register' && (
                <>
                  <p className="hqe-auth-hint">
                    At least 8 characters.
                  </p>

                  <label htmlFor="hqe-auth-confirm">
                    Confirm password
                  </label>

                  <input
                    id="hqe-auth-confirm"
                    type={
                      showPassword ? 'text' : 'password'
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={confirmPassword}
                    disabled={submitting}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                  />
                </>
              )}

              <label className="hqe-auth-show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  disabled={submitting}
                  onChange={(event) =>
                    setShowPassword(
                      event.target.checked
                    )
                  }
                />
                Show password
              </label>

              {error && (
                <p
                  className="hqe-auth-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="hqe-auth-submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Please wait…'
                  : mode === 'login'
                    ? 'Log in to HQE'
                    : 'Create account'}
              </button>
            </form>

            <p className="hqe-auth-footnote">
              Your password is handled by the HQE
              backend. Session cookies are HttpOnly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// ==========================================================
// 4. Authentication gate
// ==========================================================

export default function AuthGate() {
  const [session, setSession] =
    useState<SessionState>({
      status: 'checking',
      user: null,
    });

  const [connectionError, setConnectionError] =
    useState<string | null>(null);

  const [checkingAgain, setCheckingAgain] =
    useState(0);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState<string | null>(null);

  // --------------------------------------------------------
  // Restore existing session on initial visit / refresh
  // --------------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    void getCurrentUser(controller.signal)
      .then((user) => {
        if (controller.signal.aborted) {
          return;
        }

        setConnectionError(null);
        setSession(
          user
            ? { status: 'authenticated', user }
            : { status: 'guest', user: null }
        );
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setSession({
          status: 'guest',
          user: null,
        });

        setConnectionError(
          cause instanceof Error
            ? cause.message
            : 'The backend is not reachable.'
        );
      });

    return () => {
      controller.abort();
    };
  }, [checkingAgain]);

  // --------------------------------------------------------
  // Confirm browser session after login or registration
  // --------------------------------------------------------

  async function handleAuthenticated() {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error(
        'Login succeeded, but the session cookie was ' +
        'not accepted. Check your local cookie settings.'
      );
    }

    setConnectionError(null);
    setSession({
      status: 'authenticated',
      user,
    });
  }

  // --------------------------------------------------------
  // Logout and return to the entry screen
  // --------------------------------------------------------

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError(null);

    try {
      await logoutAccount();

      setSession({
        status: 'guest',
        user: null,
      });
    } catch (cause: unknown) {
      setLogoutError(
        cause instanceof Error
          ? cause.message
          : 'Logout failed. Please retry.'
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // ========================================================
  // 5. Render gate state
  // ========================================================

  if (session.status === 'checking') {
    return (
      <main className="hqe-auth-loading" role="status">
        <span className="hqe-auth-brand-mark">
          H
        </span>

        <p>Checking your HQE session…</p>
      </main>
    );
  }

  if (session.status === 'guest') {
    return (
      <AuthScreen
        onAuthenticated={handleAuthenticated}
        connectionError={connectionError}
        onRetryConnection={() => {
          setSession({
            status: 'checking',
            user: null,
          });
          setCheckingAgain((count) => count + 1);
        }}
      />
    );
  }

  return (
    <div className="hqe-auth-app">
      <div className="hqe-auth-sessionbar">
        <div className="hqe-auth-sessionbar-inner">
          <span>
            Signed in as{' '}
            <strong>{session.user.email}</strong>
          </span>

          <button
            type="button"
            disabled={loggingOut}
            onClick={() => {
              void handleLogout();
            }}
          >
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>

        {logoutError && (
          <p role="alert" className="hqe-auth-logout-error">
            {logoutError}
          </p>
        )}
      </div>

      <App />
    </div>
  );
}
