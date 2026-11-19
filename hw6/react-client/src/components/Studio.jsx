
function Studio({ onNavigate }) {
  // Display a placeholder for the external Sanity Studio CMS.

  return (
    <div className="studio-page">
      <h1>Studio</h1>

      <p>
        The original site links to a Sanity Studio CMS.
        This admin area requires authentication and backend services,
        which are outside the scope of this static frontend reproduction.
      </p>

      <p>
        <a
          href="#blog"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('blog')
          }}
        >
          ← Back to Blog
        </a>
      </p>
    </div>
  )
}

export default Studio
