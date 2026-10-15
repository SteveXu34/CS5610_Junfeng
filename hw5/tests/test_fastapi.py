from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

# Define a root path for importing files from the hw03 directory.

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
# Create a testClient object to simulate the frontend to send the request for testing.

def test_read_root():
    response = client.get("/")
    # Get the response from main.py with the path("/"): .
    assert response.status_code == 200
    # If response.status_code is 200, the request was successful.
    assert response.json() == {"message": "Hello, FastAPI"}
    # Compare the content from response which has been transferred to be a json file.


def test_read_name():
    response = client.get("/hello/Junfeng")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, Junfeng"}
    # Compare the content from response which has been transferred to be a json file.

def test_read_greeting():
    response = client.get("/greetings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["message"] == "Hello from Supabase"
    assert data[1]["message"] == "Row two"
    assert data[2]["message"] == "Row three"


def test_read_products():
    response = client.get("/products")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 3
    assert data[0]["name"] == "Rocket Skates"
    assert data[1]["name"] == "Portable Hole"
    assert data[2]["name"] == "Giant Magnet"


def test_read_case_studies():
    response = client.get("/case-studies")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "First case study (the title)"
    assert data[0]["gated"] is False
    assert data[1]["title"] == "My second case study"
    assert data[1]["gated"] is True


def test_read_team_members():
    response = client.get("/team-members")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    assert data[0]["name"] == "Bugs Bunny"
    assert data[1]["bio1"] == "Daffy is the most enthusiastic person in any room he enters, which is saying something given that he tends to enter rooms at full volume. As VP of Sales he brings boundless energy, an iron will, and a closing rate that is statistically improbable."
    assert data[4]["image"] == "/Material/coyote.webp"