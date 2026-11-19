import { useState, useEffect } from 'react'

// Define the FastAPI backend URL
const API_BASE = ''

function Team() {
  // Store team members returned from FastAPI
  const [members, setMembers] = useState([])

  // Track the loading status
  const [loading, setLoading] = useState(true)

  // Store any error messages
  const [error, setError] = useState(null)

  // Fetch team members when the component mounts
  useEffect(() => {
    fetch(`${API_BASE}/team-members`)

      .then(response => {
        // Check whether the HTTP request succeeded
        if (!response.ok) {
          throw new Error('Failed to fetch team members')
        }

        // Parse the response body as JSON
        return response.json()
      })

      .then(data => {
        // Update React state with the returned data
        setMembers(data)
        setLoading(false)
      })

      .catch(err => {
        // Store the error and stop loading
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Display different UI states
  if (loading) return <p>Loading team members...</p>
  if (error) return <p>Error: {error}</p>
  if (members.length === 0) return <p>No team members available.</p>

  // Render the team members
  return (
    <section>
      <h1>Our Team</h1>

      <ul id="team-list">
        {members.map(member => (
          <li key={member.id} className="team-member">

            <img
              className="team-member-image"
              src={member.image}
              alt={member.name}
            />

            <div className="team-member-info">
              <h2 className="team-member-name">{member.name}</h2>

              <p className="team-member-role">{member.role}</p>

              <p>{member.bio1}</p>
              <p>{member.bio2}</p>
            </div>

          </li>
        ))}
      </ul>
    </section>
  )
}

export default Team