# HQE Frontend — React + TypeScript + Vite

This is the frontend for Hospital Quality Explorer. Run from the `frontend/` directory:

```bash
npm ci
npm run dev       # http://localhost:5173
npm run build     # TypeScript + production build
npm run lint      # lint source
```

The local Vite proxy forwards relative `/api/*` requests to `http://127.0.0.1:8000`; start the FastAPI backend separately. Use `apiGet<T>()` / `apiPost<T>()` from `src/api/client.ts` and story-specific typed services in `src/api/`. **Never add PostgreSQL or Supabase secrets to frontend code or `VITE_*` variables.**

## v0.2 component status

| Feature | Source | Integrated in `App.tsx`? |
| --- | --- | --- |
| Homepage and Ask HQE form | `src/App.tsx` | Yes, but the Ask HQE view expects an older S5 response shape; integration needs updating |
| S1 ratings results | `src/components/s1/S1Results.tsx` | No |
| S2 heart-failure results | `src/components/s2/S2Results.tsx` | No |
| S3 hip/knee results | `src/components/s3/S3Complications.tsx` | No |
| S4 emergency-care comparison | `src/EmergencyCare.tsx` | **Yes**; city-only search and historical CMS durations |
| S5 independent question component | `src/components/s5/S5Ask.tsx` | No; it understands the current backend response |
| S6 inspection timeline | — | Not present in this snapshot |

This is a **source-code inventory**, not a guarantee about the deployed website. The planned unified Explore Data page (category choice, Basic/Advanced filters) is deferred to a later version.

## Deployment configuration

`vercel.json` uses a same-origin `/api/:path*` rewrite to `https://hqe-deploy.onrender.com/api/:path*`. Accordingly, `src/api/client.ts` currently uses `const API_BASE = '/api'`; that works locally via the Vite proxy and on Vercel **if** the checked-in rewrite is used. No `VITE_API_BASE_URL` is required for this configuration.

If the team chooses a different host or direct cross-origin API calls later, update the API base configuration and coordinate the deployed frontend origin with the backend maintainer's CORS allowlist. The Render backend is maintained from a separate mirror and does not automatically track repository `main`.

**Release note:** Creating the GitHub `v0.2` tag does not redeploy the frontend or Render backend. Verify the deployed URL and version separately before claiming public end-to-end availability.
