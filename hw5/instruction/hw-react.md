# hw-react

Two pages of your front end, rebuilt as React components -- fetching from
the API you already have.

## Learning objectives

* Scaffolding a React app with Vite
* Components, `useState`, and `useEffect` -- the same `fetch` you already
  wrote, inside a component
* Loading, empty, and error states as part of the UI, not an afterthought
* Components as reuse -- what the second page repeats from the first

## Assignment

Keep working in the same classroom50 repo, and keep using PRs -- no direct
commits to `main`. Roughly one PR per item.

Order matters: finish hw04 first, then your first page (the goal for class),
then your second page.

1. Scaffold a React app with Vite in a new `react-client/` directory, next
   to your existing front end (leave that one alone -- it still works):
   ```
   npm create vite@latest react-client -- --template react
   cd react-client
   npm install
   npm run dev
   ```
   * This PR is the scaffolding only. Check that `node_modules/` isn't in it.
   * If `npm create vite` complains about your Node version, install the
     current LTS from [nodejs.org](https://nodejs.org/en/download).
2. Pick **one** page -- Blog, Case Studies, or Team -- and build it as a
   component that fetches from your backend:
   * `useState` for the data, `useEffect` to fetch it when the component
     mounts
   * Something sensible on screen while it's loading, when the list is
     empty, and when the fetch fails
   * The API's address in one place (e.g. an `API_BASE` constant), not
     repeated in every `fetch`
3. Build a **second** page the same way, after the first one works.
   * Notice what you're repeating from the first page -- be ready to say
     what, and whether you'd pull it out into something shared.
   * If your backend only serves one content type, adding the second one
     (table, seed data, FastAPI route) is part of this step.
   * No router needed: render both in `App`, one after the other -- or
     switch between them with a `useState`. Routing comes later.
4. Verify both pages in the browser, not just in your editor -- DevTools'
   Network tab should show the requests to your API, and the Console should
   be clean.
5. Update your README.md:
   * How to run `react-client/` locally
   * Which backend it talks to (local or deployed), and why
   * How you used AI for this assignment

Your backend can be local or deployed -- either is fine. If hw04 isn't
finished, point at your local backend and keep going.


6. The rest of your pages, as components
7. Stretch: Deploy `react-client/` to Vercel -- and check what URL it fetches from

## LLM policy

Standard policy:

* Don't trust, verify.
* Own what you submit.

## Submit

* Push your progress to the classroom50 repo.
* Be ready to walk through your PRs and explain any line of code -- in
  particular, why your `useEffect` runs when it does.
