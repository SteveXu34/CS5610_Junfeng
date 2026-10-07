
# Exercise in the class Oct 2.
import os
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



DATABASE_URL = os.environ["DATABASE_URL"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Same-Origin Policy
# At first the frontend origin and the backend origin are different.
# The code above is allowed the fronted orgin http://localhost:5500 to access and read the data.
# allow_methods=["*"] means add header Access-Control-Allow-Origin: http://localhost:5500, which tell the browser allow http://localhost:5500
# to read the data from backend.


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



@app.get("/case-studies")
def read_case_studies():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, title, summary, link, gated "
        "FROM case_studies ORDER BY id;"
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