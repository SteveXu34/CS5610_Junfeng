# CS5610 HW04 — FastAPI Backend Integration

**Student:** Junfeng Xu  
**Course:** CS5610 — Web Development

## Historical scope

This document describes the HW04 version of the project. Later assignments added the React frontend and session authentication, so the current checkout contains routes, dependencies, and environment variables that were not part of HW04. See `react-client/HW05_README.md` and `HW06_README.md` for those later changes.

HW04 connected the Acme Corp frontend data to a FastAPI backend using PostgreSQL hosted on Supabase. Product, case-study, and team-member records were retrieved through API endpoints instead of local JavaScript arrays.

The repository retains JavaScript from the earlier frontend in `Hw-client_code`, but its original HTML pages are not present. Those JavaScript files are therefore historical source material rather than a complete runnable frontend.

## Deployed applications

- Frontend used for HW04: https://cs-5610-junfeng-hw2.vercel.app
- FastAPI backend: https://cs-5610-junfeng-hw4-server.vercel.app

The deployed backend exposes these HW04 endpoints:

- `GET /`
- `GET /hello/{name}`
- `GET /greetings`
- `GET /products`
- `GET /case-studies`
- `GET /team-members`

## Architecture

```text
Frontend on Vercel
        |
        | fetch()
        v
FastAPI on Vercel
        |
        | psycopg2
        v
Supabase PostgreSQL
```

At the HW04 stage, the database contained the following application tables:

- `greetings`
- `products`
- `case_studies`
- `team_members`

The backend reads its connection string from the `DATABASE_URL` environment variable. The connection string is not hardcoded in `main.py`.

## CORS

Because the frontend and backend can run on different origins, FastAPI uses `CORSMiddleware`. The configured allowlist includes:

- `http://localhost:5500`
- `http://localhost:5173`
- `http://localhost:4173`
- `https://cs-5610-junfeng-hw2.vercel.app`

## Automated tests

The HW04 tests use FastAPI `TestClient` and pytest. They call the local ASGI application without requiring a running Uvicorn process. Tests for database-backed endpoints connect to PostgreSQL using `DATABASE_URL`.

The six HW04 route tests cover:

- Root and dynamic greeting responses
- Database greetings
- Products
- Public case studies
- Team members

## Local setup

The Makefile creates `.venv` inside the repository and installs `requirements.txt`:

```bash
make setup
```

The Makefile's test target reads `environment.env`, not `.env`. Configure at least `DATABASE_URL` there when reproducing the HW04 version:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DATABASE'
```

Then run:

```bash
make test
```

To start the HW04 backend manually:

```bash
set -a
source environment.env
set +a
.venv/bin/python -m uvicorn main:app --reload --port 8000
```

The local API is available at `http://127.0.0.1:8000`, and its interactive documentation is at `http://127.0.0.1:8000/docs`.

> **Current-checkout note:** The later HW06 application also requires `SESSION_SECRET`. Follow `HW06_README.md` when running the current code rather than the historical HW04 version.

> **Security notice:** `environment.env` is currently tracked in this repository. Any credentials committed in that file must be treated as exposed and rotated. Before storing replacement credentials, remove the file from Git tracking, ignore it, and commit only a placeholder example file.

## Deployment verification

The deployed backend can be checked independently of the local tests:

```bash
curl -f https://cs-5610-junfeng-hw4-server.vercel.app/products
```

The deployed root, products, case-studies, and team-members endpoints were reachable and returned HTTP 200 when this documentation was reviewed on October 23, 2026.

## AI use

I used ChatGPT as a learning and debugging assistant to:

- Understand FastAPI `TestClient` and pytest
- Connect frontend `fetch()` requests to FastAPI endpoints
- Understand and configure CORS
- Connect FastAPI to Supabase PostgreSQL
- Troubleshoot Vercel deployment
- Review code and explain errors
- Learn GitHub pull-request and branch workflows

I reviewed the suggestions and remained responsible for the submitted implementation.
