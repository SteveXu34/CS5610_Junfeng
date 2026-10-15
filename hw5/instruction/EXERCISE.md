# In-class exercise -- FastAPI, three steps

Follow along on your own machine. Each step builds on the one before it, in a
single file called `main.py`.

Authoritative reference: <https://fastapi.tiangolo.com/tutorial/>

---

## Step 1 -- a minimal app

Ref: [First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)

Create `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI"}
```

Activate the environment (in every shell):

```
conda activate fastapi-server
```

Run it:

```
uvicorn main:app --reload
```

(or `make run`, which does the same thing -- see the `Makefile`)

Leave that running and browse to <http://127.0.0.1:8000>.

Then ask for the same thing from a second terminal -- same response, viewed
the other way:

```
curl http://127.0.0.1:8000
```

---

## Step 2 -- a path parameter

Ref: [Path Parameters](https://fastapi.tiangolo.com/tutorial/path-params/)

Add to `main.py`:

```python
@app.get("/hello/{name}")
def read_name(name: str):
    return {"message": f"Hello, {name}"}
```

`--reload` picks up code changes on its own, so there's no need to restart.

Browse to <http://127.0.0.1:8000/hello/YOUR_NAME>, then to
<http://127.0.0.1:8000/hello/> with nothing after the slash.

A browser tab doesn't show you the status code. `curl -i` does -- `-i`
includes the response headers, and the status line lives there:

```
curl -i http://127.0.0.1:8000/hello/YOUR_NAME
curl -i http://127.0.0.1:8000/hello/
```

Those two don't return the same status. Be ready to say why.

---

## Step 3 -- query a database

Ref: [SQL (Relational) Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)

We're using one shared, already-seeded Supabase project for this exercise.
The role is read-only, and it's for today only -- the homework has you
provision your own (locally -- see `DATABASE.md`).

Here's the table this route queries -- the shape, not the actual rows,
since finding those out is the point of the exercise below:

```sql
create table greetings (
  id serial primary key,
  message text not null
);
```

Set the connection string:

```
export DATABASE_URL="postgresql://server_demo_reader.awgxotrctbryykhnxwzu:cs5610-demo-database@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
```

Yes, that's a live credential sitting in a repo, and no, that's not how this
normally goes -- it's read-only, it's throwaway, it gets rotated, and it's in
here so you can spend the next 20 minutes on FastAPI instead of on Supabase
signup. Your own project's credentials in the homework do **not** get this
treatment: they go in a `.env`, which is already in `.gitignore`.

**Restart the server now** (Ctrl-C, then `uvicorn main:app --reload` again)
-- before touching the code. `--reload` only ever sees new *code*; it has no
way to notice you exported a new environment variable in the terminal. If
you add the route below first and restart after, `--reload` auto-triggers
the instant you save and crashes with `KeyError: 'DATABASE_URL'`, because
it's still running inside the environment from before you set it. Restarting
now, with no code changes yet, means the *next* auto-reload (triggered when
you save the route below) inherits the variable from this already-restarted
process instead.

Add to `main.py`:

```python
import os
import psycopg2

DATABASE_URL = os.environ["DATABASE_URL"]

@app.get("/greetings")
def read_greetings():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, message FROM greetings ORDER BY id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": row[0], "message": row[1]} for row in rows]
```

Put the two `import` lines at the top of the file with the `fastapi` import,
not down beside the route.

No restart needed this time -- `--reload` picks up the save on its own, and
since you already restarted once with `DATABASE_URL` set, this reload
inherits it correctly.

Browse to <http://127.0.0.1:8000/greetings>, then check it with `curl`:

```
curl http://127.0.0.1:8000/greetings
```

If you get a `KeyError: 'DATABASE_URL'`, the export didn't reach the terminal.
Set it in the same shell you're running `uvicorn` from.
