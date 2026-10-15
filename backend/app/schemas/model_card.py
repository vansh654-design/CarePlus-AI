"""Schemas for model card and transparency endpoint."""

from pydantic import BaseModel, ConfigDict


class EvaluationMetrics(BaseModel):
    """Real computed holdout metrics on the synthetic test split."""

    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: dict[str, int]  # tp, fp, tn, fn
    test_sample_size: int
    train_sample_size: int
    class_distribution_positive_pct: float


class ModelCardResponse(BaseModel):
    """Detailed model metadata, methodology, metrics, and limitations."""

    model_config = ConfigDict(protected_namespaces=())

    model_name: str
    model_version: str
    model_architecture: str
    pipeline_components: list[str]
    input_features: list[dict[str, str]]
    target_definition: str
    synthetic_generation_methodology: str
    training_procedure: str
    evaluation_metrics: EvaluationMetrics
    feature_coefficients: dict[str, float]
    intercept: float
    limitations: list[str]
    clinical_safety_notice: str
    last_trained_timestamp: str
