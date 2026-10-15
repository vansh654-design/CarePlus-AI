import {
  AssessmentRequest,
  AssessmentResponse,
  DashboardSummary,
  HealthResponse,
  ModelCardResponse,
  PatientRecord,
  PatientSummary,
} from "../types";

export class ApiError extends Error {
  status: number;
  errorCode?: string;
  details?: unknown;

  constructor(message: string, status: number, errorCode?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData: { detail?: string; error_code?: string; errors?: unknown } = {};
      try {
        errorData = await response.json();
      } catch {
        // Fallback for non-JSON responses
      }
      throw new ApiError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status,
        errorData.error_code,
        errorData.errors
      );
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error or backend unreachable.";
    throw new ApiError(
      `Unable to communicate with the CarePulse AI backend service: ${message}`,
      0,
      "NETWORK_ERROR"
    );
  }
}

export const apiService = {
  getHealth: (): Promise<HealthResponse> => request<HealthResponse>("/health"),

  getDashboard: (): Promise<DashboardSummary> => request<DashboardSummary>("/v1/dashboard"),

  getPatients: (
    search?: string,
    category?: string,
    sortBy: string = "priority_desc"
  ): Promise<PatientSummary[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append("search", search.trim());
    if (category && category.trim()) params.append("category", category.trim());
    if (sortBy) params.append("sort_by", sortBy);
    const qs = params.toString();
    return request<PatientSummary[]>(`/v1/patients${qs ? `?${qs}` : ""}`);
  },

  getPatientDetails: (patientId: string): Promise<PatientRecord> =>
    request<PatientRecord>(`/v1/patients/${encodeURIComponent(patientId)}`),

  submitAssessment: (data: AssessmentRequest): Promise<AssessmentResponse> =>
    request<AssessmentResponse>("/v1/assessments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getModelCard: (): Promise<ModelCardResponse> => request<ModelCardResponse>("/v1/model-card"),
};
