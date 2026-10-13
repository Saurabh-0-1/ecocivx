"""Tests for system health check and frontend index serving."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify that /api/health returns 200 OK with expected service metadata."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "EcoCivX"
    assert data["version"] == "0.1.0"
    assert "mode" in data
    assert "storage" in data
    assert "timestamp" in data


def test_index_serves_html():
    """Verify that GET / serves the dashboard HTML file."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "EcoCivX" in response.text
    assert "Citizen-Powered Environmental Intelligence" in response.text
