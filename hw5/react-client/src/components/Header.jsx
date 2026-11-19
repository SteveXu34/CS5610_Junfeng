function Header({ onNavigate }) {
  // Receive the navigation callback function from App.jsx.
  // onNavigate allows Header to update the current page in App.

  return (
    <header>
      {/* Render the shared navigation bar. */}
      <nav id="main-nav">

        {/* Clicking the logo returns to the Case Studies page. */}
        <a
          href="/"
          onClick={(event) => {
            // Prevent the browser from reloading the page.
            event.preventDefault()

            // Notify App to display the Case Studies page.
            onNavigate('case-studies')
          }}
        >
          <img src="/Material/acme-logo.svg" alt="Acme Corp" />
        </a>

        {/* Navigation links */}
        <ul>
          {/* Navigate to the Case Studies page. */}
            <li>
            <a
                href="#products"
                onClick={(event) => {
                event.preventDefault()
                onNavigate('products')
                }}
            >
                Products
            </a>
            </li>

          {/* Navigate to the Case Studies page. */}
          <li>
            <a
              href="#case-studies"
              onClick={(event) => {
                event.preventDefault()
                onNavigate('case-studies')
              }}
            >
              Case Studies
            </a>
          </li>

          {/* Placeholder: Blog page. */}
          <li>
            <a
                href="#blog"
                onClick={(event) => {
                event.preventDefault()
                onNavigate('blog')
                }}
            >
                Blog
            </a>
            </li>

          {/* Navigate to the Team page through About. */}
          <li>
            <a
              href="#about"
              onClick={(event) => {
                event.preventDefault()

                // Update currentPage to 'team' in App.
                onNavigate('team')
              }}
            >
              About
            </a>
          </li>

          {/* Placeholder: Contact page. */}
            <li>
            <a
                href="#contact"
                onClick={(event) => {
                event.preventDefault()
                onNavigate('contact')
                }}
            >
                Contact
            </a>
            </li>
        </ul>

      </nav>
    </header>
  )
}

export default Header
// Export the Header component so App.jsx can import it.