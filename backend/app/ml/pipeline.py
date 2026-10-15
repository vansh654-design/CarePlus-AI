"""Machine Learning pipeline: synthetic data generation, model training, evaluation,

and transparent feature explanations using scikit-learn.
"""

from datetime import datetime, timezone
import math
from typing import Any
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from backend.app.schemas.assessment import FeatureContribution, ThresholdFlag
from backend.app.schemas.model_card import EvaluationMetrics, ModelCardResponse


FEATURE_NAMES = [
    "age",
    "heart_rate",
    "respiratory_rate",
    "oxygen_saturation",
    "body_temperature",
    "systolic_blood_pressure",
]

FEATURE_METADATA = {
    "age": {"display_name": "Age", "unit": "years", "normal_range": "18 - 65"},
    "heart_rate": {"display_name": "Heart Rate", "unit": "bpm", "normal_range": "60 - 100"},
    "respiratory_rate": {"display_name": "Respiratory Rate", "unit": "breaths/min", "normal_range": "12 - 20"},
    "oxygen_saturation": {"display_name": "Oxygen Saturation (SpO2)", "unit": "%", "normal_range": "95 - 100"},
    "body_temperature": {"display_name": "Body Temperature", "unit": "°C", "normal_range": "36.5 - 37.5"},
    "systolic_blood_pressure": {"display_name": "Systolic Blood Pressure", "unit": "mmHg", "normal_range": "100 - 130"},
}

RANDOM_SEED = 42


def generate_synthetic_dataset(n_samples: int = 5000, seed: int = RANDOM_SEED) -> tuple[np.ndarray, np.ndarray]:
    """Generates a reproducible synthetic dataset of physiological observations.

    Rules for target generation represent a documented synthetic composite flag
    for demonstration monitoring, NOT medical diagnosis or actual deterioration.
    """
    rng = np.random.default_rng(seed)

    # 1. Feature sampling using plausible physiological distributions
    age = rng.normal(loc=58.0, scale=17.0, size=n_samples)
    age = np.clip(np.round(age), 18, 95)

    heart_rate = rng.normal(loc=78.0, scale=18.0, size=n_samples)
    heart_rate = np.clip(np.round(heart_rate, 1), 45.0, 180.0)

    respiratory_rate = rng.normal(loc=16.5, scale=4.5, size=n_samples)
    respiratory_rate = np.clip(np.round(respiratory_rate, 1), 8.0, 42.0)

    # SpO2 skewed towards normal 95-99% with a lower tail
    spo2_base = 100.0 - rng.exponential(scale=3.2, size=n_samples)
    oxygen_saturation = np.clip(np.round(spo2_base, 1), 74.0, 100.0)

    body_temperature = rng.normal(loc=37.0, scale=0.75, size=n_samples)
    body_temperature = np.clip(np.round(body_temperature, 1), 35.0, 40.8)

    systolic_bp = rng.normal(loc=125.0, scale=22.0, size=n_samples)
    systolic_bp = np.clip(np.round(systolic_bp, 1), 75.0, 215.0)

    X = np.column_stack([
        age,
        heart_rate,
        respiratory_rate,
        oxygen_saturation,
        body_temperature,
        systolic_bp,
    ])

    # 2. Transparent synthetic scoring rule for target assignment
    # Synthetic composite early-warning score logic
    scores = np.zeros(n_samples)

    # SpO2 deviation
    scores += np.where(oxygen_saturation < 91.0, 3.2, np.where(oxygen_saturation < 94.0, 1.8, 0.0))

    # Respiratory rate deviation
    scores += np.where((respiratory_rate > 24.0) | (respiratory_rate < 10.0), 2.8,
                       np.where((respiratory_rate > 20.0) | (respiratory_rate < 12.0), 1.2, 0.0))

    # Heart rate deviation
    scores += np.where((heart_rate > 115.0) | (heart_rate < 48.0), 2.4,
                       np.where((heart_rate > 95.0) | (heart_rate < 55.0), 1.0, 0.0))

    # Systolic blood pressure deviation
    scores += np.where(systolic_bp < 90.0, 3.0,
                       np.where((systolic_bp < 100.0) | (systolic_bp > 175.0), 1.5, 0.0))

    # Temperature deviation
    scores += np.where((body_temperature > 38.6) | (body_temperature < 35.5), 1.8,
                       np.where((body_temperature > 38.0) | (body_temperature < 36.0), 0.8, 0.0))

    # Age vulnerability factor
    scores += np.where(age > 72.0, 0.7, 0.0)

    # Controlled stochastic variation (Gaussian noise) to create realistic boundary decisions
    noise = rng.normal(loc=0.0, scale=0.85, size=n_samples)
    total_score = scores + noise

    # Target: 1 if total synthetic score >= 3.6, else 0
    y = (total_score >= 3.6).astype(int)

    return X, y


class ModelService:
    """Manages training, evaluation, inference, and explainability for CarePulse AI."""

    _instance: "ModelService | None" = None

    def __init__(self, seed: int = RANDOM_SEED) -> None:
        self.seed = seed
        self.model_version = "1.0.0-logistic-regression"
        self.pipeline: Pipeline | None = None
        self.metrics: EvaluationMetrics | None = None
        self.feature_coefficients: dict[str, float] = {}
        self.intercept: float = 0.0
        self.feature_means: np.ndarray | None = None
        self.feature_stds: np.ndarray | None = None
        self.last_trained_timestamp: str = ""
        self.train_sample_size: int = 0
        self.test_sample_size: int = 0
        self.is_initialized: bool = False

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = ModelService()
            cls._instance.train_and_evaluate()
        return cls._instance

    def train_and_evaluate(self) -> None:
        """Trains the scikit-learn pipeline on synthetic data and computes holdout metrics."""
        X, y = generate_synthetic_dataset(n_samples=5000, seed=self.seed)

        # Stratified holdout split: 80% train (4000), 20% test (1000)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=self.seed, stratify=y
        )

        self.train_sample_size = len(X_train)
        self.test_sample_size = len(X_test)

        # Scikit-learn Pipeline with StandardScaler and Logistic Regression
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            (
                "classifier",
                LogisticRegression(
                    random_state=self.seed,
                    max_iter=1000,
                    C=1.0,
                    solver="lbfgs",
                ),
            ),
        ])

        pipeline.fit(X_train, y_train)
        self.pipeline = pipeline

        # Extract scaler statistics and linear model coefficients
        scaler: StandardScaler = pipeline.named_steps["scaler"]
        classifier: LogisticRegression = pipeline.named_steps["classifier"]

        self.feature_means = scaler.mean_
        self.feature_stds = scaler.scale_
        self.intercept = float(classifier.intercept_[0])

        coeffs = classifier.coef_[0]
        self.feature_coefficients = {
            name: float(round(coeff, 4))
            for name, coeff in zip(FEATURE_NAMES, coeffs)
        }

        # Evaluate on the holdout test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))

        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

        positive_pct = float(np.mean(y) * 100.0)

        self.metrics = EvaluationMetrics(
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1_score=round(f1, 4),
            roc_auc=round(auc, 4),
            confusion_matrix={
                "true_positive": int(tp),
                "false_positive": int(fp),
                "true_negative": int(tn),
                "false_negative": int(fn),
            },
            test_sample_size=self.test_sample_size,
            train_sample_size=self.train_sample_size,
            class_distribution_positive_pct=round(positive_pct, 1),
        )

        self.last_trained_timestamp = datetime.now(timezone.utc).isoformat()
        self.is_initialized = True

    def predict(
        self,
        age: int,
        heart_rate: float,
        respiratory_rate: float,
        oxygen_saturation: float,
        body_temperature: float,
        systolic_blood_pressure: float,
    ) -> tuple[float, str, list[FeatureContribution], list[ThresholdFlag], str]:
        """Calculates demonstration review priority score, category, transparent

        feature contributions, and illustrative threshold alerts.
        """
        if not self.is_initialized or self.pipeline is None:
            self.train_and_evaluate()

        raw_vector = np.array([
            age,
            heart_rate,
            respiratory_rate,
            oxygen_saturation,
            body_temperature,
            systolic_blood_pressure,
        ], dtype=float).reshape(1, -1)

        # Prediction probability
        proba = float(self.pipeline.predict_proba(raw_vector)[0, 1])
        bounded_score = max(0.0, min(1.0, float(round(proba, 4))))

        # Demonstration category mapping based on documented score boundaries
        if bounded_score >= 0.70:
            category = "Higher demonstration review priority"
        elif bounded_score >= 0.35:
            category = "Review suggested by demonstration model"
        else:
            category = "Routine demonstration review"

        # Calculate exact linear model standardized feature contributions
        # z_i = (x_i - mean_i) / std_i
        # logit_contribution_i = z_i * coef_i
        classifier: LogisticRegression = self.pipeline.named_steps["classifier"]
        coeffs = classifier.coef_[0]

        contributions: list[FeatureContribution] = []
        for i, name in enumerate(FEATURE_NAMES):
            x_val = float(raw_vector[0, i])
            mean_val = float(self.feature_means[i])
            std_val = float(self.feature_stds[i]) if self.feature_stds[i] != 0 else 1.0
            z_score = (x_val - mean_val) / std_val
            c_score = float(z_score * coeffs[i])
            meta = FEATURE_METADATA[name]

            if c_score > 0.15:
                direction = "increases_priority"
                explanation = (
                    f"{meta['display_name']} ({x_val} {meta['unit']}) shifted standardized input by {z_score:+.2f} std dev, "
                    f"increasing review log-odds contribution by {c_score:+.2f}."
                )
            elif c_score < -0.15:
                direction = "decreases_priority"
                explanation = (
                    f"{meta['display_name']} ({x_val} {meta['unit']}) is towards protective baseline ({z_score:+.2f} std dev), "
                    f"reducing review log-odds contribution by {c_score:+.2f}."
                )
            else:
                direction = "neutral"
                explanation = (
                    f"{meta['display_name']} ({x_val} {meta['unit']}) is near reference distribution mean, "
                    f"having minimal impact ({c_score:+.2f}) on the model score."
                )

            contributions.append(
                FeatureContribution(
                    feature_name=name,
                    display_name=meta["display_name"],
                    raw_value=round(x_val, 2),
                    unit=meta["unit"],
                    scaled_value=round(z_score, 3),
                    coefficient=round(float(coeffs[i]), 4),
                    contribution_score=round(c_score, 3),
                    direction=direction,
                    human_explanation=explanation,
                )
            )

        # Sort feature contributions by absolute impact descending
        contributions.sort(key=lambda item: abs(item.contribution_score), reverse=True)

        # Illustrative threshold flags (clinical guideline heuristics, clearly separate from ML)
        flags: list[ThresholdFlag] = []

        # Oxygen Saturation
        if oxygen_saturation < 92.0:
            flags.append(ThresholdFlag(
                metric_name="Oxygen Saturation",
                value=oxygen_saturation,
                threshold_rule="SpO2 < 92%",
                severity="concerning",
                message="Hypoxemic range flagged by illustrative guideline threshold (<92%).",
            ))
        elif oxygen_saturation < 95.0:
            flags.append(ThresholdFlag(
                metric_name="Oxygen Saturation",
                value=oxygen_saturation,
                threshold_rule="SpO2 92-94%",
                severity="caution",
                message="Sub-optimal saturation flagged by illustrative guideline threshold.",
            ))

        # Respiratory Rate
        if respiratory_rate > 24.0 or respiratory_rate < 10.0:
            flags.append(ThresholdFlag(
                metric_name="Respiratory Rate",
                value=respiratory_rate,
                threshold_rule="RR > 24 or < 10 breaths/min",
                severity="concerning",
                message="Tachypnea / severe bradypnea flagged by illustrative guideline rule.",
            ))
        elif respiratory_rate > 20.0 or respiratory_rate < 12.0:
            flags.append(ThresholdFlag(
                metric_name="Respiratory Rate",
                value=respiratory_rate,
                threshold_rule="RR 21-24 or 10-11 breaths/min",
                severity="caution",
                message="Mildly altered respiratory frequency flagged by illustrative threshold.",
            ))

        # Heart Rate
        if heart_rate > 115.0 or heart_rate < 48.0:
            flags.append(ThresholdFlag(
                metric_name="Heart Rate",
                value=heart_rate,
                threshold_rule="HR > 115 or < 48 bpm",
                severity="concerning",
                message="Marked tachycardia or bradycardia flagged by illustrative threshold.",
            ))
        elif heart_rate > 100.0 or heart_rate < 55.0:
            flags.append(ThresholdFlag(
                metric_name="Heart Rate",
                value=heart_rate,
                threshold_rule="HR 101-115 or 50-54 bpm",
                severity="caution",
                message="Borderline heart rate flagged by illustrative threshold.",
            ))

        # Systolic BP
        if systolic_blood_pressure < 90.0:
            flags.append(ThresholdFlag(
                metric_name="Systolic Blood Pressure",
                value=systolic_blood_pressure,
                threshold_rule="SBP < 90 mmHg",
                severity="concerning",
                message="Hypotensive range flagged by illustrative threshold rule (<90 mmHg).",
            ))
        elif systolic_blood_pressure > 180.0 or systolic_blood_pressure < 100.0:
            flags.append(ThresholdFlag(
                metric_name="Systolic Blood Pressure",
                value=systolic_blood_pressure,
                threshold_rule="SBP > 180 or 90-99 mmHg",
                severity="caution",
                message="Hypertensive urgency range or borderline hypotension flagged.",
            ))

        # Temperature
        if body_temperature > 38.6 or body_temperature < 35.5:
            flags.append(ThresholdFlag(
                metric_name="Body Temperature",
                value=body_temperature,
                threshold_rule="Temp > 38.6°C or < 35.5°C",
                severity="concerning",
                message="High fever or hypothermia range flagged by illustrative threshold.",
            ))
        elif body_temperature > 38.0:
            flags.append(ThresholdFlag(
                metric_name="Body Temperature",
                value=body_temperature,
                threshold_rule="Temp 38.1 - 38.6°C",
                severity="caution",
                message="Low-grade pyrexia flagged by illustrative threshold.",
            ))

        # Human-readable interpretation explanation
        top_driver = contributions[0]
        interpretation = (
            f"Demonstration score is {bounded_score:.2f} ({category}). "
            f"The primary contributing feature in the fitted linear model is {top_driver.display_name} "
            f"({top_driver.raw_value} {top_driver.unit}), having a contribution score of {top_driver.contribution_score:+.2f}. "
            f"Total active illustrative threshold alerts: {len(flags)}."
        )

        return bounded_score, category, contributions, flags, interpretation

    def get_model_card(self) -> ModelCardResponse:
        """Returns comprehensive metadata, training details, holdout evaluation metrics,

        and safety notices.
        """
        if not self.is_initialized or self.metrics is None:
            self.train_and_evaluate()

        input_feature_specs = [
            {
                "feature_name": name,
                "display_name": FEATURE_METADATA[name]["display_name"],
                "unit": FEATURE_METADATA[name]["unit"],
                "reference_range": FEATURE_METADATA[name]["normal_range"],
            }
            for name in FEATURE_NAMES
        ]

        limitations = [
            "Trained solely on synthetic data generated from mathematical distributions and composite early warning heuristics.",
            "Not validated on real clinical EHR, bedside telemetry, or real patient populations.",
            "Cannot and does not diagnose disease, predict actual patient mortality, or replace clinical evaluation.",
            "Does not account for longitudinal trends, patient comorbidity, laboratory biomarkers, or medication context.",
            "Feature contributions represent linear model log-odds associations on standardized inputs, NOT physiological causality.",
            "Educational and hackathon submission demonstration only. Prohibited for real clinical use.",
        ]

        safety_notice = (
            "IMPORTANT: CarePulse AI is an educational demonstration assistant developed for "
            "the AI/ML in Healthcare Hackathon. All predictions are strictly Demonstration Review Priorities "
            "derived from synthetic statistical distributions. The system does NOT provide medical advice, "
            "clinical diagnosis, prognosis, or therapeutic treatment recommendations."
        )

        return ModelCardResponse(
            model_name="CarePulse AI Review Priority Classifier",
            model_version=self.model_version,
            model_architecture="StandardScaler + LogisticRegression (L2 regularization, solver='lbfgs')",
            pipeline_components=["sklearn.preprocessing.StandardScaler", "sklearn.linear_model.LogisticRegression"],
            input_features=input_feature_specs,
            target_definition="Synthetic observation review priority classification (1: Review priority, 0: Routine)",
            synthetic_generation_methodology=(
                "5,000 synthetic patient observations generated using physiological distributions with physiological "
                "derangement heuristics (NEWS2-inspired SpO2, RR, HR, BP, Temp deviations) plus Gaussian perturbation noise. "
                "Stratified 80/20 train/test split with fixed random seed (42)."
            ),
            training_procedure="Supervised binary classification fit on 4,000 training samples with L2 penalty (C=1.0).",
            evaluation_metrics=self.metrics,
            feature_coefficients=self.feature_coefficients,
            intercept=round(self.intercept, 4),
            limitations=limitations,
            clinical_safety_notice=safety_notice,
            last_trained_timestamp=self.last_trained_timestamp,
        )
