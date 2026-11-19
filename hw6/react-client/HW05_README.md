# CS5610 HW05 — React + Vite

**Student:** Junfeng Xu  
**Project:** Acme Corp React frontend  
**HW05 backend API:** https://cs-5610-junfeng-hw4-server.vercel.app

## Historical scope

This document describes the HW05 submission. The later HW06 assignment changed API requests to relative URLs through a local Vite proxy and added login, logout, session restoration, and gated API access. See `../HW06_README.md` for the current architecture.

HW05 rebuilt the Case Studies and About/Team pages as React components. At that stage, React fetched data directly from the deployed FastAPI backend, which read from Supabase PostgreSQL.

Some JavaScript from the earlier frontend remains in `../Hw-client_code`, but its original HTML pages are not present.

## Implemented features

- **Case Studies:** fetched `GET /case-studies`; displayed the title, summary, and conditional Gated badge; and supported state-driven detail views.
- **About / Team:** fetched `GET /team-members` and displayed member photos, names, roles, and biographies.
- **Data states:** both API-driven lists displayed loading, empty, and error states.
- **Shared UI:** reused `Header`, `Footer`, Acme Corp CSS, and static assets.
- **Navigation:** used React state rather than React Router.

The email-gated case-study form was a **UI demonstration only**. It did not validate email ownership or enforce server-side authorization. Its body text was present in the client bundle.

## HW05 project structure

At the HW05 submission point, the relevant structure was:

```text
react-client/
├── public/Material/                # Images, logo, and fonts
├── src/
│   ├── components/
│   │   ├── CaseStudies.jsx         # Case Studies API and list
│   │   ├── CaseStudyDetail.jsx     # Detail views and gated UI demo
│   │   ├── Team.jsx                # Team API and list
│   │   ├── Header.jsx              # State-driven navigation
│   │   └── Footer.jsx              # Shared footer
│   ├── style/style.css             # Shared styling
│   ├── App.jsx                     # Page and selection state
│   └── main.jsx                    # React entry point
├── index.html
├── package.json
└── package-lock.json
```

Later assignments added more components, including Products, Blog, Contact, and Login.

## Install and run

Requires Node.js and npm. From the repository root:

```bash
cd react-client
npm ci
npm run dev
```

Vite normally serves the application at `http://localhost:5173/`.

At the HW05 submission point, `CaseStudies.jsx` and `Team.jsx` used `https://cs-5610-junfeng-hw4-server.vercel.app` as their API base URL. This allowed HW05 to run without a local Python server or local `DATABASE_URL`.

The current HW06 code no longer uses that direct frontend configuration. It uses relative requests and expects the Vite development proxy to forward them to FastAPI at `http://127.0.0.1:8000`.

## Production build and preview

```bash
npm run build
npm run preview
```

Vite generates production assets in `dist/`, and preview normally starts at `http://localhost:4173/`. `node_modules/` and generated `dist/` output should not be committed.

## HW05 API integration

| Component | Endpoint | Fields |
| --- | --- | --- |
| `CaseStudies.jsx` | `GET /case-studies` | `id`, `title`, `summary`, `link`, `gated` |
| `Team.jsx` | `GET /team-members` | `id`, `name`, `role`, `image`, `bio1`, `bio2` |

Each component used `useEffect()` to fetch data after mounting and `useState()` to store returned data and loading/error state.

```text
React component mounts → useEffect → fetch API → FastAPI → Supabase
                                               |
React re-renders ← state setter ← JSON response
```

## HW05 verification

The following statements record testing performed for the HW05 submission:

- `/case-studies` and `/team-members` returned HTTP 200 in browser testing.
- Case Studies, Team, images, navigation, and the UI-only gated form rendered correctly.
- The development server ran on `localhost:5173`.
- `npm run build` succeeded, and the production preview was tested on `localhost:4173`.
- FastAPI CORS allowed the Vite development and preview origins.

The deployed backend root, case-studies, and team-members endpoints were still reachable and returned HTTP 200 when this documentation was reviewed on October 23, 2026.

## Code reuse and reflection

`CaseStudies.jsx` and `Team.jsx` used the same basic data-fetching pattern: `useState()` for data/loading/error, `useEffect()` for the request, response-status checks, JSON parsing, and conditional UI. The request logic remained local to each component for clarity. With more API-backed pages, a reusable hook such as `useFetch(endpoint)` would reduce duplication.

Header, Footer, and the stylesheet were reused between pages.

## HW05 scope and limitations

- Navigation changed React state rather than the browser URL.
- Refreshing returned to the default Case Studies page.
- Detail views did not have deep links.
- At the HW05 submission point, Products, Blog, and Contact were navigation placeholders rather than implemented React pages.
- The gated-content form was not real authorization.

## AI use

I used ChatGPT as a learning, code-review, and debugging assistant to:

- Understand React components, JSX, `useState`, `useEffect`, `fetch`, Promises, and `StrictMode`
- Compare React state-driven rendering with the earlier JavaScript implementation
- Migrate the Case Studies list and detail interactions into React
- Implement Team and callback-prop navigation
- Diagnose JSX nesting, CSS/font paths, and CORS errors
- Review explanatory comments and Git/GitHub workflow

I reviewed the suggestions and remained responsible for explaining and maintaining the submitted work.
