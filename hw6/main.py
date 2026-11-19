
# Exercise in the class Oct 2.
import os
import psycopg2
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

# HW6_mission_3
import bcrypt
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware



DATABASE_URL = os.environ["DATABASE_URL"]
SESSION_SECRET = os.environ["SESSION_SECRET"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500",
                    "http://localhost:5173", # Allow React +Vite to access.
                    "http://localhost:4173",
                   "https://cs-5610-junfeng-hw2.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Same-Origin Policy
# At first the frontend origin and the backend origin are different.
# The code above is allowed the fronted orgin http://localhost:5500 to access and read the data.
# allow_methods=["*"] means add header Access-Control-Allow-Origin: http://localhost:5500, which tell the browser allow http://localhost:5500
# to read the data from backend.



# Enable session authentication.
# SessionMiddleware verifies the signed session cookie.
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="session",
    same_site="lax",
    https_only=False,
    max_age=3600
)


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}


@app.get("/hello/{name}")
def read_name(name: str):
    return {"message": f"Hello, {name}"}


@app.get("/greetings")
def read_greetings():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, message FROM greetings ORDER BY id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": row[0], "message": row[1]} for row in rows]


@app.get("/products")
def read_products():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, description FROM products ORDER BY id;"
    )
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2]
        }
        for row in rows
    ]

#HW6
# Verify that the user has an authenticated session.
# Depends() allows FastAPI to reuse this authentication check.
def current_user(request: Request):
    email = request.session.get("email")

    # Reject requests without a valid login session.
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    return email

@app.get("/case-studies")
def read_case_studies():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute(
    "SELECT id, title, summary, link, gated "
    "FROM case_studies WHERE gated = FALSE ORDER BY id;"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": row[0],
            "title": row[1],
            "summary": row[2],
            "link": row[3],
            "gated": row[4]
        }
        for row in rows
    ]

@app.get("/team-members")
# Define a FASTapi route.
def read_team_members():
    conn = psycopg2.connect(DATABASE_URL)
     # Connect to the PostgreSQL database using DATABASE_URL.
     # psycopg2 is the API which can link the python and PostgreSQL.
    cur = conn.cursor()
    # Create a cursor object to execute SQL queries.
    cur.execute(
        "SELECT id, name, role, image, bio1, bio2 "
        "FROM team_members ORDER BY id;"
    )

    # Execute a SQL query to get all team member data,
    # ordered by id.
    rows = cur.fetchall()
    # Fetch all rows returned by the SQL query.
    cur.close()
    conn.close()
    # Close the cursor and database connection.

    return [
        {
            "id": row[0],
            "name": row[1],
            "role": row[2],
            "image": row[3],
            "bio1": row[4],
            "bio2": row[5]
        }
        for row in rows
    ]
    # return a list of Json format.





# HW6
# Define the JSON structure for login requests.
class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(credentials: LoginRequest, request: Request):
    # Normalize email for consistent database lookup.
    email = credentials.email.strip().lower()

    # Look up the user's stored password hash.
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT email, password_hash FROM users WHERE email = %s;",
                (email,)
            )
            user = cur.fetchone()

    # Return the same error for an unknown email or wrong password.
    if user is None or not bcrypt.checkpw(
        credentials.password.encode("utf-8"),
        user[1].encode("utf-8")
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Store only the email in the signed session.
    request.session.clear()
    request.session["email"] = user[0]

    return {"message": "Login successful", "email": user[0]}


@app.post("/logout")
def logout(request: Request):
    # Remove all information from the session.
    request.session.clear()
    return {"message": "Logged out successfully"}



@app.get("/me")
def get_me(request: Request):
    # Return the logged-in user's email or JSON null.
    email = request.session.get("email")
    return {"email": email} if email else None

# Return gated case studies only to authenticated users.
@app.get("/case-studies/gated")
def read_gated_case_studies(user: str = Depends(current_user)):
    # Authentication is checked before executing the database query.
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, title, summary, link, gated "
        "FROM case_studies WHERE gated = TRUE ORDER BY id;"
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id": row[0],
            "title": row[1],
            "summary": row[2],
            "link": row[3],
            "gated": row[4]
        }
        for row in rows
    ]