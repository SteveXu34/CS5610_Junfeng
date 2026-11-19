# CS5610 HW05: React + Vite

**Student:** Junfeng Xu  
**Project:** Acme Corp React frontend  
**Backend API:** https://cs-5610-junfeng-hw4-server.vercel.app

## Project overview

This homework rebuilds two pages from the original HTML/JavaScript frontend as React components. React fetches data from the existing FastAPI backend, which reads a Supabase PostgreSQL database. The original frontend remains in the repository.

## Implemented features

- **Case Studies:** fetches `GET /case-studies`; displays title, summary, and a conditional Gated badge; supports detail views and an example email-gated content interaction.
- **About / Team:** fetches `GET /team-members`; displays member photos, names, roles, and biographies.
- **Data states:** both API-driven lists show loading, empty, and error states.
- **Shared UI:** reusable `Header` and `Footer` components, Acme Corp CSS and static assets, and navigation controlled by React state. React Router is not needed for this assignment.

The gated-content form is a **UI demonstration only**. It does not validate email ownership or enforce server-side access permissions.

## Project structure

```text
react-client/
├── public/Material/               # Images, logo, fonts
├── src/
│   ├── components/
│   │   ├── CaseStudies.jsx         # Case Studies API and list
│   │   ├── CaseStudyDetail.jsx     # Detail pages and gated UI demo
│   │   ├── Team.jsx                # Team API and list
│   │   ├── Header.jsx              # Navigation
│   │   └── Footer.jsx              # Shared footer
│   ├── style/style.css             # Shared legacy CSS
│   ├── App.jsx                     # Current page and selection state
│   └── main.jsx                    # React entry point
├── package.json
└── package-lock.json
```

## Run locally

Requires **Node.js and npm**. From the repository root:

```bash
cd react-client
npm ci
npm run dev
```

Open the local URL shown by Vite, normally **http://localhost:5173/**.

The React frontend uses the already-deployed FastAPI backend at **https://cs-5610-junfeng-hw4-server.vercel.app**. I chose the deployed backend so the React project can be tested without installing PostgreSQL, starting Python, or sharing database credentials. `DATABASE_URL` is configured on Vercel for the backend; it is **not needed in the frontend**.

## Production build and preview

```bash
npm run build
npm run preview
```

Vite generates production assets in `dist/`. Preview normally starts at **http://localhost:4173/**. Do not commit `node_modules/` or `dist/`: `npm ci` restores packages, and `npm run build` recreates the build output.

## API integration

| Component | Endpoint | Fields |
| --- | --- | --- |
| `CaseStudies.jsx` | `GET /case-studies` | `id`, `title`, `summary`, `link`, `gated` |
| `Team.jsx` | `GET /team-members` | `id`, `name`, `role`, `image`, `bio1`, `bio2` |

Each component uses `useEffect()` to fetch data when mounted, `useState()` to store the returned data and loading/error states, and conditional JSX to display the result. The base URL is defined in a constant instead of being repeated in each request within the component.

```text
React component mounts → useEffect → fetch API → FastAPI / Supabase
                                               ↓
React re-renders ← state setter ← JSON response
```

## Browser and build verification

- Chrome DevTools Network showed **HTTP 200** for both `/case-studies` and `/team-members`.
- Case Studies, Team, images, and navigation rendered correctly during local testing.
- Case Study detail navigation and the sample gated form were exercised.
- The React development server worked on `localhost:5173`.
- `npm run build` succeeded, and the production preview was tested on `localhost:4173`.
- Initial CORS errors were resolved by updating the FastAPI allowed origins and redeploying the backend.
- React development `StrictMode` can cause duplicate fetches during development. Autofill browser-extension warnings were seen; no outstanding CORS error remained in the final test.

## Code reuse and reflection

`CaseStudies.jsx` and `Team.jsx` repeat the same basic data-fetching pattern: `useState()` for data/loading/error, `useEffect()` for the API request, response status checks, JSON parsing, and conditional loading/empty/error UI. I kept each page's request code local to its component for clarity in this learning assignment. With additional API-backed pages, I would extract a reusable custom hook such as `useFetch(endpoint)` to share this logic. Header, Footer, and stylesheet are already reused between pages.


## Backend Configuration

The React frontend connects to the deployed FastAPI backend on Vercel:

https://cs-5610-junfeng-hw4-server.vercel.app

I chose the deployed backend instead of a local backend because it is already connected to Supabase PostgreSQL and publicly accessible.
This allows the React application to fetch data without requiring users to run FastAPI locally or configure their own DATABASE_URL.
The frontend uses the following API endpoints:
GET /case-studies — retrieves case study data.
GET /team-members — retrieves team member information.

FastAPI CORS settings have been updated to allow requests from the Vite development and preview environments.


## AI use

I used ChatGPT as a learning, code-review, and debugging assistant. It helped me:

- Understand React components, JSX, `useState`, `useEffect`, `fetch`, Promises and `StrictMode`.
- Compare React state-driven rendering with the original HTML/JavaScript implementation.
- Migrate the Case Studies list and detail interactions into React components.
- Implement Team and callback-prop navigation between pages.
- Diagnose JSX nesting problems, CSS/font asset paths, and FastAPI CORS errors.
- Review explanatory code comments and Git branches/PR workflow.

I reviewed the code and verified the behavior in the browser and through the production build. I am responsible for explaining and maintaining the submitted work.

## Scope and limitations

- Navigation changes React state, not the browser URL; refreshing returns to the default Case Studies page, and detail pages do not have deep links.
- Products, Blog, and Contact remain placeholder navigation items, not fully migrated React pages.
- The gated-content example is not real authorization.