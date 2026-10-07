.PHONY: run test curl

# Start the dev server. --reload restarts on code changes (but NOT on
# environment changes -- a new DATABASE_URL needs a real restart).
run:
	uvicorn main:app --reload

test:
	pytest

# Quick manual sanity check -- "does this endpoint even respond right now?"
# Requires `make run` already going in another terminal. Update these as you
# add routes.
curl:
	curl http://127.0.0.1:8000/; echo
	curl http://127.0.0.1:8000/hello/world; echo
	curl http://127.0.0.1:8000/greetings; echo
