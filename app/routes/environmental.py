"""EcoCivX - Environmental Telemetry Endpoints.

Provides environmental indicators and air quality breakdown.
All responses explicitly flag that data is simulated demo data
until live sensor APIs are integrated.
"""

from fastapi import APIRouter
from app.data import get_air_quality_data, get_environmental_overview
from app.models import AirQualityResponse, EnvironmentalOverview

router = APIRouter(prefix="/api/environmental", tags=["Environmental"])


@router.get("/overview", response_model=EnvironmentalOverview)
def read_overview() -> EnvironmentalOverview:
    """Retrieve high-level environmental snapshot (canopy, cleanliness, AQI).

    Returns simulated metrics clearly marked with `is_demo_data: true`.
    """
    return get_environmental_overview()


@router.get("/air-quality", response_model=AirQualityResponse)
def read_air_quality() -> AirQualityResponse:
    """Retrieve detailed air pollution metrics (PM2.5, PM10, NO2, O3, CO).

    Returns simulated metrics clearly marked with `is_demo_data: true`.
    """
    return get_air_quality_data()
