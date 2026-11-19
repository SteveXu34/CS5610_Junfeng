function ContactSuccess({ onNavigate }) {
  return (
    <section>
      <h1>Submission Successful</h1>

      <p>
        Your form was validated in this frontend demo.
        No information was sent to a backend.
      </p>

      <p>
        The original site uses HubSpot to process and store
        form submissions. That backend functionality is
        outside the scope of this static frontend reproduction.
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

export default ContactSuccess