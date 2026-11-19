
function Contact({ onNavigate }) {
  // Handle the contact form submission.
  function handleSubmit(event) {
    // Prevent the browser from reloading the page.
    event.preventDefault()

    // Demo only: no form data is sent to a backend.
    onNavigate('contact-success')
  }

  return (
    <section className="contact-page">
      <h1>Contact</h1>

      <p className="contact-intro">
        Have a pursuit problem? Need a custom solution?
        Our team is standing by — relatively unharmed.
      </p>

      <form id="contact-form" onSubmit={handleSubmit}>
        <p className="contact-form-intro">
          We'd love to hear from you! Please fill out the form
          and we'll get back to you as soon as possible.
        </p>

        <div className="contact-name-row">
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              name="first-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              name="last-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email<span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
          />
        </div>

        <div className="contact-submit-row">
          <button type="submit">Submit</button>
        </div>
      </form>

      <div className="hubspot-link-box">
        <img
          src="/Material/sprocket.svg"
          alt="HubSpot"
          className="hubspot-logo"
        />

        <a
          href="#hubspot"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('hubspot')
          }}
        >
          Create your own free forms
        </a>

        <span>to generate leads from your website.</span>
      </div>
    </section>
  )
}

export default Contact
