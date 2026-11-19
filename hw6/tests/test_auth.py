
import bcrypt
import pytest

from fastapi.testclient import TestClient
import main


# Use a dedicated test password.
# Never use real account credentials in source code.
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test-password-123"


class FakeCursor:
    # Simulate the database cursor used by the login endpoint.
    def __init__(self, password_hash):
        self.password_hash = password_hash
        self.email = None

    def close(self):
        # Simulate closing the database cursor.
        pass
    def execute(self, query, params=None):
        # Login queries include parameters; gated queries do not.
        if params is not None:
            self.email = params[0]

    def fetchone(self):
        # Simulate an existing user or an unknown email.
        if self.email == TEST_EMAIL:
            return (TEST_EMAIL, self.password_hash)
        return None

    def fetchall(self):
        # Simulate the gated case study database result.
        return [
            (
                2,
                "My second case study",
                "This case study requires prior approval.",
                "second_one.html",
                True
            )
        ]

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False


class FakeConnection:
    def __init__(self, password_hash):
        self.password_hash = password_hash

    def close(self):
    # Simulate closing the database connection.
        pass

    def cursor(self):
        return FakeCursor(self.password_hash)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False


@pytest.fixture
def auth_client(monkeypatch):
    # Generate a bcrypt hash for the test password.
    password_hash = bcrypt.hashpw(
        TEST_PASSWORD.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Replace PostgreSQL connections with fake test connections.
    monkeypatch.setattr(
        main.psycopg2,
        "connect",
        lambda database_url: FakeConnection(password_hash)
    )

    # Use a fresh client for every test.
    # Each client maintains its own session cookies.
    with TestClient(main.app) as client:
        yield client


def test_gated_route_requires_login(auth_client):
    # An unauthenticated request must be rejected.
    response = auth_client.get("/case-studies/gated")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_gated_route_after_login(auth_client):
    # Log in with valid test credentials.
    login_response = auth_client.post(
        "/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )

    assert login_response.status_code == 200

    # The client automatically sends its session cookie.
    response = auth_client.get("/case-studies/gated")

    assert response.status_code == 200
    assert response.json()[0]["gated"] is True


def test_gated_route_after_logout(auth_client):
    # First, log in.
    auth_client.post(
        "/login",
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )

    # Then log out.
    logout_response = auth_client.post("/logout")

    assert logout_response.status_code == 200

    # The protected route should reject the request again.
    response = auth_client.get("/case-studies/gated")

    assert response.status_code == 401


def test_invalid_login_responses_match(auth_client):
    # Test an existing email with an incorrect password.
    wrong_password = auth_client.post(
        "/login",
        json={
            "email": TEST_EMAIL,
            "password": "wrong-password"
        }
    )

    # Test an email that does not exist.
    unknown_email = auth_client.post(
        "/login",
        json={
            "email": "unknown@example.com",
            "password": TEST_PASSWORD
        }
    )

    # Both failures must return exactly the same response.
    assert wrong_password.status_code == 401
    assert unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()
