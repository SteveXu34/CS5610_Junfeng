import { useState } from 'react'

function CaseStudyDetail({ study, onBack }) {
  // Track whether the gated content is visible
  const [hasAccess, setHasAccess] = useState(false)
  const [email, setEmail] = useState('')

  // Handle the gated access form
  function handleSubmit(event) {
    event.preventDefault()

    // Demo only: no backend authorization is performed
    if (email.trim()) {
      setHasAccess(true)
    }
  }

  return (
    <article className="case-study-detail">

      {/* Back to case studies list */}
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Back to Case Studies
      </button>

      {/* Case study title */}
      <div className="case-study-title-row">
        <h1>{study.title}</h1>

        {study.gated && (
          <span className="badge">Gated</span>
        )}
      </div>

      {/* Case study summary */}
      <p className="case-study-summary">
        {study.summary}
      </p>

      {/* First case study: public content */}
      {!study.gated && (
        <p>This is the body text!</p>
      )}

      {/* Second case study: gated content */}
      {study.gated && !hasAccess && (
        <div className="access-box">
          <h2>Access this case study</h2>
          <p>Enter your email to read the full content.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit">
              Get access
            </button>
          </form>
        </div>
      )}

      {/* Display gated content after form submission */}
      {study.gated && hasAccess && (
        <div>
          <p>
            This is the body text for the gated case study -- you got it!
          </p>
        </div>
      )}

    </article>
  )
}

export default CaseStudyDetail