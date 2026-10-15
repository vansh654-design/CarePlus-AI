"""Schemas for the assessment endpoint, validation, explanations, and threshold flags."""

import math
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AssessmentRequest(BaseModel):
    """Input payload for a vital sign demonstration assessment."""

    age: int = Field(..., ge=1, le=120, description="Age in years (1 - 120)")
    heart_rate: float = Field(..., ge=30.0, le=260.0, description="Heart rate (bpm)")
    respiratory_rate: float = Field(..., ge=4.0, le=60.0, description="Respiratory rate (breaths/min)")
    oxygen_saturation: float = Field(..., ge=50.0, le=100.0, description="SpO2 oxygen saturation (%)")
    body_temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature (°C)")
    systolic_blood_pressure: float = Field(..., ge=50.0, le=300.0, description="Systolic blood pressure (mmHg)")

    @field_validator(
        "heart_rate",
        "respiratory_rate",
        "oxygen_saturation",
        "body_temperature",
        "systolic_blood_pressure",
        mode="before",
    )
    @classmethod
    def validate_finite_number(cls, v: float) -> float:
        try:
            val = float(v)
        except (ValueError, TypeError):
            raise ValueError("Numeric value is required.")
        if math.isnan(val) or math.isinf(val):
            raise ValueError("Value must be a finite, valid number.")
        return val


class FeatureContribution(BaseModel):
    """Transparent contribution of an input feature to the model log-odds."""

    feature_name: str
    display_name: str
    raw_value: float
    unit: str
    scaled_value: float
    coefficient: float
    contribution_score: float
    direction: Literal["increases_priority", "decreases_priority", "neutral"]
    human_explanation: str


class ThresholdFlag(BaseModel):
    """Illustrative clinical threshold alert rule (distinct from ML model)."""

    metric_name: str
    value: float
    threshold_rule: str
    severity: Literal["routine", "caution", "concerning"]
    message: str


class AssessmentResponse(BaseModel):
    """Complete response payload for a demonstration assessment."""

    model_config = ConfigDict(protected_namespaces=())

    assessment_id: str
    demonstration_score: float = Field(..., ge=0.0, le=1.0)
    demonstration_category: Literal[
        "Routine demonstration review",
        "Review suggested by demonstration model",
        "Higher demonstration review priority",
    ]
    model_version: str
    input_summary: dict[str, float]
    feature_contributions: list[FeatureContribution]
    threshold_flags: list[ThresholdFlag]
    score_interpretation: str
    safety_disclaimer: str
    timestamp: str
