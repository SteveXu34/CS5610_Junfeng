import { useState, useEffect } from 'react'
// Import two hooks from React

const API_BASE = ''

function CaseStudies({ onSelectStudy, user, authLoading }) {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Create and initialize three states. studies is used to store Case Studies Data;
  // Loading is used to show whether it is loading or not.
  // error is used to store error messages.

  
useEffect(() => {
  // Wait until App has checked the existing session.
  if (authLoading) return

  // Prevent an outdated request from updating React state.
  let cancelled = false

  async function loadCaseStudies() {
    setLoading(true)
    setError(null)
    setStudies([])

    try {
      // Public case studies are available to everyone.
      const publicResponse = await fetch(
        `${API_BASE}/case-studies`
      )

      if (!publicResponse.ok) {
        throw new Error('Failed to fetch public case studies')
      }

      const publicStudies = await publicResponse.json()
      let allStudies = publicStudies

      // Request gated case studies only when logged in.
      if (user) {
        const gatedResponse = await fetch(
          `${API_BASE}/case-studies/gated`,
          { credentials: 'same-origin' }
        )

        // HTTP 401 does not automatically reject fetch().
        if (gatedResponse.status === 401) {
          throw new Error('Session expired. Please log in again.')
        }

        if (!gatedResponse.ok) {
          throw new Error('Failed to fetch gated case studies')
        }

        const gatedStudies = await gatedResponse.json()

        // Combine public and gated case studies.
        allStudies = [...publicStudies, ...gatedStudies]
      }

      if (!cancelled) {
        setStudies(allStudies)
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message)
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  loadCaseStudies()

  return () => {
    cancelled = true
  }
}, [user, authLoading])

  // HW5:
  // // If loading is True. Display: Loading case studies...
  // if (loading) return <p>Loading case studies...</p>

  // HW6-MISSION5:
  if (authLoading || loading) {
    return <p>Loading case studies...</p>
  }

  // If error is not none. Display the error message.
  if (error) return <p>Error: {error}</p>
  // If the studies is an empty list, Display: No case studies available.
  if (studies.length === 0) return <p>No case studies available.</p>

  // If load successfully and there are some data, return the JSX below.

// Create a HTML section area
  return (
    <section>
    {/* Display the title*/}
      <h1>Case Studies</h1>
        {!user && (
          <p>More case studies are available to logged-in users.</p>
        )}

        <ul id="case-study-list">
            {/* Traverse studies list, transform each data into JSX format*/}
            {studies.map(study => (

            <li key={study.id} className="case-study-item">
                <div className="case-study-title-row">
            <h2>
            <a
                href={study.link}
                onClick={(event) => {
                event.preventDefault()
                onSelectStudy(study)
                }}
            >
                {study.title}
            </a>
            </h2>
            {study.gated && (
            <span className="badge">Gated</span>
            )}
        </div>

            {/* Display the summary for now.*/}
            <p>{study.summary}</p>
            </li>
      ))}
        </ul>
    </section>
  )
}

export default CaseStudies