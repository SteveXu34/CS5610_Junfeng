# hw-stack

Deploy your FastAPI backend and your own Supabase database, not just `localhost`.

## Learning objectives

* Deploying a real backend, not just a static site
* Where production differs from your local setup
* Debugging from the actual error message/log, not guesswork

## Assignment

From this assignment on, repo changes go through PRs -- direct commits to
`main` are no longer allowed.

Develop in the classroom50 repo that you used for hw03-server. Roughly one
PR per item below, but use your judgment -- a good PR is scoped for
review, not an AI-slop dump of everything at once:

1. Add tests (`pytest`).
2. Connect `hw-client` to `hw-server` -- swap a local array for `fetch()`.
3. Create your own Supabase database, seed it with the tables you built for
   hw03-server, and confirm your app still works locally against it.
4. Deploy to Vercel.
   * There's nothing to diff for the act of deploying itself -- this PR is
     the structural changes that make deployment possible
     (`requirements.txt`, `main.py` at the repo root, `DATABASE_URL`
     pointed at Supabase).
5. Verify against the real, public URL.
6. Describe (briefly, in your README.md) how you used AI for the assignment.

## LLM policy

Standard policy:

* Don't trust, verify.
* Own what you submit.

## Submit

* Submit that URL in Canvas when you're done.
* Push your progress to the classroom50 repo.
* Be ready to show your deployed app working and explain any line of code.
