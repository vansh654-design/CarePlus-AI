"""Pydantic schemas for patient records, vital signs, and observation history."""

from typing import Optional
from pydantic import BaseModel, Field


class VitalSigns(BaseModel):
    """Vital signs values for synthetic demonstration monitoring."""

    heart_rate: float = Field(..., ge=30.0, le=260.0, description="Heart rate in beats per minute (bpm)")
    respiratory_rate: float = Field(..., ge=4.0, le=60.0, description="Respiratory rate in breaths per minute")
    oxygen_saturation: float = Field(..., ge=50.0, le=100.0, description="Peripheral oxygen saturation (SpO2 %)")
    body_temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature in degrees Celsius (°C)")
    systolic_blood_pressure: float = Field(..., ge=50.0, le=300.0, description="Systolic blood pressure in mmHg")


class ObservationEntry(BaseModel):
    """Historical observation timepoint for trend analytics."""

    timestamp: str = Field(..., description="ISO 8601 synthetic observation timestamp")
    vital_signs: VitalSigns
    notes: Optional[str] = Field(None, description="Clinical synthetic monitoring context note")
    demonstration_score: float = Field(..., ge=0.0, le=1.0, description="Demonstration review priority score")


class PatientRecord(BaseModel):
    """Synthetic patient demonstration record."""

    id: str = Field(..., description="Synthetic patient identifier (e.g. DEMO-001)")
    display_code: str = Field(..., description="De-identified synthetic code")
    age: int = Field(..., ge=1, le=120, description="Synthetic patient age")
    biological_sex: str = Field(..., description="Synthetic biological sex")
    unit: str = Field(..., description="Demonstration care unit/department")
    admission_timestamp: str = Field(..., description="Synthetic admission timestamp")
    current_vital_signs: VitalSigns
    observation_history: list[ObservationEntry]
    demonstration_category: str = Field(..., description="Review priority category")
    review_priority_score: float = Field(..., ge=0.0, le=1.0, description="Estimated priority score")
    illustrative_flags: list[str] = Field(default_factory=list, description="Demonstration threshold flags")
    last_updated: str


class PatientSummary(BaseModel):
    """Compact summary of a synthetic patient for list views."""

    id: str
    display_code: str
    age: int
    biological_sex: str
    unit: str
    current_vital_signs: VitalSigns
    demonstration_category: str
    review_priority_score: float
    illustrative_flags: list[str]
    last_updated: str


class DashboardSummary(BaseModel):
    """Aggregated statistics for the overview dashboard."""

    total_patients: int
    routine_count: int
    review_suggested_count: int
    higher_priority_count: int
    active_alerts_count: int
    average_vitals: dict[str, float]
    recent_events: list[dict[str, str]]
    disclaimer: str
    timestamp: str
