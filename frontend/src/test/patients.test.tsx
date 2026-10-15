import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { PatientMonitoring } from "../pages/PatientMonitoring";
import { apiService } from "../services/api";
import { PatientSummary } from "../types";

vi.mock("../services/api");

const mockPatientsList: PatientSummary[] = [
  {
    id: "DEMO-001",
    display_code: "SYN-PT-101",
    age: 68,
    biological_sex: "Female",
    unit: "Respiratory Care Unit",
    current_vital_signs: {
      heart_rate: 108.0,
      respiratory_rate: 26.0,
      oxygen_saturation: 89.5,
      body_temperature: 38.4,
      systolic_blood_pressure: 105.0,
    },
    demonstration_category: "Higher demonstration review priority",
    review_priority_score: 0.91,
    illustrative_flags: ["SpO2 < 92% (Concerning)"],
    last_updated: "2026-10-15T02:00:00Z",
  },
  {
    id: "DEMO-002",
    display_code: "SYN-PT-102",
    age: 54,
    biological_sex: "Male",
    unit: "Cardiology Step-Down",
    current_vital_signs: {
      heart_rate: 72.0,
      respiratory_rate: 16.0,
      oxygen_saturation: 98.0,
      body_temperature: 36.8,
      systolic_blood_pressure: 124.0,
    },
    demonstration_category: "Routine demonstration review",
    review_priority_score: 0.11,
    illustrative_flags: [],
    last_updated: "2026-10-15T00:00:00Z",
  },
];

describe("PatientMonitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("4 & 5. Lists patients and triggers search and filters", async () => {
    vi.mocked(apiService.getPatients).mockResolvedValue(mockPatientsList);

    render(
      <BrowserRouter>
        <PatientMonitoring />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("DEMO-001")).toBeInTheDocument();
      expect(screen.getByText("DEMO-002")).toBeInTheDocument();
    });

    // Test filter change
    const categorySelect = screen.getByLabelText("Filter by Demonstration Category");
    userEvent.selectOptions(categorySelect, "Higher demonstration review priority");

    await waitFor(() => {
      expect(apiService.getPatients).toHaveBeenCalledWith(
        "",
        "Higher demonstration review priority",
        "priority_desc"
      );
    });
  });

  it("12. Renders clean empty search state when no records match", async () => {
    vi.mocked(apiService.getPatients).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <PatientMonitoring />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Matching Synthetic Records Found")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Clear Filters & View All/i })).toBeInTheDocument();
  });
});
