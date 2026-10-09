.PHONY: setup test

PYTHON = ../.venv/bin/python

# Install dependencies
setup:
	python3 -m venv ../.venv
	$(PYTHON) -m pip install -r requirements.txt

# Run tests with Supabase DATABASE_URL
test:
	@set -a; . ./environment.env; set +a; \
	$(PYTHON) -m pytest -v