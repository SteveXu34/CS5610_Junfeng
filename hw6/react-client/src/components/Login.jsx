
import { useState } from 'react'

// The parent App component manages the logged-in user.
function Login({ user, onLogin, onLogout }) {
  // Store user input and error messages.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle the login form submission.
  async function handleSubmit(event) {
    // Prevent the browser from reloading the page.
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      // Send the email and password to FastAPI.
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password })
      })

      // fetch() does not throw an error for HTTP 401.
      // We must check response.ok manually.
      if (!response.ok) {
        throw new Error('Invalid email or password')
      }

      const data = await response.json()

      // Update the login state in App.jsx.
      onLogin({ email: data.email })

      // Clear the password after successful login.
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle the logout button.
  async function handleLogout() {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      // Clear the login state in App.jsx.
      onLogout()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Show the logged-in user and logout button.
  if (user) {
    
    return (
      <section className="login-section">
        <p>Logged in as: {user.email}</p>
        {/* HW6-update the button */}
        <button
        className="logout-button"
        onClick={handleLogout}
        disabled={loading}
        >
        {loading ? 'Logging out...' : 'Log out'}
        </button>
        {error && <p role="alert">{error}</p>}
      </section>
    )
  }

  // Show the login form when the user is logged out.
  return (
    <section className="login-section">
        <h2>Member Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
    </section>
  )
}

export default Login
