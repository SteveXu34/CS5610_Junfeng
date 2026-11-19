# DATABASE

Your own Postgres server running on your own machine. Your 
`DATABASE_URL` will point to it.

## 1. Initialize a data directory

Do this once.

```
initdb -D pgdata
```

`pgdata/` is your database's actual files. It's already in `.gitignore`.

## 2. Start the server

```
pg_ctl -D pgdata -l pgdata.log start
```

Leave it running. It's a background process, not something tied to one
terminal window. `pg_ctl -D pgdata stop` shuts it down when you're done for
the day; `pg_ctl -D pgdata status` tells you if it's already running.

## 3. Create a database and connect to it

```
createdb hwserver
psql hwserver
```

If `psql hwserver` drops you into a `hwserver=#` prompt, it worked. Type
`\q` now to exit back to your shell. The next step runs a shell command,
not SQL.

## 4. Create the same table from Wednesday, and seed it

`seed.sql` is right here in this repo. The exact schema and rows from
Wednesday's exercise. Run it against your new database:

```
psql hwserver -f seed.sql
```

## 5. Confirm it against a known answer

`psql hwserver -f seed.sql` exits back to your shell as soon as it's done.
Reconnect to run a query:

```
psql hwserver
```

```sql
select * from greetings order by id;
```

You should get exactly three rows, id 1 through 3, matching the `insert`
above. If you see that, your local database is set up correctly. 

`\q` to leave `psql`.

## 6. Point your app at it

```
export DATABASE_URL="postgresql://localhost:5432/hwserver"
```

No authentication or password needed. A local connection over `localhost`
doesn't require them. This is the line that replaces the in-class Supabase
connection string in your own `main.py`.

## 7. Make it yours

`greetings` was just a warm-up. The homework needs your backend serving something 
from your own `hw-client`: Blog posts, Case Studies, Team members, whatever you built.

Add a table for one of those to `seed.sql`. Use the same pattern as `greetings`,
different columns for whatever fields your content actually has. Then,
rather than re-running the whole file (the existing `create table
greetings` would fail the second time. It's already there), just paste
your new `create table` and `insert` statements directly at the `psql` prompt:

```
psql hwserver
```

Then export it and commit the result. A `pgdata/` directory is binary,
huge, and not portable across machines, but a `pg_dump` of one table is
plain text, small, and readable directly on GitHub without anyone needing
to start a server against your database:

```
pg_dump --table=your_table_name hwserver > your_table_name.sql
```

Replace `your_table_name` with whatever you actually called it, in both
places, then commit the resulting `.sql` file.

## If you get stuck

* `initdb: error: directory "pgdata" exists but is not empty` -- you already
  ran step 1. Skip to step 2, or `rm -rf pgdata` first if you want a clean restart.
* `pg_ctl: another server might be running` -- it's already started; go to step 3.
* `psql: error: connection to server ... failed` -- the server isn't running. Go back to step 2.
* Anything else: post (in Teams) the exact command and the exact error text.
