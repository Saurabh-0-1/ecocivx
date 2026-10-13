# 🌱 EcoCivX

**EcoCivX** is a modern, full-stack environmental monitoring and civic problem reporting prototype. It empowers community members to report local hazards—such as garbage accumulation, hazardous potholes, monsoon waterlogging, and localized air/noise pollution—while monitoring urban environmental vitals.

---

## 🚀 Key Highlights & Architecture

- **Frontend**: Responsive single-page application built with semantic HTML5, modern vanilla CSS3 (deep forest green theme with lime accents), and vanilla JavaScript.
- **Backend**: Asynchronous Python API powered by **FastAPI** with automatic OpenAPI documentation.
- **Validation**: Strict schema validation using **Pydantic v2** on both client and server sides.
- **Automated Testing**: 100% passing test suite using **pytest** and FastAPI `TestClient`.
- **Honest Data Demarcation**: Sample/simulated indicators (such as air quality and canopy indexes) and session-based report storage are clearly communicated to users with visual status indicators.
- **Deployment Ready**: Standardized configuration ready for deployment on Render, Fly.io, or Railway.

---

## 📁 Project Structure

```text
ecocivx-project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization, static file mounting, health check, root route
│   ├── models.py            # Pydantic schemas for data validation and API response contracts
│   ├── data.py              # In-memory session store, seed reports, and simulated environmental data
│   └── routes/
│       ├── __init__.py
│       ├── issues.py        # REST endpoints for creating, listing, filtering, and confirming civic reports
│       └── environmental.py # Endpoints providing environmental vitals and air quality telemetry
├── static/
│   ├── css/
│   │   └── style.css        # Responsive CSS design system (forest green, glassmorphism, radar animations)
│   └── js/
│       └── app.js          # Client-side UI logic, form validation, filter interactions, map radar simulation
├── templates/
│   └── index.html           # Accessible, semantic dashboard HTML template
├── tests/
│   ├── __init__.py
│   ├── test_health.py       # Tests for /api/health and HTML index serving
│   ├── test_environmental.py# Tests for environmental metrics and demo data disclaimers
│   └── test_issues.py       # Tests for report creation, field validation, filtering, and upvoting
├── requirements.txt         # Production and development dependencies
├── .gitignore               # Standard Python cache and environment ignore rules
└── README.md                # Project overview, setup, and file guides
```

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- Python 3.10+ (Tested with Python 3.13)
- pip

### 2. Install Dependencies
In your terminal, navigate to the project directory and install the required packages:

```bash
pip install -r requirements.txt
```

### 3. Run the Automated Tests
Verify that the API and input validation rules are functioning properly:

```bash
python -m pytest -v
```

All 15 tests should pass.

### 4. Start the Local Development Server
Launch the FastAPI application with `uvicorn`:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Access the Platform
- **EcoCivX Dashboard**: Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your web browser.
- **Interactive Swagger API Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- **Alternative ReDoc API Docs**: Open [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc).
- **Health Check Endpoint**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the EcoCivX single-page application dashboard |
| `GET` | `/api/health` | Health check endpoint returning service status and metadata |
| `GET` | `/api/environmental/overview` | Returns urban environmental indicators (canopy, cleanliness, AQI) |
| `GET` | `/api/environmental/air-quality` | Returns detailed pollutant telemetry (PM2.5, PM10, NO2, O3, CO) |
| `GET` | `/api/issues` | Retrieves all reports (supports `?category=` and `?status=` filters) |
| `POST` | `/api/issues` | Submits a new validated civic report (status: 201 Created) |
| `GET` | `/api/issues/{id}` | Retrieves details for an individual report |
| `POST` | `/api/issues/{id}/upvote` | Confirms/upvotes a report to signal community corroboration |

---

## ☁️ Deployment on Render (Web Service)

To deploy on Render:
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), choose **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the runtime parameters:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Render will automatically build and serve the application.
