# Class: CS5610
# Assignment: HW4
# Name: Junfeng Xu
# Time: Oct-07-2026

# FastAPI Backend Integration

**Frontend live demo deployed on Vercel:** https://cs-5610-junfeng-hw2.vercel.app

**Backend API deployed on Vercel:** https://cs-5610-junfeng-hw4-server.vercel.app

## Project Overview

This project extends the previous FastAPI and PostgreSQL server assignment into a deployed backend for the Acme Corp frontend.

The frontend now retrieves Products, Case Studies, and Team Members from FastAPI endpoints using `fetch()` instead of storing those records in local JavaScript arrays.

The backend uses PostgreSQL hosted on Supabase and is deployed on Vercel.

## Main Changes

### 1. Pytest

1. Pytest
I added automated integration tests using FastAPI TestClient and pytest.
The tests cover six API endpoints:
- Root endpoint (/)
- Dynamic hello endpoint (/hello/{name})
- Greetings endpoint (/greetings)
- Products endpoint (/products)
- Case Studies endpoint (/case-studies)
- Team Members endpoint (/team-members)
The tests use TestClient to call the local FastAPI application directly without starting a Uvicorn server.
Database-related tests connect to Supabase PostgreSQL using the DATABASE_URL environment variable.
A Makefile automates dependency installation, environment setup, and test execution.
-----------------------------------------------------------------------------------------------------------------
To run the tests:
make setup
make test
make setup creates the Python virtual environment and installs the required dependencies. make test loads the database configuration from envrionment.env and runs all pytest tests.
The tests verify HTTP status codes, JSON responses, and expected database records.

### 2. Connect the Frontend to FastAPI

The frontend uses `fetch()` to request data from the FastAPI backend.

The following content is now loaded from API endpoints:
- Products
- Case Studies
- Team Members

The navigation data remains in the frontend because it is part of the client-side site configuration rather than database content.

### 3. Supabase PostgreSQL

The backend connects to a PostgreSQL database hosted on Supabase.

The database contains:
- `greetings`
- `products`
- `case_studies`
- `team_members`

The FastAPI application reads the database connection string from the `DATABASE_URL` environment variable:

```python
DATABASE_URL = os.environ["DATABASE_URL"]
```

The database password and connection string are not hard-coded in the source code.

### 4. CORS

The frontend and backend are deployed on different origins, so FastAPI uses `CORSMiddleware`.

The backend allows requests from:
- Local frontend: `http://localhost:5500`
- Deployed frontend: `https://cs-5610-junfeng-hw2.vercel.app`

This allows both local development and the deployed frontend to access the FastAPI API.

### 5. Vercel Deployment

The FastAPI backend is deployed on Vercel.
The deployment includes:
- `main.py` at the project root
- `requirements.txt`
- `DATABASE_URL` configured as a Vercel environment variable
- Supabase PostgreSQL as the production database

The deployed API can be accessed at:

```text
https://cs-5610-junfeng-hw4-server.vercel.app
```

Example endpoints:

```text
/
 /hello/{name}
 /greetings
 /products
 /case-studies
 /team-members
```

## Application Flow

```text
Vercel Frontend
      |
      | fetch()
      v
Vercel FastAPI Backend
      |
      | psycopg2
      v
Supabase PostgreSQL
```

## How to Run Locally

How to Run Locally

1. Set Up the Python Environment

Navigate to the backend project directory (hw3).

cd hw3

Run the Makefile setup command:

make setup

This command:

Creates a Python virtual environment at ../.venv.

Installs dependencies from requirements.txt.

Installs pytest and httpx for automated testing.

The Makefile uses the virtual environment's Python interpreter directly, so manual activation is not required.

2. Configure the Database Connection

Create a .env file in the hw3 directory:

touch .env

Add the Supabase PostgreSQL connection string:

DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DATABASE'

Replace the placeholders with the actual Supabase connection details.

The .env file is used for local development and testing. The deployed backend uses the DATABASE_URL environment variable configured separately in Vercel.

Security: Do not commit .env or database credentials to GitHub. Add .env to .gitignore.

3. Run Automated Tests

Run:

make test

The Makefile loads DATABASE_URL from .env and executes:

python -m pytest -v

The tests use FastAPI TestClient to execute local API routes without starting a server.

For database-related endpoints, FastAPI connects directly to Supabase PostgreSQL.

The tests validate status codes, JSON responses, and expected database content.

4. Start FastAPI Locally (Optional)

To manually run the backend server, load the environment variables and start Uvicorn:

set -a
source environment.env
set +a
../.venv/bin/python -m uvicorn main:app --reload

The local backend is available at:

http://127.0.0.1:8000

FastAPI's interactive API documentation is available at:

http://127.0.0.1:8000/docs

5. Run the Frontend Locally (Optional)

From the frontend project directory:

python3 -m http.server 5500

Open:

http://localhost:5500

The frontend currently fetches data from the deployed Vercel backend.

6. Verify the Deployed Backend

The backend is already deployed to Vercel:

https://cs-5610-junfeng-hw4-server.vercel.app

To verify a deployed endpoint:

curl -f https://cs-5610-junfeng-hw4-server.vercel.app/products

This checks the deployed API rather than the local FastAPI application.

Testing distinction:

make test: Runs local FastAPI integration tests with TestClient and Supabase.

curl against the Vercel URL: Checks the deployed backend through HTTP requests.

## AI Use

I used ChatGPT as a learning and debugging assistant during this assignment.

I used it in the following area:
- Understand FastAPI `TestClient` and `pytest`
- Understand how frontend `fetch()` requests connect to FastAPI endpoints
- Understand and configure CORS
- Connect FastAPI to Supabase PostgreSQL
- Troubleshoot the Vercel deployment
- Review code and explain errors during development
- Learn the knowledge about Pull Request on Github.
- How to manadge git branch on Github, like delete, add and change.