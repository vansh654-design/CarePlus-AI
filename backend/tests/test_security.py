"""Security and privacy compliance tests for CarePulse AI."""

import pytest
from starlette.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_security_headers_present(client: TestClient):
    """15. Verified presence of hardened security headers on responses."""
    res = client.get("/api/health")
    headers = res.headers

    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "Content-Security-Policy" in headers
    assert headers.get("X-Demonstration-Mode") == "CarePulse-Synthetic-Educational-Only"


def test_error_response_does_not_leak_stack_trace(client: TestClient):
    """16. Error responses do not reveal internal stack traces, file paths, or debug keys."""
    res = client.post(
        "/api/v1/assessments",
        headers={"Content-Type": "application/json"},
        content=b"{ invalid_json: true }",
    )
    # Should result in 422 validation or 400 Bad Request
    assert res.status_code in [400, 422]
    body = res.text
    # Ensure standard sensitive stacktrace indicators are absent
    assert "Traceback (most recent call last)" not in body
    assert "backend/app" not in body
    assert "app/main" not in body
    assert "File \"" not in body


def test_payload_size_limit_protection(client: TestClient):
    """Ensures oversized payloads are rejected to protect against DoS."""
    oversized_bytes = b"0" * (300 * 1024)  # 300 KB > 256 KB limit
    res = client.post(
        "/api/v1/assessments",
        headers={"Content-Type": "application/json", "Content-Length": str(len(oversized_bytes))},
        content=oversized_bytes,
    )
    assert res.status_code == 413
    assert res.json()["error_code"] == "PAYLOAD_TOO_LARGE"
