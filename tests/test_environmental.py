"""Tests for environmental overview and air quality endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_environmental_overview_endpoint():
    """Verify environmental overview returns realistic demo metrics with disclaimers."""
    response = client.get("/api/environmental/overview")
    assert response.status_code == 200
    data = response.json()

    # Explicit demo demarcation checks
    assert data["is_demo_data"] is True
    assert "DEMO" in data["disclaimer"]
    assert "disclaimer" in data

    # Core indicator metrics
    assert "overall_aqi" in data
    assert data["overall_aqi"] > 0
    assert 0 <= data["tree_canopy_coverage_pct"] <= 100
    assert 0 <= data["waterbody_cleanliness_score"] <= 100
    assert 0 <= data["waste_collection_efficiency_pct"] <= 100
    assert data["active_civic_reports_count"] >= 0


def test_air_quality_endpoint():
    """Verify air quality breakdown returns pollutants with demo tags."""
    response = client.get("/api/environmental/air-quality")
    assert response.status_code == 200
    data = response.json()

    assert data["is_demo_data"] is True
    assert "disclaimer" in data
    assert "metrics" in data
    assert len(data["metrics"]) >= 5

    parameters = [m["parameter"] for m in data["metrics"]]
    assert "PM2.5" in parameters
    assert "PM10" in parameters
    assert "NO2" in parameters
    assert "O3" in parameters
    assert "CO" in parameters
