"""Machine Learning pipeline and explainability tests."""

import numpy as np
import pytest
from backend.app.ml.pipeline import (
    FEATURE_NAMES,
    ModelService,
    generate_synthetic_dataset,
)


def test_synthetic_data_generation():
    """13. Both synthetic classes are represented and have adequate samples."""
    X, y = generate_synthetic_dataset(n_samples=5000, seed=42)

    assert X.shape == (5000, 6)
    assert len(y) == 5000
    assert set(np.unique(y)) == {0, 1}

    positive_ratio = np.mean(y)
    # Check that both classes have adequate representation (between 15% and 50%)
    assert 0.15 <= positive_ratio <= 0.50, f"Positive class ratio {positive_ratio} out of expected range"


def test_model_reproducibility():
    """14. The model trains reproducibly with deterministic metrics."""
    service1 = ModelService(seed=42)
    service1.train_and_evaluate()

    service2 = ModelService(seed=42)
    service2.train_and_evaluate()

    assert service1.metrics.accuracy == service2.metrics.accuracy
    assert service1.metrics.roc_auc == service2.metrics.roc_auc
    assert service1.intercept == service2.intercept

    for feat in FEATURE_NAMES:
        assert service1.feature_coefficients[feat] == service2.feature_coefficients[feat]


def test_model_prediction_bounds_and_categories():
    """9 & 10. Model output is finite, bounded in [0, 1], and categories follow logic."""
    service = ModelService.get_instance()

    # Low priority case: young, normal vitals
    score_low, cat_low, _, _, _ = service.predict(
        age=25,
        heart_rate=70.0,
        respiratory_rate=14.0,
        oxygen_saturation=99.0,
        body_temperature=36.8,
        systolic_blood_pressure=118.0,
    )
    assert 0.0 <= score_low <= 1.0
    assert cat_low == "Routine demonstration review"
    assert score_low < 0.35

    # High priority case: severe vitals derangement
    score_high, cat_high, _, flags, _ = service.predict(
        age=82,
        heart_rate=125.0,
        respiratory_rate=30.0,
        oxygen_saturation=86.0,
        body_temperature=39.2,
        systolic_blood_pressure=82.0,
    )
    assert 0.0 <= score_high <= 1.0
    assert cat_high == "Higher demonstration review priority"
    assert score_high >= 0.70
    assert len(flags) >= 3


def test_feature_explanations_structure():
    """11. Feature explanations contain correct fields, scaled contributions, and directions."""
    service = ModelService.get_instance()
    _, _, contributions, flags, interpretation = service.predict(
        age=68,
        heart_rate=110.0,
        respiratory_rate=26.0,
        oxygen_saturation=89.0,
        body_temperature=38.4,
        systolic_blood_pressure=96.0,
    )

    assert len(contributions) == 6
    for c in contributions:
        assert c.feature_name in FEATURE_NAMES
        assert isinstance(c.raw_value, float)
        assert isinstance(c.scaled_value, float)
        assert isinstance(c.coefficient, float)
        assert isinstance(c.contribution_score, float)
        assert c.direction in ["increases_priority", "decreases_priority", "neutral"]
        assert len(c.human_explanation) > 10

    # Low SpO2 (89%) should increase review priority
    spo2_contrib = next(c for c in contributions if c.feature_name == "oxygen_saturation")
    assert spo2_contrib.direction == "increases_priority"
    assert "Oxygen Saturation" in spo2_contrib.human_explanation
