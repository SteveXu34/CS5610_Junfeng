
function HubSpotPlaceholder({ onNavigate }) {
  return (
    <section>
      <h1>External HubSpot Feature</h1>

      <p>
        This link normally opens a HubSpot service.
        That external functionality is outside the scope
        of this static frontend reproduction.
      </p>

      <p>
        <a
          href="#contact"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('contact')
          }}
        >
          ← Back to Contact
        </a>
      </p>
    </section>
  )
}

export default HubSpotPlaceholder
