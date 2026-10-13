"""EcoCivX - Data Models and Validation Schemas.

This module defines Pydantic models used to validate incoming civic reports,
structure responses, and represent environmental metric summaries.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class IssueCategory(str, Enum):
    """Supported categories for civic issue reporting."""
    GARBAGE = "garbage"
    POTHOLE = "pothole"
    WATERLOGGING = "waterlogging"
    POLLUTION = "pollution"
    OTHER = "other"


class IssueSeverity(str, Enum):
    """Urgency level of a reported issue."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueStatus(str, Enum):
    """Workflow state of a reported issue."""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"


class IssueCreate(BaseModel):
    """Input payload sent when a user submits a new civic report."""
    title: str = Field(
        ...,
        min_length=3,
        max_length=120,
        description="Concise headline describing the civic issue"
    )
    category: IssueCategory = Field(
        ...,
        description="Category classification of the civic issue"
    )
    severity: IssueSeverity = Field(
        default=IssueSeverity.MEDIUM,
        description="Perceived urgency level"
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=1500,
        description="Detailed description of what was observed"
    )
    location: str = Field(
        ...,
        min_length=3,
        max_length=160,
        description="Area, landmark, street name, or neighborhood"
    )
    reporter_name: Optional[str] = Field(
        default=None,
        max_length=80,
        description="Optional citizen name or pseudonym"
    )
    latitude: Optional[float] = Field(
        default=None,
        ge=-90.0,
        le=90.0,
        description="Optional GPS latitude (-90 to 90)"
    )
    longitude: Optional[float] = Field(
        default=None,
        ge=-180.0,
        le=180.0,
        description="Optional GPS longitude (-180 to 180)"
    )

    @field_validator("title", "description", "location")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        """Strip surrounding whitespace and ensure field is not only spaces."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or contain only whitespace.")
        return cleaned


class IssueResponse(IssueCreate):
    """Output schema returned when retrieving issue reports."""
    id: str = Field(..., description="Unique alphanumeric identifier")
    created_at: datetime = Field(..., description="Timestamp when report was recorded")
    status: IssueStatus = Field(default=IssueStatus.PENDING, description="Current workflow state")
    confirmations: int = Field(default=1, description="Number of citizens confirming this issue")
    is_demo_entry: bool = Field(
        default=False,
        description="Flag indicating if this is seed/demo data"
    )


class HealthResponse(BaseModel):
    """Response returned by the /api/health endpoint."""
    status: str = "ok"
    app: str = "EcoCivX"
    version: str = "0.1.0"
    mode: str = "prototype"
    storage: str = "in-memory (database integration ready)"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AirQualityMetric(BaseModel):
    """Individual pollutant metric for the air quality section."""
    parameter: str
    value: float
    unit: str
    status: str
    description: str


class AirQualityResponse(BaseModel):
    """Payload for the air quality monitoring section."""
    is_demo_data: bool = True
    disclaimer: str
    city_name: str
    aqi_index: int
    aqi_status: str
    primary_pollutant: str
    metrics: list[AirQualityMetric]
    sensor_station: str
    last_updated: datetime


class EnvironmentalOverview(BaseModel):
    """Dashboard summary metrics."""
    is_demo_data: bool = True
    disclaimer: str
    city_name: str
    overall_aqi: int
    aqi_category: str
    tree_canopy_coverage_pct: float
    waterbody_cleanliness_score: int
    waste_collection_efficiency_pct: float
    active_civic_reports_count: int
    last_updated: datetime
