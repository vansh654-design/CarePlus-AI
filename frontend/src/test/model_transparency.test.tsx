import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModelTransparency } from "../pages/ModelTransparency";
import { apiService } from "../services/api";
import { ModelCardResponse } from "../types";

vi.mock("../services/api");

const mockModelCard: ModelCardResponse = {
  model_name: "CarePulse AI Review Priority Classifier",
  model_version: "1.0.0-logistic-regression",
  model_architecture: "StandardScaler + LogisticRegression",
  pipeline_components: ["sklearn.preprocessing.StandardScaler", "sklearn.linear_model.LogisticRegression"],
  input_features: [
    {
      feature_name: "oxygen_saturation",
      display_name: "Oxygen Saturation (SpO2)",
      unit: "%",
      reference_range: "95 - 100",
    },
    {
      feature_name: "heart_rate",
      display_name: "Heart Rate",
      unit: "bpm",
      reference_range: "60 - 100",
    },
  ],
  target_definition: "Synthetic observation review priority classification",
  synthetic_generation_methodology: "5,000 synthetic patient observations generated using physiological distributions",
  training_procedure: "Supervised binary classification fit on 4,000 training samples",
  evaluation_metrics: {
    accuracy: 0.892,
    precision: 0.841,
    recall: 0.825,
    f1_score: 0.833,
    roc_auc: 0.941,
    confusion_matrix: {
      true_positive: 240,
      false_positive: 45,
      true_negative: 652,
      false_negative: 63,
    },
    test_sample_size: 1000,
    train_sample_size: 4000,
    class_distribution_positive_pct: 30.3,
  },
  feature_coefficients: {
    oxygen_saturation: -1.345,
    heart_rate: 0.842,
  },
  intercept: -0.612,
  limitations: [
    "Trained solely on synthetic data generated from mathematical distributions.",
    "Not validated on real clinical EHR or real patient populations.",
  ],
  clinical_safety_notice: "IMPORTANT: Educational demonstration only. Not for clinical decision-making.",
  last_trained_timestamp: "2026-10-15T02:00:00Z",
};

describe("ModelTransparency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("9 & 12. Displays real computed metrics, coefficients, and explicit limitations", async () => {
    vi.mocked(apiService.getModelCard).mockResolvedValue(mockModelCard);

    render(<ModelTransparency />);

    await waitFor(() => {
      expect(screen.getByText("Model Transparency & Evaluation Card")).toBeInTheDocument();
    });

    // Check real metrics render
    expect(screen.getByText("94.1%")).toBeInTheDocument(); // ROC AUC
    expect(screen.getByText("89.2%")).toBeInTheDocument(); // Accuracy
    expect(screen.getByText("240")).toBeInTheDocument(); // TP
    expect(screen.getByText("652")).toBeInTheDocument(); // TN

    // Check limitations are visible
    expect(screen.getByText("Trained solely on synthetic data generated from mathematical distributions.")).toBeInTheDocument();
    expect(screen.getByText("Not validated on real clinical EHR or real patient populations.")).toBeInTheDocument();
  });
});
