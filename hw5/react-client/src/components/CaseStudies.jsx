import { useState, useEffect } from 'react'
// Import two hooks from React

const API_BASE = 'https://cs-5610-junfeng-hw4-server.vercel.app'

function CaseStudies({ onSelectStudy }) {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Create and initialize three states. studies is used to store Case Studies Data;
  // Loading is used to show whether it is loading or not.
  // error is used to store error messages.

  useEffect(() => {
    //  register Effect，when this component is loaded, can ask for accessibility to FastAPI.
    fetch(`${API_BASE}/case-studies`)
    // Ask to fetch the endpoint of fastapi URL and get a response.
      .then(response => {

        if (!response.ok) {
          throw new Error('Failed to fetch case studies')
        }
        // If response.ok != True then raise an error. Means the status code is not 200-299.
        return response.json()
        // return the response as a json file.
      })
      .then(data => {
        setStudies(data)
        // The data is from response.json() the store it into the studies variable.
        setLoading(false)
        // Set the loading status into False.
      })
      .catch(err => {
        setError(err.message)
        // If there are some errors rasing during requesting and status checing procedure, store these errors into the error.
        setLoading(false)
        // Set the loading status into False.
      })
  }, [])

  // If loading is True. Display: Loading case studies...
  if (loading) return <p>Loading case studies...</p>
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