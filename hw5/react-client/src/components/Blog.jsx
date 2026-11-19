
function Blog({ onNavigate }) {
  // Display the blog empty state from the original HTML page.

  return (
    <div className="blog-page">
      <h1>Blog</h1>

      <p className="blog-empty">
        No posts yet. Add one in{' '}
        <a
          href="#studio"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('studio')
          }}
        >
          the Studio
        </a>.
      </p>
    </div>
  )
}

export default Blog
