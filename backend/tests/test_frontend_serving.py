"""Tests for production frontend serving and SPA client-side routing fallback."""

import pytest
from starlette.testclient import TestClient
from app.main import app, FRONTEND_DIST_DIR


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_root_serves_frontend_or_api(client: TestClient):
    """Verifies that GET / serves the frontend index.html when built, or API message if not."""
    res = client.get("/")
    assert res.status_code == 200
    if (FRONTEND_DIST_DIR / "index.html").is_file():
        assert "text/html" in res.headers["content-type"]
        assert "CarePulse AI" in res.text
        assert '<div id="root">' in res.text
    else:
        assert res.json()["message"] == "CarePulse AI API is operational."


def test_spa_client_side_routing_fallback(client: TestClient):
    """Verifies that direct navigation to SPA routes returns index.html for client-side routing."""
    for spa_route in ["/patients", "/assessment", "/model-card", "/about"]:
        res = client.get(spa_route)
        if (FRONTEND_DIST_DIR / "index.html").is_file():
            assert res.status_code == 200
            assert "text/html" in res.headers["content-type"]
            assert '<div id="root">' in res.text
        else:
            assert res.status_code == 404


def test_favicon_serving(client: TestClient):
    """Verifies that /favicon.svg is served."""
    res = client.get("/favicon.svg")
    if (FRONTEND_DIST_DIR / "favicon.svg").is_file():
        assert res.status_code == 200
        assert "image/svg+xml" in res.headers["content-type"]
    else:
        assert res.status_code == 404


def test_api_unknown_route_returns_404_json_not_html(client: TestClient):
    """Verifies that unknown API paths return JSON 404 error rather than falling back to HTML."""
    res = client.get("/api/v1/nonexistent-endpoint")
    assert res.status_code == 404
    assert res.headers["content-type"] == "application/json"
    data = res.json()
    assert "not found" in data["detail"].lower()
