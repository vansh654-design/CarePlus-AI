"""CarePulse AI - FastAPI application entrypoint."""

from contextlib import asynccontextmanager
import os
from pathlib import Path
import sys
from typing import AsyncGenerator

# Ensure package root (backend directory) is in sys.path
_current_file = Path(__file__).resolve()
_backend_dir = _current_file.parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router
from app.core.config import settings
from app.core.security import (
    ContentLengthLimitMiddleware,
    SecurityHeadersMiddleware,
)
from app.ml.pipeline import ModelService

# Register backwards-compatibility aliases in sys.modules
try:
    import app
    sys.modules.setdefault("backend.app", app)
    sys.modules.setdefault("backend.app.main", sys.modules[__name__])
except ImportError:
    pass


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager to initialize the ML model pipeline once at startup."""
    # Initialize and fit the reproducible scikit-learn model
    model_service = ModelService.get_instance()
    if not model_service.is_initialized:
        model_service.train_and_evaluate()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Content Length Restriction Middleware
app.add_middleware(ContentLengthLimitMiddleware)

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# Custom Exception Handlers to prevent internal stack trace leakage
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field_path,
            "message": err.get("msg", "Invalid input value"),
            "type": err.get("type", "value_error"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation failed. Please check field ranges and formatting.",
            "error_code": "VALIDATION_ERROR",
            "errors": errors,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Do not leak internal stack traces to the client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )


# Frontend static distribution directory
FRONTEND_DIST_DIR = Path(
    os.environ.get(
        "FRONTEND_DIST_DIR",
        Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    )
)

# Mount the API router under /api
app.include_router(api_router, prefix="/api")

# Mount production assets directory if it exists
assets_dir = FRONTEND_DIST_DIR / "assets"
if assets_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend_assets")


@app.get("/favicon.svg", include_in_schema=False)
async def serve_favicon():
    """Serves the frontend favicon."""
    favicon_path = FRONTEND_DIST_DIR / "favicon.svg"
    if favicon_path.is_file():
        return FileResponse(favicon_path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Favicon not found.")


@app.get("/", tags=["Root"])
async def root_endpoint():
    """Serves the frontend SPA index.html in production, or API info when running API-only."""
    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {
        "message": "CarePulse AI API is operational.",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "demonstration_mode": True,
    }


@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str):
    """Serves static files from dist or falls back to index.html for client-side SPA routing."""
    # Never intercept API, docs, or OpenAPI routes
    if (
        full_path.startswith("api/")
        or full_path == "api"
        or full_path in ("docs", "redoc", "openapi.json")
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API endpoint '/{full_path}' not found.",
        )

    # Direct file match in frontend/dist (e.g., manifest.json, robots.txt)
    requested_file = FRONTEND_DIST_DIR / full_path
    if requested_file.is_file():
        return FileResponse(requested_file)

    # SPA routing fallback: send index.html for client-side routes (e.g. /patients, /assessment)
    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found.")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
