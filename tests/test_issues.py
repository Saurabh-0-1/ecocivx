"""Tests for civic issue creation, listing, filtering, and validation."""

import pytest
from fastapi.testclient import TestClient
from app.data import store
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_in_memory_store():
    """Reset store before each test run so state does not leak between tests."""
    store.reset()
    yield
    store.reset()


def test_list_issues_default():
    """Ensure GET /api/issues returns initial seed reports."""
    response = client.get("/api/issues")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4


def test_filter_issues_by_category():
    """Test filtering issues by category query parameter."""
    response = client.get("/api/issues?category=garbage")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for item in data:
        assert item["category"] == "garbage"


def test_create_valid_issue():
    """Verify that a properly structured report is created with 201 Created."""
    payload = {
        "title": "Severe road cavity near central library",
        "category": "pothole",
        "severity": "high",
        "description": "Deep asphalt crater measuring roughly 2 feet wide on the bicycle lane.",
        "location": "Library Avenue, Cross Road 3",
        "reporter_name": "Kavita Rao",
        "latitude": 12.9716,
        "longitude": 77.5946,
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 201
    created = response.json()

    assert created["id"].startswith("rep-")
    assert created["title"] == payload["title"]
    assert created["category"] == "pothole"
    assert created["severity"] == "high"
    assert created["status"] == "pending"
    assert created["confirmations"] == 1
    assert created["is_demo_entry"] is False
    assert created["reporter_name"] == "Kavita Rao"


def test_create_anonymous_issue_without_coordinates():
    """Verify that optional fields like reporter_name and GPS coordinates can be omitted."""
    payload = {
        "title": "Uncollected trash bins behind metro depot",
        "category": "garbage",
        "severity": "medium",
        "description": "Commercial waste has accumulated over the past three days.",
        "location": "Metro Line 2 Depot Gate",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["reporter_name"] is None
    assert created["latitude"] is None
    assert created["longitude"] is None


def test_create_issue_validation_short_title():
    """Ensure title under 3 characters triggers 422 Unprocessable Entity."""
    payload = {
        "title": "ab",
        "category": "garbage",
        "severity": "low",
        "description": "Detailed description of the problem for testing.",
        "location": "Sample Street 12",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_create_issue_validation_short_description():
    """Ensure description under 10 characters triggers 422."""
    payload = {
        "title": "Valid title headline",
        "category": "garbage",
        "severity": "low",
        "description": "Too short",
        "location": "Sample Street 12",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_create_issue_validation_invalid_category():
    """Ensure invalid category string triggers 422."""
    payload = {
        "title": "Valid title headline",
        "category": "alien_invasion",
        "severity": "low",
        "description": "Detailed description exceeding ten characters.",
        "location": "Sample Street 12",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_create_issue_validation_invalid_coordinates():
    """Ensure invalid latitude/longitude triggers 422."""
    payload = {
        "title": "Valid title headline",
        "category": "waterlogging",
        "severity": "high",
        "description": "Detailed description exceeding ten characters.",
        "location": "Sample Street 12",
        "latitude": 999.0,  # Invalid latitude
        "longitude": 77.0,
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_create_issue_validation_whitespace_only():
    """Ensure title consisting purely of whitespace triggers 422."""
    payload = {
        "title": "     ",
        "category": "waterlogging",
        "severity": "high",
        "description": "Detailed description exceeding ten characters.",
        "location": "Sample Street 12",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_get_issue_by_id():
    """Verify retrieving individual issue by valid ID and 404 for invalid ID."""
    # Seed issue
    response = client.get("/api/issues/rep-101")
    assert response.status_code == 200
    assert response.json()["id"] == "rep-101"

    # Nonexistent
    missing_response = client.get("/api/issues/rep-nonexistent-999")
    assert missing_response.status_code == 404


def test_upvote_issue():
    """Verify confirming/upvoting an issue increments count."""
    initial_res = client.get("/api/issues/rep-101")
    assert initial_res.status_code == 200
    initial_count = initial_res.json()["confirmations"]

    upvote_res = client.post("/api/issues/rep-101/upvote")
    assert upvote_res.status_code == 200
    assert upvote_res.json()["confirmations"] == initial_count + 1

    # 404 for upvoting missing issue
    missing_res = client.post("/api/issues/rep-missing/upvote")
    assert missing_res.status_code == 404
