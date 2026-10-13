"""EcoCivX - In-Memory Store & Simulated Environmental Telemetry.

NOTE ON DATA INTEGRITY & PERSISTENCE:
- Civic reports in this prototype are maintained in-memory for the running session.
  They will reset if the server restarts until a persistent database (PostgreSQL/SQLite) is wired up.
- All environmental metrics (Air Quality, Canopy, Cleanliness) are clearly labeled
  as simulated sample data. Live sensor feeds (e.g. OpenAQ, CPCB, Sentinel satellites)
  are not connected in this prototype milestone.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from app.models import (
    AirQualityMetric,
    AirQualityResponse,
    EnvironmentalOverview,
    IssueCategory,
    IssueCreate,
    IssueResponse,
    IssueSeverity,
    IssueStatus,
)

# Standard disclaimer used across environmental telemetry
DEMO_DATA_DISCLAIMER = (
    "DEMO / SIMULATION DATA: Live environmental sensors and satellite telemetry "
    "are not connected in this prototype. Metrics shown are curated sample values "
    "for dashboard design and workflow demonstration only."
)

# Seed issues to populate the dashboard initial view with realistic examples
INITIAL_SEED_ISSUES: list[IssueResponse] = [
    IssueResponse(
        id="rep-101",
        title="Overflowing communal dumpsters near central market",
        category=IssueCategory.GARBAGE,
        severity=IssueSeverity.HIGH,
        description="Waste bins behind the fresh produce market have been overflowing for 48 hours, blocking pedestrian passage and attracting stray animals.",
        location="Greenfield Market Square, Sector 3",
        reporter_name="Aarav Sharma",
        latitude=12.9716,
        longitude=77.5946,
        created_at=datetime.now(timezone.utc),
        status=IssueStatus.INVESTIGATING,
        confirmations=14,
        is_demo_entry=True,
    ),
    IssueResponse(
        id="rep-102",
        title="Severe pothole cluster causing vehicle bottoming-out",
        category=IssueCategory.POTHOLE,
        severity=IssueSeverity.CRITICAL,
        description="A series of three deep potholes on the westbound carriageway right after the underpass. Two two-wheelers skidded earlier today.",
        location="Outer Ring Bypass, Km Stone 14",
        reporter_name="Priya Patel",
        latitude=12.9352,
        longitude=77.6245,
        created_at=datetime.now(timezone.utc),
        status=IssueStatus.PENDING,
        confirmations=28,
        is_demo_entry=True,
    ),
    IssueResponse(
        id="rep-103",
        title="Stagnant monsoon waterlogging across school lane",
        category=IssueCategory.WATERLOGGING,
        severity=IssueSeverity.MEDIUM,
        description="Stormwater drain clogged with plastic debris, leaving 8 inches of standing water outside Government Primary School gate.",
        location="School Road, Ward 12",
        reporter_name="Citizen Action Club",
        latitude=12.9249,
        longitude=77.5834,
        created_at=datetime.now(timezone.utc),
        status=IssueStatus.PENDING,
        confirmations=9,
        is_demo_entry=True,
    ),
    IssueResponse(
        id="rep-104",
        title="Visible particulate smoke from localized plastic waste burn",
        category=IssueCategory.POLLUTION,
        severity=IssueSeverity.HIGH,
        description="Thick acrid black smoke observed near vacant industrial perimeter. Pungent chemical odor impacting adjacent residential apartments.",
        location="Eco-Tech Industrial Strip, Sector 7",
        reporter_name="Dr. K. Nair",
        latitude=12.9856,
        longitude=77.6057,
        created_at=datetime.now(timezone.utc),
        status=IssueStatus.INVESTIGATING,
        confirmations=19,
        is_demo_entry=True,
    ),
]


class CivicStore:
    """In-memory data store for the prototype milestone.

    Designed with standard CRUD methods so swapping in SQLAlchemy / Tortoise ORM
    later requires minimal router modification.
    """

    def __init__(self) -> None:
        self._issues: list[IssueResponse] = []
        self.reset()

    def reset(self) -> None:
        """Reset the store with fresh copies of seed issues."""
        self._issues = [issue.model_copy() for issue in INITIAL_SEED_ISSUES]

    def list_issues(
        self,
        category: Optional[IssueCategory] = None,
        status: Optional[IssueStatus] = None,
    ) -> list[IssueResponse]:
        """Return issues filtered by category or status if provided."""
        results = self._issues
        if category:
            results = [i for i in results if i.category == category]
        if status:
            results = [i for i in results if i.status == status]
        return sorted(results, key=lambda x: x.created_at, reverse=True)

    def get_issue(self, issue_id: str) -> Optional[IssueResponse]:
        """Find an issue by its ID."""
        for issue in self._issues:
            if issue.id == issue_id:
                return issue
        return None

    def add_issue(self, payload: IssueCreate) -> IssueResponse:
        """Create and store a new user report."""
        new_id = f"rep-{uuid.uuid4().hex[:6]}"
        record = IssueResponse(
            id=new_id,
            created_at=datetime.now(timezone.utc),
            status=IssueStatus.PENDING,
            confirmations=1,
            is_demo_entry=False,
            **payload.model_dump(),
        )
        self._issues.insert(0, record)
        return record

    def upvote_issue(self, issue_id: str) -> Optional[IssueResponse]:
        """Increment community confirmation count for an existing issue."""
        issue = self.get_issue(issue_id)
        if issue:
            issue.confirmations += 1
            return issue
        return None

    def count_active(self) -> int:
        """Count active unresolved issues."""
        return sum(1 for i in self._issues if i.status != IssueStatus.RESOLVED)


# Global singleton instance
store = CivicStore()


def get_environmental_overview() -> EnvironmentalOverview:
    """Generate environmental summary metrics tagged with demo disclaimers."""
    return EnvironmentalOverview(
        is_demo_data=True,
        disclaimer=DEMO_DATA_DISCLAIMER,
        city_name="Metro Eco-District (Demo Canvas)",
        overall_aqi=112,
        aqi_category="Moderate (Sample)",
        tree_canopy_coverage_pct=28.4,
        waterbody_cleanliness_score=64,
        waste_collection_efficiency_pct=81.2,
        active_civic_reports_count=store.count_active(),
        last_updated=datetime.now(timezone.utc),
    )


def get_air_quality_data() -> AirQualityResponse:
    """Generate detailed air quality parameters tagged with demo disclaimers."""
    return AirQualityResponse(
        is_demo_data=True,
        disclaimer=DEMO_DATA_DISCLAIMER,
        city_name="Metro Eco-District (Demo Canvas)",
        aqi_index=112,
        aqi_status="Moderate",
        primary_pollutant="PM2.5",
        sensor_station="Station-04 Simulated Ambient Monitor",
        last_updated=datetime.now(timezone.utc),
        metrics=[
            AirQualityMetric(
                parameter="PM2.5",
                value=41.8,
                unit="µg/m³",
                status="Moderate",
                description="Fine inhalable particles, diameter 2.5 micrometers or smaller.",
            ),
            AirQualityMetric(
                parameter="PM10",
                value=82.4,
                unit="µg/m³",
                status="Moderate",
                description="Inhalable coarse particles like road dust and construction pollen.",
            ),
            AirQualityMetric(
                parameter="NO2",
                value=24.1,
                unit="ppb",
                status="Good",
                description="Nitrogen Dioxide from vehicular combustion emissions.",
            ),
            AirQualityMetric(
                parameter="O3",
                value=32.0,
                unit="ppb",
                status="Good",
                description="Ground-level ozone formed by photochemical sunlight reactions.",
            ),
            AirQualityMetric(
                parameter="CO",
                value=0.7,
                unit="ppm",
                status="Good",
                description="Carbon Monoxide from incomplete organic combustion.",
            ),
        ],
    )
