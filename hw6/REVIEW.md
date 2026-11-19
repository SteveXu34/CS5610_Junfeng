## Section 1. One request, start to finish
- **How it works:**
1. When I reload my React app while logged in, the browser requests the page from the Vite development server on port 5173. FastAPI runs separately on port 8000 and handles API requests.
2. My Vite proxy forwards /me, /case-studies, and other API requests to FastAPI. The browser only communicates with port 5173.
3. In App.jsx, a useEffect calls /me when the component mounts. The browser includes the existing session cookie, and FastAPI's SessionMiddleware verifies its signature. The /me route reads the email stored in the session and returns the current user.
4. React then calls setUser(data) and setAuthLoading(false), triggering another render.
5. In CaseStudies.jsx, the data-fetching effect waits until authLoading is false. It first requests public case studies. If a user is logged in, it also requests /case-studies/gated.
6. The gated FastAPI route uses Depends(current_user) to verify authentication before opening the PostgreSQL connection. My app uses psycopg2.connect() directly rather than a shared get_db dependency.
7. The SQL query selects rows where gated = TRUE. FastAPI returns the results as JSON.
8. Finally, React combines public and gated case studies, calls setStudies(allStudies), and renders the updated list.

- **Prediction:**
After reloading the page, I expected React to request /me to verify the existing session, then fetch the case studies data. FastAPI would validate the session and return JSON data, which React would use to update the UI.

- **Actual Result:**
In Chrome DevTools, I observed the following successful requests:
```text
GET /me                  200 OK
GET /case-studies        200 OK
GET /case-studies/gated  200 OK
```
The results were consistent with my prediction that the app would verify the existing session and fetch both public and gated case studies.
I also observed duplicate API requests in the development environment. React StrictMode might explain some of these duplicates, but I have not confirmed the exact cause.

- **How else**
1. Authentication
My app uses a shared current_user dependency to protect the gated endpoint. Another approach would be to check the session manually inside each protected route. However, the shared dependency avoids repeating authentication logic and makes it easier to maintain consistent access control.

2. Database Connection
My app opens a PostgreSQL connection directly using psycopg2.connect() inside each route. Another approach would be to use a shared get_db dependency with a connection pool. This could reduce repeated connection overhead and make database connection management more consistent across routes.

- **Related code**
1. **Session check:** React calls `/me` when the application mounts to restore the user's login state.
   [App.jsx — Session Check](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/App.jsx#L32)
2. **Waiting for authentication:** The CaseStudies component waits until the initial session check is complete before fetching data.
   [CaseStudies.jsx — Authentication Loading](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/components/CaseStudies.jsx#L17)
3. **Fetching protected data:** React requests gated case studies only when a user is logged in.
   [CaseStudies.jsx — Gated Request](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/components/CaseStudies.jsx#L42)
4. **Backend authentication:** FastAPI uses `Depends(current_user)` to authenticate the request before accessing gated data.
   [main.py — Protected Route](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/main.py#L222)
5. **Loading state:** React displays a loading message while authentication or data fetching is in progress.
   [CaseStudies.jsx — Loading UI](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/components/CaseStudies.jsx#L88)



## Section 2. Where is the gate?
- **How it works:**
In my React app, CaseStudies.jsx checks whether user exists before requesting gated case studies. However, this is only frontend display and request logic, not actual security enforcement.
The real security gate is in FastAPI. The /case-studies/gated endpoint uses Depends(current_user) to check authentication before executing the database query.
The public endpoint only returns rows where gated = FALSE, while the protected endpoint returns rows where gated = TRUE after authentication succeeds.

- **Prediction:**
Without a session cookie, I expected the public /case-studies endpoint to return HTTP 200 and the protected /case-studies/gated endpoint to return HTTP 401.
Removing the React if (user) check would not allow an unauthenticated user to access protected data because the server still enforces authentication.

- **Actual Result:**
I ran:

curl -i http://127.0.0.1:8000/case-studies
curl -i http://127.0.0.1:8000/case-studies/gated

1. The public endpoint returned:
HTTP/1.1 200 OK
[{"id":1,"title":"First case study (the title)","summary":"This is the summary of the first case study.","link":"first_one.html","gated":false}]
2. The gated endpoint returned:
HTTP/1.1 401 Unauthorized
{"detail":"Not authenticated"}
Both results matched my prediction. This confirms that the backend prevents unauthenticated users from accessing gated data.

- **How else**
An application could fetch all data and hide protected items in React, but this would not provide real security because users could inspect the network response.
Filtering data in SQL or Python can both be secure approaches, provided the server authenticates the user and enforces the appropriate access rules before returning the response.
The important distinction is that the browser controls what to display, while the server controls what data is allowed to leave the backend.

- **Related code**
React — [Gated Request](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/components/CaseStudies.jsx#L42)

FastAPI — [Protected Route](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/main.py#L222)


## Section 3. Three ways in
- **How it works:**
My application uses Starlette's `SessionMiddleware` with a signed session cookie. After successful login, the server stores the user's email in the session.
The cookie is signed, not encrypted, so its contents can be decoded. However, modifying the cookie invalidates its signature. An attacker would need the `SESSION_SECRET` to generate a correctly signed cookie accepted by the server.
The `current_user` dependency checks whether the session contains an email and returns HTTP 401 if authentication fails.

- **Prediction:**
1. **No cookie:** The gated endpoint should return HTTP 401.
2. **Tampered cookie:** A valid cookie should allow access, but changing one character should cause HTTP 401.
3. **Bypassing FastAPI:** Direct access through Supabase Data API should fail because I previously disabled the Data API.

- **Actual Result:**
**Experiment 1 — No Cookie**
```bash
curl -i http://127.0.0.1:8000/case-studies/gated
```
Output:

```text
HTTP/1.1 401 Unauthorized
{"detail":"Not authenticated"}
```

**Experiment 2 — Tampered Cookie**
I logged in using `curl -c jar.txt`, then used the saved cookie to access the gated endpoint.

```bash
curl -i -b jar.txt http://127.0.0.1:8000/case-studies/gated
```
The valid cookie returned the protected case study data.
I copied `jar.txt` to `tampered-jar.txt` and modified one character in the session cookie.
```bash
curl -i -b tampered-jar.txt http://127.0.0.1:8000/case-studies/gated
```

Output:
```text
HTTP/1.1 401 Unauthorized
{"detail":"Not authenticated"}
```
The modified cookie was rejected, consistent with session signature verification.

**Experiment 3 — Bypassing FastAPI**
My PostgreSQL database is hosted on Supabase, and FastAPI connects through the Supabase connection pooler.
I confirmed in the Supabase Dashboard that the Data API was disabled.
I also tested direct REST access using the project's publishable API key:

```bash
curl -i \
  "https://pojzgvmlqllorcbfnqgp.supabase.co/rest/v1/users?select=*" \
  -H "apikey: <PUBLISHABLE_KEY>"
```

The response included:

```text
"code": "PGRST002"
"message": "Could not query the database for the schema cache. Retrying."
```

The request did not return user data. This is consistent with the Data API being disabled, although the error alone does not verify RLS policies.

- **How else**
Instead of storing session data in a signed cookie, the application could store sessions in a server-side database or Redis.
The browser would receive only a random session ID. The server would use that ID to look up the corresponding session.
With server-side sessions, logging out would require invalidating or deleting the stored session. This approach also makes it easier to revoke sessions before their expiration.

- **Related code**
- [FastAPI — Protected Route](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/main.py#L222)
- [React — Gated Request](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/react-client/src/components/CaseStudies.jsx#L42)


## Section 4. What's in my repo
- **How it works:**
My FastAPI application reads `DATABASE_URL` and `SESSION_SECRET` from environment variables instead of hardcoding them.

- `DATABASE_URL` contains the PostgreSQL connection information, including the database password.
- `SESSION_SECRET` is used by Starlette's `SessionMiddleware` to sign session cookies.

Both are sensitive. If the database credentials are exposed, someone with network access and sufficient database permissions could connect directly to PostgreSQL. If `SESSION_SECRET` is exposed, an attacker could forge valid session cookies.
A database credential may be more dangerous because it could expose multiple database tables, while a leaked session secret could compromise authentication. The actual impact depends on the permissions and configuration.

- **Prediction:**
I expected `.env` and `environment.env` to be ignored by Git in the current version of my repository. However, I suspected that older commits might still contain sensitive credentials.

- **Actual Result:**
**Test 1 — Check tracked files**
I ran:
```bash
git ls-files
```
The output listed the tracked source files, configuration files, SQL scripts, and documentation. Neither `.env` nor `environment.env` appeared in the current tracked file list.

**Test 2 — Check Git history**
I searched the Git history for PostgreSQL connection strings, bcrypt hashes, and session secrets using:
```bash
git log -p | grep -E 'postgres(ql)?://[^ ]*:[^ @]*@|\$2b\$|SESSION_SECRET='
```
The search found potential sensitive information.
After examining the matches, I confirmed that an older version of `environment.env` contained real database credentials and a session secret. Other matches appeared in documentation and example files.

**Test 3 — Rotate exposed credentials**
I reset the Supabase database password and replaced `SESSION_SECRET` with a new value.
After updating my local environment, I verified that both environment variables were set and that FastAPI could still connect to PostgreSQL.
Command:
```bash
curl -i http://127.0.0.1:8000/case-studies
```
Output:
```text
HTTP/1.1 200 OK

[{"id":1,"title":"First case study (the title)","summary":"This is the summary of the first case study.","link":"first_one.html","gated":false}]
```

**Test 4 — Verify Git ignore rules**
I ran:
```bash
git ls-files --error-unmatch environment.env
```

Output:
```text
error: pathspec 'environment.env' did not match any file(s) known to git
```

Then:
```bash
git check-ignore -v .env
git check-ignore -v environment.env
```
Output:
```text
.gitignore:11:.env             .env
.gitignore:14:environment.env  environment.env
```

I also checked the working tree:
```bash
git status --short
```
Output:
```text
?? REVIEW.md
```
These results confirm that my local environment files are not currently tracked and are covered by Git ignore rules.
**Remaining issue:** The old credentials may still exist in historical commits. Rotating the credentials invalidates the old values, but it does not erase them from Git history. I have not rewritten the Classroom repository history because that could affect existing branches, commits, and pull requests. Historical cleanup still needs to be coordinated.

- **How else**
A new team member could use an `.env.example` file containing only variable names and placeholder values.
The actual database credentials and session secret could be shared securely through a password manager or secrets management service, rather than through chat or Git.
For production deployments, the team could configure environment variables through the hosting platform's secret management settings.
This would allow developers to run the application without committing or directly sharing sensitive values.

- **Related code**
1. **Database credentials:** FastAPI reads `DATABASE_URL` from the environment.
   [main.py — DATABASE_URL](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/main.py#L15)
2. **Session secret:** FastAPI reads `SESSION_SECRET` from the environment.
   [main.py — SESSION_SECRET](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/main.py#L16)
3. **Git ignore rules:** The repository excludes `environment.env` from tracking.
   [.gitignore — environment.env](https://github.com/nuwebdev/fall-2026-hw03-server-stevexu34/blob/0e400b8cbc1fe3d11b811e358411651506f4805b/.gitignore#L14)


## Section 5. Break one thing