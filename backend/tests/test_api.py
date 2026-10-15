"""API integration tests for CarePulse AI."""

import pytest
from starlette.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client: TestClient):
    """1. Health endpoint returns expected structure and operational status."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "CarePulse AI"
    assert data["demonstration_mode"] is True
    assert data["synthetic_data_only"] is True
    assert data["model_initialized"] is True
    assert "model_version" in data


def test_dashboard_endpoint(client: TestClient):
    """2. Dashboard returns the expected summary aggregates from backend data."""
    res = client.get("/api/v1/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_patients"] == 14
    assert data["routine_count"] + data["review_suggested_count"] + data["higher_priority_count"] == 14
    assert data["higher_priority_count"] > 0
    assert "average_vitals" in data
    assert "recent_events" in data
    assert len(data["recent_events"]) > 0
    assert "synthetic" in data["disclaimer"].lower()


def test_patients_list_endpoint(client: TestClient):
    """3. Synthetic patient list contains all 14 records and supports search/filter."""
    # List all
    res = client.get("/api/v1/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) == 14

    # Search filter
    search_res = client.get("/api/v1/patients?search=DEMO-001")
    assert search_res.status_code == 200
    found = search_res.json()
    assert len(found) == 1
    assert found[0]["id"] == "DEMO-001"

    # Category filter
    cat_res = client.get("/api/v1/patients?category=Routine demonstration review")
    assert cat_res.status_code == 200
    routine_patients = cat_res.json()
    assert all(p["demonstration_category"] == "Routine demonstration review" for p in routine_patients)


def test_patient_detail_success(client: TestClient):
    """4. Individual patient lookup returns patient data and observation history."""
    res = client.get("/api/v1/patients/DEMO-001")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "DEMO-001"
    assert len(data["observation_history"]) >= 4
    assert "current_vital_signs" in data
    assert data["current_vital_signs"]["oxygen_saturation"] == 89.5


def test_patient_detail_not_found(client: TestClient):
    """5. Unknown patient lookup returns 404 with structured error."""
    res = client.get("/api/v1/patients/UNKNOWN-999")
    assert res.status_code == 404
    data = res.json()
    assert "not found" in data["detail"].lower()
    assert data["error_code"] == "HTTP_404"


def test_valid_assessment(client: TestClient):
    """6. Valid assessment returns correctly structured response with score and explanations."""
    payload = {
        "age": 68,
        "heart_rate": 110.0,
        "respiratory_rate": 26.0,
        "oxygen_saturation": 89.0,
        "body_temperature": 38.5,
        "systolic_blood_pressure": 95.0,
    }
    res = client.post("/api/v1/assessments", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "assessment_id" in data
    assert 0.0 <= data["demonstration_score"] <= 1.0
    assert data["demonstration_category"] in [
        "Routine demonstration review",
        "Review suggested by demonstration model",
        "Higher demonstration review priority",
    ]
    assert len(data["feature_contributions"]) == 6
    assert len(data["threshold_flags"]) > 0
    assert "EDUCATIONAL DEMONSTRATION NOTICE" in data["safety_disclaimer"]


def test_invalid_vital_signs_rejected(client: TestClient):
    """7. Invalid vital-sign inputs outside bounded ranges are rejected (422)."""
    # Negative heart rate
    res1 = client.post(
        "/api/v1/assessments",
        json={
            "age": 45,
            "heart_rate": -10.0,
            "respiratory_rate": 16.0,
            "oxygen_saturation": 98.0,
            "body_temperature": 37.0,
            "systolic_blood_pressure": 120.0,
        },
    )
    assert res1.status_code == 422
    assert res1.json()["error_code"] == "VALIDATION_ERROR"

    # SpO2 > 100%
    res2 = client.post(
        "/api/v1/assessments",
        json={
            "age": 45,
            "heart_rate": 75.0,
            "respiratory_rate": 16.0,
            "oxygen_saturation": 105.0,
            "body_temperature": 37.0,
            "systolic_blood_pressure": 120.0,
        },
    )
    assert res2.status_code == 422


def test_nan_and_infinite_inputs_rejected(client: TestClient):
    """8. NaN, inf, and malformed strings are rejected with 422."""
    res = client.post(
        "/api/v1/assessments",
        json={
            "age": 50,
            "heart_rate": "NaN",
            "respiratory_rate": 18.0,
            "oxygen_saturation": 97.0,
            "body_temperature": 37.0,
            "systolic_blood_pressure": 120.0,
        },
    )
    assert res.status_code == 422
    assert res.json()["error_code"] == "VALIDATION_ERROR"


def test_model_card_endpoint(client: TestClient):
    """12. Model card endpoint returns real evaluation metrics and coefficients."""
    res = client.get("/api/v1/model-card")
    assert res.status_code == 200
    data = res.json()
    assert data["model_name"] == "CarePulse AI Review Priority Classifier"
    assert "evaluation_metrics" in data
    metrics = data["evaluation_metrics"]
    assert 0.5 <= metrics["accuracy"] <= 1.0
    assert 0.5 <= metrics["roc_auc"] <= 1.0
    assert metrics["train_sample_size"] == 4000
    assert metrics["test_sample_size"] == 1000
    assert len(data["feature_coefficients"]) == 6
    assert len(data["limitations"]) > 0
    assert "educational demonstration" in data["clinical_safety_notice"].lower()
