"""EcoCivX - Civic Issue Reporting Endpoints.

Handles creating, querying, and confirming civic reports (garbage, potholes,
waterlogging, pollution) submitted by citizens.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.data import store
from app.models import (
    IssueCategory,
    IssueCreate,
    IssueResponse,
    IssueStatus,
)

router = APIRouter(prefix="/api/issues", tags=["Civic Issues"])


@router.get("", response_model=list[IssueResponse])
def list_issues(
    category: Optional[IssueCategory] = Query(
        default=None,
        description="Filter issues by category (e.g. garbage, pothole, waterlogging, pollution)"
    ),
    status: Optional[IssueStatus] = Query(
        default=None,
        description="Filter issues by status (pending, investigating, resolved)"
    ),
) -> list[IssueResponse]:
    """List all reported civic issues, sorted newest first, with optional filtering."""
    return store.list_issues(category=category, status=status)


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def report_issue(payload: IssueCreate) -> IssueResponse:
    """Submit a new civic problem report.

    Validates inputs (title, category, severity, description, location)
    and stores in the active session store.
    """
    return store.add_issue(payload)


@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: str) -> IssueResponse:
    """Retrieve details of an individual civic report by ID."""
    issue = store.get_issue(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Civic report with ID '{issue_id}' was not found.",
        )
    return issue


@router.post("/{issue_id}/upvote", response_model=IssueResponse)
def upvote_issue(issue_id: str) -> IssueResponse:
    """Confirm / upvote an issue to signal community corroboration."""
    updated = store.upvote_issue(issue_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Civic report with ID '{issue_id}' was not found.",
        )
    return updated
