"""EcoCivX - Main FastAPI Application.

This module initializes the FastAPI service, configures CORS,
registers API route blueprints, mounts static assets, and serves
the single-page dashboard frontend.
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.models import HealthResponse
from app.routes.environmental import router as environmental_router
from app.routes.issues import router as issues_router

# Locate directories relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

app = FastAPI(
    title="EcoCivX API",
    description=(
        "Environmental Monitoring and Civic Issue Reporting Platform. "
        "Built with FastAPI, HTML5, CSS3, and Vanilla JavaScript."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local testing and open integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(issues_router)
app.include_router(environmental_router)


# Health check endpoint
@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def health_check() -> HealthResponse:
    """Return system status, service version, and operating mode."""
    return HealthResponse()


# Ensure static directory exists before mounting
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Serve the main frontend page
@app.get("/", tags=["Frontend"])
def serve_index() -> FileResponse:
    """Serve the single-page EcoCivX dashboard frontend."""
    index_file = TEMPLATES_DIR / "index.html"
    return FileResponse(index_file)
