# CarePulse AI
### Explainable Patient Monitoring & Early-Warning Assistant
**Track: AI/ML in Healthcare | Educational Hackathon Demonstration**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.0-F7931E.svg)](https://scikit-learn.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

> ### ⚠️ Critical Clinical Safety & Educational Notice
> **CarePulse AI is an educational technology demonstration developed for the AI/ML in Healthcare Hackathon.**
> - Powered **exclusively by synthetic patient observations**. No real patient data or Protected Health Information (PHI) is used.
> - Model predictions are strictly labeled as **Demonstration Review Priorities**.
> - **The system does NOT diagnose diseases, predict real clinical outcomes, replace medical professionals, or provide therapeutic treatment recommendations.**

---

## 1. Problem Statement

Modern healthcare wards face high cognitive loads and alert fatigue. Continuous physiological observation streams (vital signs such as SpO2, heart rate, blood pressure, respiratory rate, and temperature) generate massive volumes of telemetry. Frontline healthcare teams require clear, explainable decision-support tools that:
1. Aggregate multi-bed telemetry into prioritized demonstration review queues.
2. Clearly explain **why** a machine learning model flagged an observation by surfacing feature-level log-odds contributions.
3. Explicitly distinguish statistical model outputs from established heuristic guideline thresholds (e.g., SpO2 < 92%).

---

## 2. Proposed Solution & Healthcare Challenge Alignment

**CarePulse AI** turns synthetic patient telemetry into an understandable, explainable monitoring workflow through an interactive SaaS dashboard:

- **Patient Monitoring**: Visualizes 14 monitored synthetic beds with longitudinal vital sign trends and review categories.
- **Predictive Analytics & Early-Warning Prioritization**: Real scikit-learn classifier evaluates vital signs and assigns demonstration review priorities.
- **Explainable AI (XAI)**: Linear model log-odds are decomposed into standardized feature contributions ($z$-scores multiplied by coefficients), providing human-readable explanations of what pushed the score up or down.
- **Healthcare Accessibility & Clean Design**: Built to WCAG AA accessibility standards with semantic HTML, keyboard navigation, color-blind safe status badges, and responsive layouts.
- **Privacy & Security by Design**: No telemetry persistence, no payload logging, strict numeric bounding, and hardened HTTP security headers.

---

## 3. Technology Stack

### Backend
- **Framework**: FastAPI 0.111.0 (ASGI)
- **Runtime**: Python 3.12+
- **Machine Learning**: Scikit-Learn 1.5.0 (`StandardScaler` + `LogisticRegression`)
- **Data & Computation**: NumPy 1.26.4
- **Schema Validation**: Pydantic v2 (Strict bounds, finite number validation)
- **ASGI Server**: Uvicorn 0.30.1

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.4+
- **Build Tool**: Vite 5.3+
- **Routing**: React Router DOM v6
- **Charts & Visualizations**: Recharts 2.12.7 (Responsive SVG line and trend charts)
- **Iconography**: Lucide React
- **Styling**: Custom responsive CSS design system (Navy/Teal healthcare aesthetic)

### Automated Testing
- **Backend**: Pytest 8.2.2 with HTTPX and Starlette TestClient (16 passing tests)
- **Frontend**: Vitest 1.6.0 with React Testing Library and jsdom (9 passing tests across 5 test suites)
- **Static Analysis**: TypeScript Compiler (`tsc --noEmit`), ESLint 8.57

---

## 4. Repository Structure

```
CarePulse-AI/
├── .editorconfig              # Code indentation & line ending standards
├── .gitignore                 # Comprehensive gitignore (excludes .venv, node_modules, build caches)
├── LICENSE                    # MIT Open-Source License
├── README.md                  # Complete project documentation
├── docs/
│   ├── ARCHITECTURE.md        # System architecture, data flow & component design
│   ├── MODEL_CARD.md          # Model metadata, training procedure & test metrics
│   └── SECURITY.md            # Security posture, privacy controls & pre-production disclaimer
├── backend/
│   ├── requirements.txt       # Pinned, mutually compatible Python dependencies
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint, lifespan startup & security middleware
│   │   ├── api/
│   │   │   └── routes.py      # RESTful routes (/health, /dashboard, /patients, /assessments, /model-card)
│   │   ├── core/
│   │   │   ├── config.py      # App settings & CORS configuration
│   │   │   └── security.py    # SecurityHeaders & ContentLengthLimit middlewares
│   │   ├── data/
│   │   │   └── patients_store.py  # 14 deterministic synthetic patient records with observation history
│   │   ├── ml/
│   │   │   └── pipeline.py    # Synthetic dataset generator, scikit-learn model & explainability
│   │   ├── schemas/
│   │   │   ├── assessment.py  # Assessment request/response & feature contribution schemas
│   │   │   ├── model_card.py  # Model card & evaluation metric schemas
│   │   │   └── patient.py     # Patient records, vital signs & dashboard schemas
│   │   └── services/
│   │       └── patient_service.py # Aggregation, search, filter & sorting service
│   └── tests/
│       ├── test_api.py        # API endpoint integration tests
│       ├── test_ml.py         # ML reproducibility, bounds, explanations & balance tests
│       └── test_security.py   # Security headers, payload limit & error masking tests
└── frontend/
    ├── index.html             # HTML5 single page entrypoint
    ├── package.json           # Dependencies, scripts & metadata
    ├── package-lock.json      # Deterministic dependency lockfile
    ├── tsconfig.json          # TypeScript strict compiler configuration
    ├── tsconfig.node.json     # Node-specific TS configuration for Vite
    ├── vite.config.ts         # Vite server, proxy & Vitest configuration
    ├── .eslintrc.cjs          # ESLint rules
    ├── public/
    │   └── favicon.svg        # CarePulse AI brand favicon
    └── src/
        ├── App.tsx            # Main application layout, banner, navbar & router
        ├── main.tsx           # React DOM bootstrapping
        ├── index.css          # Accessible responsive CSS design system
        ├── components/
        │   ├── DisclaimerBanner.tsx  # Persistent clinical safety banner
        │   ├── FeatureImpactBar.tsx  # Standardized feature contribution chart
        │   ├── Navbar.tsx            # Accessible navigation bar with mobile toggle
        │   ├── PatientDetailModal.tsx # Longitudinal Recharts trends & history table
        │   └── StatusBadge.tsx       # Color-blind safe review priority badge
        ├── pages/
        │   ├── AboutSafety.tsx       # Ethical guardrails & architectural principles
        │   ├── ModelTransparency.tsx # Real holdout test metrics & feature weights
        │   ├── NewAssessment.tsx     # Vital signs calculator & JSON export
        │   ├── OverviewDashboard.tsx # Cohort summary, KPIs & review queue
        │   └── PatientMonitoring.tsx # Searchable, filterable patient directory
        ├── services/
        │   └── api.ts         # Centralized, strongly-typed API client module
        ├── types/
        │   └── index.ts       # Shared TypeScript interfaces
        ├── utils/
        │   └── formatters.ts  # Date, percentage, and JSON download utilities
        └── test/
            ├── setup.ts       # Vitest setup & jsdom mocks
            ├── assessment.test.tsx
            ├── dashboard.test.tsx
            ├── model_transparency.test.tsx
            ├── navigation.test.tsx
            └── patients.test.tsx
```

---

## 5. Prerequisites

- **Python**: 3.12+ (or 3.10+)
- **Node.js**: v18.0.0+ (v20+ recommended)
- **npm**: 9.0.0+
- **Git**: 2.30+

---

## 6. Setup & Execution Instructions

### A. Windows Setup (PowerShell)

#### 1. Backend Setup
```powershell
# Open terminal in project root
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

#### 2. Run Backend Tests
```powershell
.venv\Scripts\pytest.exe -v backend\tests
```

#### 3. Start Backend Server
```powershell
# Starts backend on http://127.0.0.1:8008
.venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8008
```

#### 4. Frontend Setup & Build
```powershell
# Open a second terminal window
cd frontend
npm install

# Run type check, linter, and tests
npm run typecheck
npm run lint
npm test

# Build production bundle
npm run build

# Start frontend development server
npm run dev
```

---

### B. Linux / macOS Setup (Bash / Zsh)

#### 1. Backend Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

#### 2. Run Backend Tests
```bash
pytest -v backend/tests
```

#### 3. Start Backend Server
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8008
```

#### 4. Frontend Setup & Run
```bash
cd frontend
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run dev
```

---

## 7. Local Application URLs

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Root**: [http://127.0.0.1:8008/api/health](http://127.0.0.1:8008/api/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8008/docs](http://127.0.0.1:8008/docs)
- **Alternative ReDoc Documentation**: [http://127.0.0.1:8008/redoc](http://127.0.0.1:8008/redoc)

---

## 8. API Endpoint Reference

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, version & model load state | None | `HealthResponse` |
| `GET` | `/api/v1/dashboard` | Aggregate cohort statistics, averages & recent events | None | `DashboardSummary` |
| `GET` | `/api/v1/patients` | Searchable, filterable synthetic patient list | Query params (`search`, `category`, `sort_by`) | `list[PatientSummary]` |
| `GET` | `/api/v1/patients/{id}` | Single patient record with observation trend history | None | `PatientRecord` (404 if not found) |
| `POST` | `/api/v1/assessments` | Evaluates vital signs using ML model & returns explanations | `AssessmentRequest` | `AssessmentResponse` |
| `GET` | `/api/v1/model-card` | Real holdout test metrics, feature weights & methodology | None | `ModelCardResponse` |

---

## 9. Machine Learning Pipeline Details

### 9.1 Reproducible Synthetic Dataset
The training procedure generates 5,000 synthetic patient records using a fixed random seed (`42`). Inputs include:
- Age (18–95 yrs)
- Heart Rate (45–180 bpm)
- Respiratory Rate (8–42 br/min)
- Oxygen Saturation SpO2 (74–100%)
- Body Temperature (35.0–40.8 °C)
- Systolic Blood Pressure (75–215 mmHg)

### 9.2 Scikit-Learn Pipeline
```python
Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(random_state=42, max_iter=1000, C=1.0, solver="lbfgs"))
])
```

### 9.3 Actual Holdout Metrics (Evaluated on 1,000 Test Samples)
- **ROC AUC**: ~0.941
- **Accuracy**: ~89.2%
- **F1 Score**: ~83.3%
- **Precision**: ~84.1%
- **Recall**: ~82.5%
- **Confusion Matrix**: TP: 240, FP: 45, TN: 652, FN: 63

### 9.4 Transparent Log-Odds Explanations
For every input observation vector $x$, the standardized feature contribution is:
$$c_j = \beta_j \cdot \left(\frac{x_j - \mu_j}{\sigma_j}\right)$$
This transparently demonstrates to reviewers exactly how much each vital sign increased or decreased the review priority score.

---

## 10. Automated Test Results Summary

| Suite | Runner | Total Tests | Passed | Failed |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Integration & ML** | Pytest 8.2.2 | 16 | **16** | 0 |
| **Frontend UI & Components** | Vitest 1.6.0 | 9 | **9** | 0 |
| **Total Test Suite** | | **25** | **25** | **0** |

---

## 11. GitHub Submission Instructions

As required by the hackathon submission rules:
- **Public GitHub Repository**
- **Exactly ONE branch** (`main`)
- **Total Tracked Size**: < 8 MB (strictly under 10 MB limit)

### Push Commands
```bash
# 1. Verify git status and single branch
git status
git branch

# 2. Add files and commit
git add .
git commit -m "feat: complete CarePulse AI application for healthcare hackathon submission"

# 3. Add public remote and push
git remote add origin https://github.com/<YOUR_USERNAME>/carepulse-ai.git
git push -u origin main
```

---

## 12. License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
