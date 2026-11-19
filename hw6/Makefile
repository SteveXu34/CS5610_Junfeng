.PHONY: setup test

PYTHON = .venv/bin/python

# Create virtual environment and install dependencies
setup:
	python3 -m venv .venv
	$(PYTHON) -m pip install -r requirements.txt

# Run pytest
test:
	@test -f environment.env || (echo "Missing environment.env. Configure DATABASE_URL first." && exit 1)
	@set -a; . ./environment.env; set +a; \
	$(PYTHON) -m pytest -v