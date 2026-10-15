import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NewAssessment } from "../pages/NewAssessment";
import { apiService } from "../services/api";
import { AssessmentResponse } from "../types";
import * as formatters from "../utils/formatters";

vi.mock("../services/api");

const mockAssessmentResponse: AssessmentResponse = {
  assessment_id: "ASSESS-TEST12345",
  demonstration_score: 0.88,
  demonstration_category: "Higher demonstration review priority",
  model_version: "1.0.0-logistic-regression",
  input_summary: {
    age: 65,
    heart_rate: 110,
    respiratory_rate: 26,
    oxygen_saturation: 89,
    body_temperature: 38.5,
    systolic_blood_pressure: 95,
  },
  feature_contributions: [
    {
      feature_name: "oxygen_saturation",
      display_name: "Oxygen Saturation (SpO2)",
      raw_value: 89.0,
      unit: "%",
      scaled_value: -2.14,
      coefficient: -1.35,
      contribution_score: 2.89,
      direction: "increases_priority",
      human_explanation: "Oxygen Saturation (89.0 %) shifted standardized input by -2.14σ, increasing review log-odds contribution by +2.89.",
    },
  ],
  threshold_flags: [
    {
      metric_name: "Oxygen Saturation",
      value: 89.0,
      threshold_rule: "SpO2 < 92%",
      severity: "concerning",
      message: "Hypoxemic range flagged by illustrative guideline threshold (<92%).",
    },
  ],
  score_interpretation: "Demonstration score is 0.88 (Higher demonstration review priority).",
  safety_disclaimer: "EDUCATIONAL DEMONSTRATION NOTICE: For demonstration only.",
  timestamp: "2026-10-15T02:30:00Z",
};

describe("NewAssessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("6. Validates field inputs and displays error message for out-of-range values", async () => {
    render(<NewAssessment />);

    const ageInput = screen.getByLabelText("Age (years)");
    userEvent.clear(ageInput);
    userEvent.type(ageInput, "150"); // Invalid age > 120

    const submitBtn = screen.getByRole("button", { name: /Run Model Assessment/i });
    userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Age must be an integer between 1 and 120.")).toBeInTheDocument();
    });

    expect(apiService.submitAssessment).not.toHaveBeenCalled();
  });

  it("7 & 8. Valid form submission invokes API and displays results with explanations", async () => {
    vi.mocked(apiService.submitAssessment).mockResolvedValue(mockAssessmentResponse);

    render(<NewAssessment />);

    const submitBtn = screen.getByRole("button", { name: /Run Model Assessment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.submitAssessment).toHaveBeenCalled();
      expect(screen.getByText("Model Assessment Results")).toBeInTheDocument();
    });

    expect(screen.getByText("88%")).toBeInTheDocument(); // Score rounded percentage
    expect(screen.getByText(/ASSESS-TEST12345/i)).toBeInTheDocument();
    expect(screen.getByText(/Hypoxemic range flagged by illustrative guideline threshold/i)).toBeInTheDocument();
    expect(screen.getByText(/Oxygen Saturation \(SpO2\)/i)).toBeInTheDocument();
  });

  it("11. Export button triggers JSON export of assessment results", async () => {
    vi.mocked(apiService.submitAssessment).mockResolvedValue(mockAssessmentResponse);
    const downloadSpy = vi.spyOn(formatters, "downloadJson").mockImplementation(() => {});

    render(<NewAssessment />);

    const submitBtn = screen.getByRole("button", { name: /Run Model Assessment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Model Assessment Results")).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole("button", { name: /Export demonstration assessment as JSON/i });
    fireEvent.click(exportBtn);

    expect(downloadSpy).toHaveBeenCalledWith(
      mockAssessmentResponse,
      "carepulse-assessment-ASSESS-TEST12345.json"
    );
  });
});
