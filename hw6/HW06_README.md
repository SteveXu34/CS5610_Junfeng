# HW06 — Authentication and Authorization
**Project:** Acme Corp React Frontend  
**Course:** CS5610 — Web Development  
**Assignment:** HW06 — Authentication and Authorization  
**Student:** Junfeng Xu

## Overview

This assignment adds session-based authentication and server-side authorization to the existing FastAPI and React application.
Users can log in and log out through the React interface. The public case-study API is accessible to everyone, while the gated case-study API requires an authenticated session.

The gated case-study body currently remains a frontend demonstration: it is hardcoded in the React bundle and its email form does not perform server-side authorization. Therefore, the implementation protects access to the gated API record, but it does not yet protect the body text as confidential content.

## 1. Implementation

- **Backend:** Added `/login`, `/logout`, and `/me` endpoints using FastAPI and Starlette `SessionMiddleware`.
- **Users:** Created a PostgreSQL `users` table and a `create_user.py` script to securely create test accounts.
- **Password Security:** Passwords are hashed using bcrypt. Plaintext passwords are not stored in the database.
- **Authorization:** `/case-studies` returns only public case-study records. `/case-studies/gated` requires an authenticated session and returns HTTP 401 without one.
- **Frontend:** Added login/logout functionality to the existing React page. The application calls `/me` on page load to restore the session.
- **Vite Proxy:** API requests use relative URLs and are proxied to the local FastAPI server.

## 2. Local Setup

Install the Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Configure `DATABASE_URL` and `SESSION_SECRET` in the shell or in a local environment file. Do not commit either value.

> **Security notice:** `environment.env` is currently tracked in this repository. Any database password or session secret committed in that file must be treated as exposed and rotated. Before putting replacement secrets in the file, remove it from Git tracking and add `environment.env` to `.gitignore`. An example file containing placeholders, rather than real values, should be committed instead.

The backend expects the following existing PostgreSQL schema:

- `users(id, email, password_hash)`
- `case_studies(id, title, summary, link, gated)`
- The earlier-assignment `greetings`, `products`, and `team_members` tables

`users.sql` creates the `users` table. The checked-in `seed.sql` and `case_studies.sql` files describe an older case-study schema using `body` and `is_gated`; they cannot initialize the schema expected by the current backend without being updated.

After loading the environment variables, create the `users` table and a test account:

```bash
psql "$DATABASE_URL" -f users.sql
python create_user.py
```

Start FastAPI from the repository root:

```bash
set -a
source environment.env
set +a
python -m uvicorn main:app --reload --port 8000
```

In another terminal, start React:

```bash
cd react-client
npm ci
npm run dev
```

Open `http://localhost:5173`.

## 3. Session Cookie Security

Starlette's session cookie is **signed, not encrypted**.

The user can inspect or decode the cookie contents. The signature prevents unauthorized changes, but it does not provide confidentiality.

For this reason, passwords and other sensitive information must not be stored in the session.

The `SESSION_SECRET` environment variable is required for signing and verifying cookies. It must remain private because an attacker with the secret could forge valid session cookies.

## 4. Security Testing

| Scenario | Expected HTTP status |
|---|---|
| Access gated content without login | 401 |
| Log in with valid credentials | 200 |
| Access gated content after login | 200 |
| Access gated content with a tampered cookie | 401 |
| Access gated content after logout | 401 |
| Log in with an incorrect password | 401 |
| Log in with an unknown email | 401 |

Incorrect passwords and unknown emails return the same authentication error response.

### Curl Tests

**1. Unauthenticated request**

```bash
curl -i http://127.0.0.1:8000/case-studies/gated
```

Expected: `401 Unauthorized`.

**2. Login and save the cookie**

```bash
curl -i -c jar.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_TEST_EMAIL","password":"YOUR_TEST_PASSWORD"}' \
  http://127.0.0.1:8000/login
```

Replace the placeholders with local test credentials. Do not save real credentials in the repository.

Expected: `200 OK`.

**3. Authenticated request**

```bash
curl -i -b jar.txt \
  http://127.0.0.1:8000/case-studies/gated
```

Expected: `200 OK`.

**4. Tampered cookie**

Create a copy of `jar.txt`, modify one character in the `session` cookie value, and save it as `tampered-jar.txt`.

```bash
curl -i -b tampered-jar.txt \
  http://127.0.0.1:8000/case-studies/gated
```

Expected: `401 Unauthorized`.

**5. Logout**

```bash
curl -i -b jar.txt -c jar.txt \
  -X POST http://127.0.0.1:8000/logout

curl -i -b jar.txt \
  http://127.0.0.1:8000/case-studies/gated
```

Expected after logout: `401 Unauthorized`.

Remove temporary cookie files:

```bash
rm -f jar.txt tampered-jar.txt
```

### Automated Tests

Authentication tests are implemented in `tests/test_auth.py` using FastAPI `TestClient`, pytest, and mocked database connections.

```bash
python -m pytest tests/test_auth.py -v
python -m pytest -v
```

These automated tests cover unauthorized access, successful authentication, logout, and consistent error responses for invalid credentials. The tampered-cookie scenario is documented as a manual curl test above and is not a separate automated test in `tests/test_auth.py`.

## 5. Supabase Data API

Supabase Data API settings are external deployment configuration and are not represented by files in this repository. They must be verified directly in the Supabase dashboard.

If the Data API exposes `case_studies` or other protected tables, clients may be able to bypass the FastAPI authorization layer. Before deployment, confirm that direct REST access is disabled or restricted with appropriate Row Level Security policies, and test that an unauthenticated REST request cannot read protected records.

## 6. Frontend and CORS

During local development, Vite proxies API requests from `http://localhost:5173` to FastAPI at `http://127.0.0.1:8000`.

This allows the browser to use same-origin requests, simplifying cookie handling without relying on cross-origin authentication.

Some JavaScript from the previous frontend remains in `Hw-client_code`, but its HTML pages are not present. HW06 authentication was implemented in React without adding a separate login page or client-side router.

## 7. AI Usage

I used ChatGPT to understand session-based authentication, signed cookies, bcrypt, and server-side authorization. It also helped review the React login implementation, debug pytest mocks, and prepare documentation.

I reviewed the suggestions and tested the implementation locally.
-----------------------------------------------------------------------------------------------------------------------------------
## 8. HW6 - brief
### 1a. What I Built Against

The following requirements guided my implementation of HW06 Authentication. Each requirement defines behavior that can be verified through code inspection, API requests, or automated tests.

| # | Requirement (checkable) | Source | How I'd check it |
|---|---|---|---|
| 1 | Vite proxies frontend API requests to the FastAPI backend through a single origin. | S | Start both FastAPI and Vite, then run `curl -i http://localhost:5173/case-studies`; verify a successful API response. |
| 2 | User credentials are stored in a PostgreSQL `users` table, with passwords hashed using bcrypt rather than stored as plaintext. | S | Inspect the schema and account creation script; verify that password hashes are stored. |
| 3 | `POST /login` authenticates valid credentials and establishes a session. | S | Submit valid credentials using curl and verify HTTP 200 and the session cookie. |
| 4 | `GET /me` identifies the authenticated user, and `POST /logout` clears the session. | S | Log in and call `/me`; then log out and call `/me` again, verifying that it returns HTTP 200 with JSON `null`. |
| 5 | The protected `/case-studies/gated` API endpoint returns HTTP 401 when accessed without authentication. | S | Run `curl -i http://localhost:8000/case-studies/gated` without a session cookie and verify HTTP 401. |
| 6 | The React frontend provides a login interface connected to the backend authentication API. | S | Log in through React and verify the request and resulting UI state. |
| 7 | Invalid login attempts with a wrong password or an unknown email must return the same HTTP 401 response without revealing whether the account exists. | J | Run `test_invalid_login_responses_match` in pytest and verify both responses have identical status codes and JSON bodies. |
| 8 | Authentication tests must run independently of a live PostgreSQL database by using mocked database connections. | A | Inspect the `FakeConnection` and `FakeCursor` classes in `tests/test_auth.py`, then run `python -m pytest tests/test_auth.py -v`. |

### 1c. Group Decisions

| Question | What each of us did | What the group would pick | Why |
|---|---|---|---|
| How should React communicate with FastAPI? | We compared using the Vite proxy with relative API paths versus making direct requests to FastAPI. | Use the Vite proxy with `API_BASE` set to an empty string. | Same-origin requests simplify session cookie handling and avoid unnecessary CORS configuration during local development. |
| How should we store user passwords? | We compared storing plaintext passwords with hashing passwords using `bcrypt` before storage. | Use `bcrypt` and store only `password_hash` in the `users` table. | Password hashing protects the original passwords from being directly exposed if the database is compromised. |
| How should we protect gated case studies? | We compared hiding gated content in React with enforcing session-based authorization in FastAPI. | Enforce authentication in FastAPI and return HTTP 401 for unauthenticated requests. | Hiding content in React does not prevent users from accessing protected backend endpoints directly. |
