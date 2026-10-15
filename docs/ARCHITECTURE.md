# System Architecture — CarePulse AI

## 1. Overview and Design Principles

**CarePulse AI** is an explainable patient monitoring and early-warning demonstration assistant built for the **AI/ML in Healthcare** hackathon track. Its architecture follows three foundational principles:

1. **Strict Clinical Separation**: Statistical machine learning outputs are decoupled from deterministic guideline threshold rules. Outputs are explicitly categorized as **Demonstration Review Priorities**, never disease diagnoses or treatment guidelines.
2. **Deterministic & Reproducible AI Pipeline**: Training data generation, feature scaling, model fitting, and evaluation are 100% reproducible via fixed random seeds. The model is trained once on application lifespan startup and cached in-memory.
3. **Defense-in-Depth Security & Privacy**: No Protected Health Information (PHI) is collected or stored. Input payloads are constrained by strict numerical bounds and rejected if non-finite (NaN/inf). No assessment inputs are persisted to disk or external services.

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                           CLIENT (Browser)                              |
|   React 18 + TypeScript + Vite SPA                                      |
|   - Overview Dashboard (KPIs, vitals summary, trend graphs, events log) |
|   - Patient Monitoring (Directory, search, filter, detail modal)       |
|   - Interactive Assessment (Client-side validation, JSON export)        |
|   - Model Transparency (Holdout test metrics, feature weights)          |
|   - About & Safety (Educational disclaimers, architecture notes)        |
+-------------------------------------------------------------------------+
                                    |
                        HTTP / JSON (RESTful API)
                        CORS / Hardened Headers
                                    v
+-------------------------------------------------------------------------+
|                        BACKEND SERVICE (FastAPI)                        |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | Security & Guardrails Middleware                                |   |
|   | - SecurityHeadersMiddleware (CSP, X-Frame-Options, X-Content)   |   |
|   | - ContentLengthLimitMiddleware (256 KB max payload protection)   |   |
|   | - Structured Exception Handlers (Masking internal stack traces) |   |
|   +-----------------------------------------------------------------+   |
|                                    |                                    |
|   +--------------------------------+--------------------------------+   |
|   |                                |                                |   |
|   v                                v                                v   |
| +--------------------+   +--------------------+   +-------------------+ |
| |  Patient Service   |   | Assessment Service |   | Model Transparency| |
| |  - Deterministic   |   | - Pydantic Bounds  |   | - Holdout Metrics | |
| |    14 demo beds    |   | - NaN/Inf checks   |   | - Confusion Matrix| |
| |  - Longitudinal    |   | - No payload disk  |   | - Coefficients    | |
| |    trend logs      |   |   persistence      |   | - Model version   | |
| +--------------------+   +--------------------+   +-------------------+ |
|                                    |                                    |
|                                    v                                    |
|   +-----------------------------------------------------------------+   |
|   |                  Machine Learning Subsystem                     |   |
|   |  Scikit-Learn Pipeline: StandardScaler + LogisticRegression     |   |
|   |  - Reproducible Synthetic Generator (5,000 samples, Seed 42)    |   |
|   |  - Stratified 80/20 Train/Test Split (4,000 train / 1,000 test) |   |
|   |  - Transparent Feature Log-Odds Decomposition                   |   |
|   |  - Heuristic Clinical Guideline Threshold Flagging              |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 3. Component Responsibilities

### 3.1 Frontend (`frontend/`)
- **Technology**: React 18, TypeScript, Vite, React Router v6, Recharts, Lucide React.
- **`src/pages/`**:
  - `OverviewDashboard`: Consumes `/api/v1/dashboard` and `/api/v1/patients` to display live aggregate KPI counts, cohort vitals, recent events, and top priority review queue.
  - `PatientMonitoring`: Searchable, filterable, and sortable directory of all 14 synthetic patients.
  - `NewAssessment`: Interactive vital-signs calculator with client-side range validation, live preset buttons, submission to `/api/v1/assessments`, result breakdown, and JSON export.
  - `ModelTransparency`: Renders real test evaluation metrics (accuracy, precision, recall, F1, ROC-AUC, confusion matrix) fetched directly from `/api/v1/model-card`.
  - `AboutSafety`: Educational purpose, synthetic data provenance, clinical safety commitments, architecture diagram, and developer handoff.
- **`src/components/`**:
  - `Navbar`: Responsive navigation with active route highlights, branding, and mobile drawer toggle.
  - `DisclaimerBanner`: Persistent prominent educational warning banner.
  - `StatusBadge`: Color-blind safe status indicator pairing color with distinct icons and labels.
  - `FeatureImpactBar`: Standardized feature contribution chart displaying directional influence on model log-odds.
  - `PatientDetailModal`: Modal dialog displaying patient observation history and multi-vital longitudinal Recharts time-series.
- **`src/services/api.ts`**: Single centralized API client module with typed request/response contracts and uniform error normalization.

### 3.2 Backend (`backend/`)
- **Technology**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Scikit-learn, NumPy.
- **`backend/app/core/`**:
  - `config.py`: App metadata, CORS configuration, payload limits.
  - `security.py`: Security headers middleware and payload size enforcement.
- **`backend/app/schemas/`**: Pydantic models enforcing strict numerical validation, finite number checks, and schema integrity for request/response bodies.
- **`backend/app/data/`**:
  - `patients_store.py`: In-memory deterministic fixture store of 14 synthetic demonstration patients with multi-timepoint longitudinal vital sign observation histories.
- **`backend/app/services/`**:
  - `patient_service.py`: Aggregation logic, querying, searching, filtering, and sorting.
- **`backend/app/ml/`**:
  - `pipeline.py`: Synthetic dataset synthesis, scikit-learn pipeline initialization, inference calculation, standardized feature log-odds contribution computation, and illustrative threshold flags.
- **`backend/app/api/`**:
  - `routes.py`: Clean RESTful endpoints under `/api`.
- **`backend/app/main.py`**: FastAPI application entrypoint with lifespan startup initialization.

---

## 4. Machine Learning & Prediction Flow

1. **Lifespan Startup**:
   - `ModelService.get_instance()` is invoked.
   - If uninitialized, `generate_synthetic_dataset(n_samples=5000, seed=42)` produces reproducible physiological distributions.
   - A stratified 80/20 train/test split isolates 4,000 training observations and 1,000 test observations.
   - `Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression(random_state=42, max_iter=1000))])` is fitted to the training split.
   - Holdout evaluation metrics (accuracy, precision, recall, F1, ROC-AUC, confusion matrix) are calculated on the 1,000 test samples and stored.
2. **Inference Request**:
   - `POST /api/v1/assessments` receives the vital signs payload.
   - Pydantic validates ranges and confirms all inputs are finite numbers.
   - The model computes the prediction probability $P \in [0, 1]$.
   - Category mapping:
     - $P \ge 0.70$: `Higher demonstration review priority`
     - $0.35 \le P < 0.70$: `Review suggested by demonstration model`
     - $P < 0.35$: `Routine demonstration review`
   - Feature contribution decomposition:
     $$c_j = \beta_j \cdot \frac{x_j - \mu_j}{\sigma_j}$$
     Each feature's contribution to the linear logit is calculated and classified as increasing, decreasing, or neutral towards review priority.
   - Separate guideline threshold rules evaluate physiological deviations (e.g. SpO2 < 92%, SBP < 90 mmHg).
   - An immutable structured `AssessmentResponse` is returned with an educational disclaimer. The assessment payload is discarded from memory and **not** persisted to disk.

---

## 5. Security & Privacy Model

- **No PHI**: Uses 100% synthetic records (`DEMO-001` through `DEMO-014`).
- **No Assessment Storage**: Stateless assessment endpoint prevents accidental exposure of user-tested vitals.
- **No Command Execution or Eval**: No dynamic shell execution, eval, or unsanitized HTML injection.
- **Payload Limiting**: Requests exceeding 256 KB are rejected with HTTP 413.
- **Hardened HTTP Headers**: Every response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Content-Security-Policy`.
- **Safe Error Responses**: Uncaught exceptions are masked into uniform JSON messages to prevent internal stack trace leakage.

---

## 6. Test Strategy

- **Backend Tests (Pytest)**:
  - Integration tests for `/api/health`, `/api/v1/dashboard`, `/api/v1/patients`, `/api/v1/patients/{id}`, `/api/v1/assessments`, and `/api/v1/model-card`.
  - Input validation tests rejecting NaN, infinity, and out-of-range vitals.
  - ML tests confirming dataset reproducibility, both class representation, score bounds, and feature explanation integrity.
  - Security tests confirming header presence, error masking, and payload size enforcement.
- **Frontend Tests (Vitest + React Testing Library)**:
  - Dashboard rendering, KPI values, and error states.
  - Patient directory filtering, search matching, and empty state.
  - Form validation errors and successful submission.
  - Assessment result display, feature waterfall rendering, and JSON export.
  - Model transparency holdout metric display and limitation visibility.
  - Full client-side routing across all navigation views.

---

## 7. Production Deployment Model (Google Cloud Run & Docker)

CarePulse AI is packaged as a single unified container service for serverless, autoscaling deployment on **Google Cloud Run**:

1. **Multi-Stage Build Pipeline**:
   - **Stage 1 (`frontend-builder`)**: Node.js 20 Alpine installs frontend dependencies via `npm ci` and compiles the React/TypeScript SPA to static production assets in `/build/frontend/dist`.
   - **Stage 2 (`runner`)**: Python 3.12 Slim installs production backend dependencies (`pip install -r backend/requirements.txt`), copies the FastAPI backend code to `/app/backend`, and copies the compiled frontend assets to `/app/frontend/dist`.
2. **Unified Port & Process Model**:
   - The container runs as an unprivileged non-root user (`appuser`, UID 10001).
   - Listens on `0.0.0.0:${PORT:-8080}` as required by Google Cloud Run.
   - FastAPI serves both the RESTful API under `/api` and the React frontend SPA with client-side HTML5 History API fallback routing (`/{full_path:path}`).
3. **Stateless Scalability**:
   - Container instances scale horizontally from 0 to N with zero persistent disk dependencies.
   - The ML model pipeline initializes once in memory upon container cold-start, enabling instant deterministic predictions without cold external model fetching.
