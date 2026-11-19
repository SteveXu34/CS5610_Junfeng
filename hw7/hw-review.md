# hw-review

A study guide for the app you've built -- worked through on your own
code, so you can explain anyone's.

You've built a whole stack in four weeks: a FastAPI server, a database, a
React front end, and a login. This week there's nothing new to build. This
assignment is to understand how it works well enough so that you can
explain (in class) your app and an app you haven't seen.

## Learning objectives

* Describe each part of your stack by the job it does,
  so you can find the same job in someone else's code
* Verify by running something, not just by reading code
* Predict before you run, and learn from the predictions that were wrong
* Own what you submit, including what your agent decided for you

## How to use this study guide

Each section has four parts:

* The job: what has to happen, in plain words. Every app that has a
  login has to do these jobs; they just do them in different places and
  with different names.
* Be able to explain: what you should understand when you're done.
* Try it: run something on your app. Write your prediction before you run it. 
  Note, in particular, when the prediction is wrong.
* How else: another way an app could do the same job.

Your app won't match every name here. The guide says `get_db`, the proxy,
`current_user` -- if yours has no `get_db`, find what opens your database
connection instead. Same job, different name. If nothing in your app does
a job, that's worth knowing too.

## What to hand in

Same classroom50 repo as hw03-hw06. One new file, `REVIEW.md`, at the
root, in one PR. These are your study notes, with one section for each 
section below, and in each:

* **At least one link to a line in your repo.** On GitHub, open the file,
  click the line number, then press `y` -- the URL now points at that
  exact version of the line. 
* **At least one thing you ran**, with your prediction and what came back.
  Paste the output; trim it if it's long.
* **Your answer to "How else?"** -- a few sentences, no code.  Write what 
  you'd need as is you were studying for an exam.

---

## 1. One request, start to finish

**The job.** You're logged in and you reload the page. Something serves
the page. Something sends a request for the user. Something carries the
proof that you logged in. Something checks it. Something opens the
database, runs a query, and sends rows back. Something stores them in the
page's state, and the page draws them.

**Be able to explain**

* Which server answers the request for the *page*, and which answers the
  request for the *data* -- and whether that's one server or two
* The proxy: what it forwards, and why the browser never sees port 8000
* `/me`: why the page asks who you are, and when
* The session cookie: who sends it (you didn't write that code)
* `current_user`, `get_db`, the SQL query: what order they run in, and
  why the order matters
* `setState` and the render: why the gated rows need a second render

**Try it.** Reload with the Network tab open. Predict the requests, in
order, before you look. Then link each step of the trace to the line in
your app that does it.

**How else?** Pick two steps. Where else could an app do that job?
(Check the login in every route instead of one shared function? Open one
database connection for the whole app instead of one per request?)

## 2. Where's the gate?

**The job.** Something decides whether gated content leaves the server.
Something else decides what to show on the page. Only one of them is the
gate.

**Be able to explain**

* The line in React that decides whether gated content is displayed --
  and why that line isn't the gate
* The line on the server that keeps gated rows out of the public route
* "The page decides what to show; the server decides what to send"

**Try it.** `curl -i` your public route and your gated route, with no
cookie. Prediction first: if you deleted that line in React, who could
see the gated content?

**How else?** An app could send everything and let the page hide it,
or filter in SQL, or filter in Python after the query. Which of those is
a gate?

## 3. Three ways in

**The job.** Something has to tell a real session from a missing one, a
forged one, and a request that goes around your API entirely.

**Be able to explain**

* What's inside your session cookie, and who can read it
* Why changing one character makes it worthless -- and what someone
  would need to make one your server *accepts*
* Why way 3 below isn't stopped by anything in your code

**Try it.** For each, show the attempt, what came back, and the line or
setting that stops it:

1. No cookie at all
2. Your real cookie, with one character changed (log in with `curl -c
   jar.txt`, edit the cookie in `jar.txt`, retry with `-b jar.txt`)
3. Around your API entirely: Supabase's Data API
   (`curl "https://YOUR-PROJECT-REF.supabase.co/rest/v1/users?select=*" -H "apikey: YOUR-PUBLISHABLE-KEY"`).
   If your database is local Postgres, say who could reach it directly
   instead, and what would change if you moved it to Supabase.

**How else?** Your session lives in a signed cookie. Where else could an
app keep it -- and what would logout have to do then?

## 4. What's in your repo?

**The job.** Secrets have to reach the server without reaching git.

**Be able to explain**

* Which settings are secrets (`DATABASE_URL`'s password,
  `SESSION_SECRET`) and which aren't, and why the app reads them from the
  environment
* Why deleting a committed secret isn't enough
* Which is worse to leak: your `DATABASE_URL` or your `SESSION_SECRET`

**Try it.** Look for secrets -- in your files *and* in your history:

```
git ls-files
git log -p | grep -E 'postgres(ql)?://[^ ]*:[^ @]*@|\$2b\$|SESSION_SECRET='
```

Also read your own README as a stranger would.

* **Don't paste a secret into `REVIEW.md`.** Say which file and what kind
  of secret (a database password, a hash), not the value.
* If you find one, deleting it isn't enough -- it's still in your git
  history, and anyone can read that. **Change it first** (a new database
  password, a new `SESSION_SECRET`), then remove it. Say what you did.
* How do you know `env` isn't tracked? Show it.

**How else?** What would someone joining your team need, to run your app
without you sending them a secret in a chat message?

## 5. Break one thing

**The job.** Each line you wrote is there for a reason. The way to find
the reason is to take the line out.

**Be able to explain** what each of these lines is for -- in your app,
whatever it's called there.

**Try it.** Do at least three. For each: write your prediction, make the
change, say what actually happened and why, then put the line back.

* Remove `Depends(current_user)` from your gated route
* Remove `/login` from your Vite proxy
* Remove your `response.ok` check
* Change your case studies effect's dependency array to `[]`
* Put `get_db` before `current_user` in your gated route, stop your
  database, and curl the gated route with no cookie

If a change doesn't fit your app -- say, your proxy forwards an `/api`
prefix, or you have no `get_db` -- make the closest change that breaks the
same thing, and say what you changed instead.

After each change, run your tests. Did any test catch it? If none did,
say what test would have -- and if you write it, that's its own PR.

**How else?** For one of your changes: which would a user notice? An
attacker? Neither?

## 6. What did your agent decide?

**The job.** Every app is full of choices. Some were yours; some your
agent made without asking.

**Be able to explain** three things in your app that your agent chose and
you didn't ask for -- a library, a file structure, a default, a test, a
name. At least one must be in your login code.

**Try it.** For each: what it chose, what else it could have chosen, and
whether you'd keep it, and why.

**How else?** This *is* the "how else" section. In class, the app you
haven't seen made different choices. Be ready to spot them.

## 7. The study guide, against your app

Go through the **hw05-react** and **hw06-auth** sections of
[`study-guide.md`](../study-guide.md). For each item, write the number of
the section above where you covered it. List the items you can't connect
to your app at all -- one sentence each on why. Bring that list to class.

---

## In class

Bring your app running -- server, database, and React. You'll use what
you learned here two ways, with `REVIEW.md` closed:

* **On your app.** Answer one of sections 1-6, live. You won't know which.
* **On an app you haven't seen.** Same features, someone else's code.
  Explain what a part of it does, then show where yours does the same
  job, and how it differs.

The "How else?" answers are your preparation for the second one.

## How you used AI

At the end of `REVIEW.md`, as usual. An agent can write a `REVIEW.md`. It
can't answer for you in class, with the file closed -- so use it to help
you understand, not to write your notes.

## LLM policy

Standard policy:

* Don't trust, verify.
* Own what you submit.

## Submit

* The PR with `REVIEW.md`, merged or not.
* Bring your app running to class.
