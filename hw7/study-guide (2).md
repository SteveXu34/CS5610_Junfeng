# study-guide

Own what you submit! Some things you should know from each of the homework assignments. 

In particular, be ready to answer questions related to these items during standups if they show up in your submission.

## hw06-auth

* concepts
  * authentication (who are you?) vs. authorization (what may you see?)
  * the browser shows, the server enforces -- why hiding something in React protects nothing
* passwords
  * hashing with bcrypt -- why you never store the password itself
  * why your users table has no `INSERT`s in any committed file
  * same error for "no such email" and "wrong password" -- why
* sessions
  * what's in your session cookie -- and who can read it (signed, not encrypted)
  * `SESSION_SECRET` -- what it protects, and why it has no default
  * `httpOnly` -- why your JavaScript can't read the cookie
  * `/me` -- how the page knows who's logged in after a reload
* FastAPI
  * `current_user` as a dependency -- same `Depends()` as `get_db`
  * 401 -- what your gated route returns without a login, and why the order of dependencies matters
* one origin
  * Vite's proxy -- why the browser only talks to `localhost:5173`
  * why the cookie is easy on one origin, and hard across two
  * what happened to CORS -- and, if you retired your plain-JS front end, why `CORSMiddleware` could go
* the other way in
  * Supabase's Data API -- why your tables were readable without going through your API, and how you closed it
* verifying
  * `curl` with and without the cookie (`-c` / `-b`) -- and with one character of it changed
  * a pytest test that the gated route is 401 without logging in
  * `fetch` doesn't reject on a 401 -- why you check `response.ok`

## hw05-react

* architecture
  * which backend your React app talks to (local or deployed), and why
  * `API_BASE` -- one place for the API's address
  * CORS -- Vite's dev server (port 5173) is a new origin
* tooling
  * Vite -- what `npm create vite`, `npm install`, `npm run dev` each do
  * `package.json` vs `node_modules/` -- what gets committed and why
  * dev server vs build (`npm run build`)
* React
  * components -- a function that returns JSX
  * JSX vs HTML (`className`, `{}` for expressions)
  * `useState` -- why not just a variable
  * `useEffect` -- when it runs, and what the `[]` dependency array does
  * rendering a list -- `.map()` and `key`
  * plain JS `fetch` + `innerHTML` vs React `fetch` + `setState`
* UI states
  * loading, empty, and error -- each one on screen, not just in the console
* debugging
  * DevTools Network tab -- the request, its status, its response
  * why you see two requests in dev (`StrictMode`)
  * what happens without `[]` in `useEffect`
* git collaboration
  * scaffolding as its own PR

## hw04-stack

* architecture
  * full stack as deployed
  * CORS
* git collaboration
  * PRs as the unit of work
  * what goes in a "deploy" PR
  * code review rubric (`docs/pr-rubric.md`)
* deployment
  * IPv4 vs IPv6 and the implications
  * environment variables
  * Vercel for the back end
* testing
  * `pytest` -- what to test
  * what to document
  * tests, as their own PR(s)

## hw03-server

* architecture
  * client -> FastAPI -> Postgres request flow
  * Depends() for shared DB connections
  * CORSMiddleware -- why it's needed once frontend and backend are served separately
  * httpx vs httpx2 vs http
* database
  * initdb, pg_ctl, createdb, psql
  * seed.sql -- schema vs data
  * DATABASE_URL environment variable
  * pg_dump as a verification artifact
* backend
  * psycopg2, RealDictCursor
  * REST: GET must be side-effect-free (google-crawler-deletes-data anecdote)
  * server responses (200, 404, 500) tied to real routes now, not just theory
* testing & debugging
  * pytest / TestClient -- in-process, can't catch real CORS errors
  * curl -i -- seeing status codes a browser tab can't show
  * shell quoting -- export "VAR=value" vs "$VAR" at use time
  * uvicorn --reload -- env vars fixed at parent-process launch, restart order matters
  * curl
  * deprecation warnings

## hw02-client

* architecture
  * [Client-Server Overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview) -- MDN
* clients
  * `fetch` -- the call, `.then()`/`.catch()`, or `async`/`await` with `try`/`catch`
  * Promises -- pending/resolved/rejected, why `await` needs `async`
  * cookies vs localStorage
  * Event, .preventDefault()
  * form handling -- .preventDefault() on submit, FormData
  * REST nouns and verbs
  * server responses (200, 404, 500, etc.)
* JavaScript
  * keywords and data structures: Array, Object, const, let
  * Array methods -- .map(), forEach()
  * Arrow functions: () => {}
  * DOM manipulation -- querySelector, createElement, innerHTML vs textContent
* CSS
  * styling form validity states -- :invalid, :valid
* testing & debugging
  * devConsole
  * Network tab -- inspecting request/response headers, status, payload, timing
  * deprecation warnings -- e.g. Synchronous XMLHttpRequest vs fetch

## hw01-intro

* HTML
  * basic page layout -- html, body, script, head
  * common tags -- p, a, div, nav, header, main, footer, section
  * heading hierarchy -- h1-h6
  * attributes -- id vs class, href, src
  * charset (what it does, security implication)
* accessibility
  * alt text on images
  * label/for association on form inputs
* CSS
  * box model -- margin, border, padding, content
  * box-sizing: border-box -- and why it's a near-universal reset
  * one layout system -- Flexbox or Grid (pick one; know the other exists)
  * custom properties (CSS variables)
  * pseudo-classes: :hover, :focus, :nth-child
  * media queries -- responsive to phone width
  * transitions on hover/focus
* JavaScript
  * addEventListener -- click, input, keypress
  * DOM: querySelector, textContent, classList
  * building elements from an array (loop or .map())
  * reading form input
  * fetch a public API (stretch, optional -- foreshadows hw02)
* testing & debugging
  * browser devtools -- console, elements panel, inspecting/live-editing
  * console.log as the first debugging tool
