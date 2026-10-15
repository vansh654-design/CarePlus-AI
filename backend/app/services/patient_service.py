"""Business logic service for synthetic patient management and dashboard statistics."""

from datetime import datetime, timezone
from app.data.patients_store import get_all_patients, get_patient_by_id
from app.schemas.patient import (
    DashboardSummary,
    PatientRecord,
    PatientSummary,
)


class PatientService:
    """Provides query, filtering, sorting, and aggregation over synthetic demonstration records."""

    @staticmethod
    def get_dashboard_summary() -> DashboardSummary:
        """Calculates live aggregate statistics from synthetic demonstration records."""
        patients = get_all_patients()
        total = len(patients)

        routine_count = sum(1 for p in patients if p.demonstration_category == "Routine demonstration review")
        review_suggested_count = sum(
            1 for p in patients if p.demonstration_category == "Review suggested by demonstration model"
        )
        higher_priority_count = sum(
            1 for p in patients if p.demonstration_category == "Higher demonstration review priority"
        )
        active_alerts = sum(len(p.illustrative_flags) for p in patients)

        avg_hr = sum(p.current_vital_signs.heart_rate for p in patients) / total if total else 0.0
        avg_rr = sum(p.current_vital_signs.respiratory_rate for p in patients) / total if total else 0.0
        avg_spo2 = sum(p.current_vital_signs.oxygen_saturation for p in patients) / total if total else 0.0
        avg_temp = sum(p.current_vital_signs.body_temperature for p in patients) / total if total else 0.0
        avg_sbp = sum(p.current_vital_signs.systolic_blood_pressure for p in patients) / total if total else 0.0

        # Recent synthetic activity events
        recent_events = [
            {
                "timestamp": "2026-10-15T02:15:00Z",
                "patient_id": "DEMO-008",
                "event_type": "Priority Escalation",
                "summary": "Synthetic observation priority escalated to Higher (Score: 0.88). SpO2 < 92%.",
            },
            {
                "timestamp": "2026-10-15T02:00:00Z",
                "patient_id": "DEMO-001",
                "event_type": "Vital Signs Update",
                "summary": "Observation logged: SpO2 89.5%, RR 26 bpm. Illustrative flags active.",
            },
            {
                "timestamp": "2026-10-15T01:30:00Z",
                "patient_id": "DEMO-004",
                "event_type": "Priority Escalation",
                "summary": "Hypotensive trend and hypoxemia recorded (Score: 0.97). Review suggested.",
            },
            {
                "timestamp": "2026-10-15T01:10:00Z",
                "patient_id": "DEMO-011",
                "event_type": "Threshold Trigger",
                "summary": "SpO2 dropped to 90.0% in Geriatric Acute Care. Flagged for demonstration review.",
            },
            {
                "timestamp": "2026-10-15T00:00:00Z",
                "patient_id": "DEMO-009",
                "event_type": "Routine Observation",
                "summary": "Post-Op Recovery Unit vitals stable at normal baseline (Score: 0.06).",
            },
        ]

        disclaimer = (
            "NOTICE: All dashboard statistics, patient identifiers, and observations are completely "
            "synthetic. For educational demonstration only. Not for clinical decision-making."
        )

        return DashboardSummary(
            total_patients=total,
            routine_count=routine_count,
            review_suggested_count=review_suggested_count,
            higher_priority_count=higher_priority_count,
            active_alerts_count=active_alerts,
            average_vitals={
                "heart_rate": round(avg_hr, 1),
                "respiratory_rate": round(avg_rr, 1),
                "oxygen_saturation": round(avg_spo2, 1),
                "body_temperature": round(avg_temp, 1),
                "systolic_blood_pressure": round(avg_sbp, 1),
            },
            recent_events=recent_events,
            disclaimer=disclaimer,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def list_patients(
        search: str | None = None,
        category: str | None = None,
        sort_by: str = "priority_desc",
    ) -> list[PatientSummary]:
        """Lists synthetic patients with optional searching, category filtering, and sorting."""
        patients = get_all_patients()
        results: list[PatientRecord] = patients

        # Search by id, display_code, or department unit
        if search:
            query = search.strip().lower()
            results = [
                p for p in results
                if query in p.id.lower() or query in p.display_code.lower() or query in p.unit.lower()
            ]

        # Category filter
        if category:
            cat_query = category.strip().lower()
            results = [p for p in results if p.demonstration_category.lower() == cat_query]

        # Sort
        if sort_by == "priority_desc":
            results = sorted(results, key=lambda p: p.review_priority_score, reverse=True)
        elif sort_by == "priority_asc":
            results = sorted(results, key=lambda p: p.review_priority_score)
        elif sort_by == "age_desc":
            results = sorted(results, key=lambda p: p.age, reverse=True)
        elif sort_by == "id":
            results = sorted(results, key=lambda p: p.id)

        return [
            PatientSummary(
                id=p.id,
                display_code=p.display_code,
                age=p.age,
                biological_sex=p.biological_sex,
                unit=p.unit,
                current_vital_signs=p.current_vital_signs,
                demonstration_category=p.demonstration_category,
                review_priority_score=p.review_priority_score,
                illustrative_flags=p.illustrative_flags,
                last_updated=p.last_updated,
            )
            for p in results
        ]

    @staticmethod
    def get_patient(patient_id: str) -> PatientRecord | None:
        """Retrieves single synthetic patient with complete observation history."""
        return get_patient_by_id(patient_id)
