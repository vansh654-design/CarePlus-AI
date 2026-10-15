import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import App from "../App";
import { apiService } from "../services/api";

vi.mock("../services/api");

describe("Navigation", () => {
  it("10. Navigation bar links navigate across application views", async () => {
    vi.mocked(apiService.getDashboard).mockResolvedValue({
      total_patients: 14,
      routine_count: 7,
      review_suggested_count: 4,
      higher_priority_count: 3,
      active_alerts_count: 9,
      average_vitals: { oxygen_saturation: 95.0, heart_rate: 80.0, respiratory_rate: 16.0, systolic_blood_pressure: 120.0, body_temperature: 37.0 },
      recent_events: [],
      disclaimer: "Synthetic demonstration data",
      timestamp: "2026-10-15T02:00:00Z",
    });
    vi.mocked(apiService.getPatients).mockResolvedValue([]);
    vi.mocked(apiService.getModelCard).mockResolvedValue({
      model_name: "Test",
      model_version: "1.0.0",
      model_architecture: "LR",
      pipeline_components: [],
      input_features: [],
      target_definition: "Target",
      synthetic_generation_methodology: "Method",
      training_procedure: "Train",
      evaluation_metrics: {
        accuracy: 0.9,
        precision: 0.9,
        recall: 0.9,
        f1_score: 0.9,
        roc_auc: 0.95,
        confusion_matrix: { true_positive: 10, false_positive: 1, true_negative: 20, false_negative: 1 },
        test_sample_size: 32,
        train_sample_size: 100,
        class_distribution_positive_pct: 30,
      },
      feature_coefficients: {},
      intercept: 0,
      limitations: ["Test limit"],
      clinical_safety_notice: "Notice",
      last_trained_timestamp: "",
    });

    render(<App />);

    // Check navbar brand & persistent disclaimer
    expect(screen.getAllByText(/CarePulse AI/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/EDUCATIONAL DEMONSTRATION ONLY/i)).toBeInTheDocument();

    // Navigate to About & Safety
    const aboutLink = screen.getByRole("link", { name: /About & Safety/i });
    userEvent.click(aboutLink);

    expect(await screen.findByText(/About CarePulse AI & Clinical Safety Framework/i)).toBeInTheDocument();

    // Navigate to New Assessment
    const assessmentLink = screen.getByRole("link", { name: /New Assessment/i });
    userEvent.click(assessmentLink);

    expect(await screen.findByText(/Interactive Vital Signs Assessment/i)).toBeInTheDocument();
  });
});
