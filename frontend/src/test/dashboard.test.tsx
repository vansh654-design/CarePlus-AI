import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { OverviewDashboard } from "../pages/OverviewDashboard";
import { apiService } from "../services/api";
import { DashboardSummary, PatientSummary } from "../types";

vi.mock("../services/api");

const mockDashboardData: DashboardSummary = {
  total_patients: 14,
  routine_count: 7,
  review_suggested_count: 4,
  higher_priority_count: 3,
  active_alerts_count: 9,
  average_vitals: {
    oxygen_saturation: 94.8,
    heart_rate: 85.2,
    respiratory_rate: 18.4,
    systolic_blood_pressure: 124.6,
    body_temperature: 37.2,
  },
  recent_events: [
    {
      timestamp: "2026-10-15T02:15:00Z",
      patient_id: "DEMO-008",
      event_type: "Priority Escalation",
      summary: "Synthetic observation priority escalated to Higher.",
    },
  ],
  disclaimer: "All data is synthetic for demonstration.",
  timestamp: "2026-10-15T02:30:00Z",
};

const mockPatients: PatientSummary[] = [
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
];

describe("OverviewDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1 & 2. Displays loading state and renders meaningful dashboard content", async () => {
    vi.mocked(apiService.getDashboard).mockResolvedValue(mockDashboardData);
    vi.mocked(apiService.getPatients).mockResolvedValue(mockPatients);

    render(
      <BrowserRouter>
        <OverviewDashboard />
      </BrowserRouter>
    );

    // Initial loading state visible
    expect(screen.getByRole("status")).toHaveTextContent("Loading CarePulse AI Dashboard...");

    // After loading resolves
    await waitFor(() => {
      expect(screen.getByText("Patient Monitoring Overview")).toBeInTheDocument();
    });

    expect(screen.getByText("14")).toBeInTheDocument(); // Total monitored
    expect(screen.getByText("DEMO-001")).toBeInTheDocument();
    expect(screen.getByText("DEMO-008 • Priority Escalation")).toBeInTheDocument();
    expect(screen.getByText("Avg SpO2")).toBeInTheDocument();
  });

  it("3. Displays accessible error state when backend communication fails", async () => {
    vi.mocked(apiService.getDashboard).mockRejectedValue(
      new Error("Unable to connect to backend")
    );
    vi.mocked(apiService.getPatients).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <OverviewDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/Backend Communication Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to backend/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry Connection/i })).toBeInTheDocument();
  });
});
