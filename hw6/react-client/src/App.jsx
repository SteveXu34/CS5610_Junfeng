import { useState, useEffect } from 'react'
// Import useState to manage component state.

import CaseStudies from './components/CaseStudies'
import CaseStudyDetail from './components/CaseStudyDetail'
import Team from './components/Team'
import Header from './components/Header'
import Footer from './components/Footer'
import Products from './components/Products'
import Blog from './components/Blog'
import Studio from './components/Studio'
import Contact from './components/Contact'
import ContactSuccess from './components/ContactSuccess'
import HubSpotPlaceholder from './components/HubSpotPlaceholder'
import './style/style.css'
// Import reusable React components and the shared CSS stylesheet.

import Login from './components/Login'

function App() {

  // HW6-MISSION5:
  // Store the currently authenticated user.
  // null means no user is logged in.
  const [user, setUser] = useState(null)

  // Track whether the initial session check has completed.
  const [authLoading, setAuthLoading] = useState(true)

  // Check the existing session when the page loads.
  useEffect(() => {
    fetch('/me', { credentials: 'same-origin' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to check login status')
        }
        return response.json()
      })
      .then(data => {
        setUser(data)
      })
      .catch(error => {
        console.error(error)
        setUser(null)
      })
      .finally(() => {
        setAuthLoading(false)
      })
  }, [])

  // Update React state after successful login.
  function handleLogin(loggedInUser) {
    setSelectedStudy(null)
    setUser(loggedInUser)
  }

  // Clear React state after logout.
  function handleLogout() {
    setSelectedStudy(null)
    setUser(null)
  }




  // Store the currently selected case study.
  // null means no case study is selected.
  const [selectedStudy, setSelectedStudy] = useState(null)
  // selectedStudy is the case study chosen for now.
  // setSelectedStudy change the case study
  // useStat(null) set the initial value as null.

  // Track which page should be displayed.
  // The default page is 'case-studies'.
  const [currentPage, setCurrentPage] = useState('case-studies') // useState will return two elements['case-studies',function()].

  // Handle navigation between Case Studies and Team.
  // This function is passed to the Header component as a prop.
  function handleNavigate(page) {

    // Clear the selected case study when changing pages.
    setSelectedStudy(null)

    // Update the current page and trigger a React re-render.
    setCurrentPage(page)
  }

  // Return the UI based on the current React state.
  return (
    <>
      {/* React Fragment groups multiple components
          without creating an additional HTML element. */}

      {/* Render the shared navigation header.
          Pass handleNavigate to Header through the onNavigate prop.
          Header can call this function when a navigation link is clicked. */}
      <Header onNavigate={handleNavigate} />

      <main>

        {/* Conditional Rendering using ternary operators.

            If currentPage === 'team':
              Display the Team component.

            Otherwise, if selectedStudy is not null:
              Display the selected Case Study detail.

            Otherwise:
              Display the Case Studies list.
        */}
        {/* Render the studio with handleNavigate function input.*/}
        {currentPage === 'products' ? (
          <Products /> 
        ): currentPage === 'team' ? (
          <Team />

        ) : currentPage === 'blog' ? (
          <Blog onNavigate={handleNavigate} />

        ) : currentPage === 'studio' ? (
          <Studio onNavigate={handleNavigate} />

        ) : currentPage === 'contact' ? (
          <Contact onNavigate={handleNavigate} />

        ) : currentPage === 'contact-success' ? (
          <ContactSuccess onNavigate={handleNavigate} />

        ) : currentPage === 'hubspot' ? (
          <HubSpotPlaceholder onNavigate={handleNavigate} />

        ): selectedStudy ? (

          // Render the selected Case Study detail.
          // Changing the key resets the detail component's local state.
          // Pass the selected study and a callback for returning to the list.
          <CaseStudyDetail
            key={selectedStudy.id}
            study={selectedStudy}
            onBack={() => setSelectedStudy(null)}
          />

        ) : (

          // Render the Case Studies list.
          // Pass setSelectedStudy so the child can update the selected study.
          <>
            <CaseStudies
              onSelectStudy={setSelectedStudy}
              user={user}
              authLoading={authLoading}
            />
            {!authLoading && (
              <Login
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            )}
          </>

        )}
      </main>

      {/* Render the shared footer. */}
      <Footer />

      {/* Navigation is now handled by Header.
          The temporary page-switcher buttons have been removed. */}
    </>
  )
}

export default App
// Export App so it can be imported by main.jsx.