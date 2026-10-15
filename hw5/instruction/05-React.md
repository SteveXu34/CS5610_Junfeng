# 05-React

Last week:

* Connecting front end, back end & database
* PRs -- no more direct commits to `main`
* `pytest`, Supabase, Vercel

Today:

* hw04-stack -- PR walkthroughs
* Connecting the front end -- worked example
* CORS -- why it exists
* React + Vite

---

## Today

* hour 1
  * hw04-stack -- PR walkthroughs (small groups)
  * Demo: connect the front end to the back end
* hour 2
  * CORS discussion
  * Studio: fix whatever stalled you in hw04
  * Break, then React + Vite intro
* hour 3 -- hands on
  * hw05-react

---

## PR walkthroughs

* Each person walks **one** PR -- "Files changed" view, not your IDE
* No PRs? Walk your commits instead
* Questions to answer:
  * Why this scope?
  * What broke, and how did you fix it?
  * How did you verify it works?
  * Where does each piece run -- and what URL does your `fetch` call?
* Rubric: [pr-rubric.md](https://github.com/nuwebdev/fall-2026/blob/main/docs/pr-rubric.md)

---

## Connecting the front end

Demo...

* `blog.html` reads posts from `data.js`, a JS array
* `GET /blog` returns the same fields, from Postgres
* Four edits:
  1. Drop `<script src="data.js">`
  2. Wrap the existing render code in `fetch(...).then(...)`
  3. `if/else` becomes `if ... return;` (we're inside a callback now)
  4. Add `.catch()` -- an array can't fail to load; a network request can

---

## What breaks

* **CORS** -- page on `:3000`, API on `:8000`: different ports, different
  origins. The server answers; the browser won't hand the response to your
  page. Fix is on the server (`CORSMiddleware`). `curl` and `pytest` never
  see it -- only a browser does.
* **`127.0.0.1` once deployed** -- that's the *visitor's own machine*. Put
  the API's address in one place (`API_BASE`).
* Check yours: DevTools -> **Network** -> reload. What URL? What status?

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) -- MDN

---

## Studio: finish hw04

* Fix whatever stalled you -- especially step 2
* Stuck on environment issues? Ask Claude -- paste the actual error
* Unfinished hw04 work carries into hw05

---

## React -- same fetch, different destination

| Plain JS (hour 1) | React |
|---|---|
| `fetch` runs when the page loads | `useEffect(..., [])` runs once, when the component appears |
| callback writes `innerHTML` | callback calls `setPosts(data)` -- React re-renders |
| `.catch()` writes a message | `.catch()` sets error state -- the page shows it |

* A **component** is a function that returns JSX (HTML-like)
* We'll walk through one whole component together
* [react.dev/learn](https://react.dev/learn) -- the official docs

---

## hw05-react

[`hw-react`](./05-React/hw-react.md), as a sequence of PRs

1. Scaffold `react-client/` with Vite -- its own PR
2. **One** page as a component that fetches from your API -- goal for today
3. A **second** page -- what are you repeating?
4. Verify both in the browser -- Network tab, clean Console
5. README: how to run it, which backend and why, how you used AI

* Finish hw04 first
* Using AI is expected -- but be ready to explain **why your `useEffect`
  runs when it does**
* Two requests per load in the Network tab? That's `StrictMode`, on purpose
* [study-guide.md](https://github.com/nuwebdev/fall-2026/blob/main/study-guide.md) -- hw05-react section
