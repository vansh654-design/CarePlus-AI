import React, { useState } from "react";
import { apiService } from "../services/api";
import { AssessmentRequest, AssessmentResponse } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { FeatureImpactBar } from "../components/FeatureImpactBar";
import { downloadJson, formatDateTime } from "../utils/formatters";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  FilePlus2,
  HelpCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

interface FormErrors {
  age?: string;
  heart_rate?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  body_temperature?: string;
  systolic_blood_pressure?: string;
}

export const NewAssessment: React.FC = () => {
  const [formData, setFormData] = useState<AssessmentRequest>({
    age: 65,
    heart_rate: 98,
    respiratory_rate: 22,
    oxygen_saturation: 93,
    body_temperature: 37.8,
    systolic_blood_pressure: 110,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResponse | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      newErrors.age = "Age must be an integer between 1 and 120.";
    }
    if (isNaN(formData.heart_rate) || formData.heart_rate < 30 || formData.heart_rate > 260) {
      newErrors.heart_rate = "Heart rate must be between 30 and 260 bpm.";
    }
    if (isNaN(formData.respiratory_rate) || formData.respiratory_rate < 4 || formData.respiratory_rate > 60) {
      newErrors.respiratory_rate = "Respiratory rate must be between 4 and 60 breaths/min.";
    }
    if (isNaN(formData.oxygen_saturation) || formData.oxygen_saturation < 50 || formData.oxygen_saturation > 100) {
      newErrors.oxygen_saturation = "Oxygen saturation (SpO2) must be between 50% and 100%.";
    }
    if (isNaN(formData.body_temperature) || formData.body_temperature < 30 || formData.body_temperature > 45) {
      newErrors.body_temperature = "Body temperature must be between 30.0°C and 45.0°C.";
    }
    if (isNaN(formData.systolic_blood_pressure) || formData.systolic_blood_pressure < 50 || formData.systolic_blood_pressure > 300) {
      newErrors.systolic_blood_pressure = "Systolic BP must be between 50 and 300 mmHg.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AssessmentRequest, value: string) => {
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  const handlePreset = (preset: "normal" | "moderate" | "severe") => {
    if (preset === "normal") {
      setFormData({
        age: 48,
        heart_rate: 72,
        respiratory_rate: 15,
        oxygen_saturation: 98.5,
        body_temperature: 36.8,
        systolic_blood_pressure: 122,
      });
    } else if (preset === "moderate") {
      setFormData({
        age: 67,
        heart_rate: 98,
        respiratory_rate: 22,
        oxygen_saturation: 93.5,
        body_temperature: 37.9,
        systolic_blood_pressure: 145,
      });
    } else if (preset === "severe") {
      setFormData({
        age: 82,
        heart_rate: 118,
        respiratory_rate: 28,
        oxygen_saturation: 88.0,
        body_temperature: 38.9,
        systolic_blood_pressure: 88,
      });
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const response = await apiService.submitAssessment({
        age: Math.round(formData.age),
        heart_rate: formData.heart_rate,
        respiratory_rate: formData.respiratory_rate,
        oxygen_saturation: formData.oxygen_saturation,
        body_temperature: formData.body_temperature,
        systolic_blood_pressure: formData.systolic_blood_pressure,
      });
      setResult(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with assessment endpoint. Please check if the backend is running.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    downloadJson(result, `carepulse-assessment-${result.assessment_id}.json`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <FilePlus2 size={26} color="#0284c7" aria-hidden="true" />
          Interactive Vital Signs Assessment
        </h1>
        <p className="page-description">
          Submit physiological telemetry to the real scikit-learn model to observe review priority scoring and transparent feature explanations.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Form Panel */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Activity size={18} color="#0284c7" aria-hidden="true" />
              Patient Observation Inputs
            </h2>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => handlePreset("normal")}
              >
                Normal
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => handlePreset("moderate")}
              >
                Moderate
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => handlePreset("severe")}
              >
                Severe
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Age */}
            <div className="form-group">
              <label htmlFor="input-age" className="form-label">
                Age (years)
              </label>
              <input
                id="input-age"
                type="number"
                className={`form-input ${errors.age ? "is-invalid" : ""}`}
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                min={1}
                max={120}
                required
              />
              <div className="form-hint">Valid range: 1 - 120 years.</div>
              {errors.age && <div className="form-error"><AlertCircle size={14} /> {errors.age}</div>}
            </div>

            {/* Heart Rate */}
            <div className="form-group">
              <label htmlFor="input-hr" className="form-label">
                Heart Rate (beats per minute)
              </label>
              <input
                id="input-hr"
                type="number"
                step="0.1"
                className={`form-input ${errors.heart_rate ? "is-invalid" : ""}`}
                value={formData.heart_rate}
                onChange={(e) => handleInputChange("heart_rate", e.target.value)}
                min={30}
                max={260}
                required
              />
              <div className="form-hint">Standard adult reference: 60 - 100 bpm.</div>
              {errors.heart_rate && <div className="form-error"><AlertCircle size={14} /> {errors.heart_rate}</div>}
            </div>

            {/* Respiratory Rate */}
            <div className="form-group">
              <label htmlFor="input-rr" className="form-label">
                Respiratory Rate (breaths per minute)
              </label>
              <input
                id="input-rr"
                type="number"
                step="0.1"
                className={`form-input ${errors.respiratory_rate ? "is-invalid" : ""}`}
                value={formData.respiratory_rate}
                onChange={(e) => handleInputChange("respiratory_rate", e.target.value)}
                min={4}
                max={60}
                required
              />
              <div className="form-hint">Standard adult reference: 12 - 20 breaths/min.</div>
              {errors.respiratory_rate && <div className="form-error"><AlertCircle size={14} /> {errors.respiratory_rate}</div>}
            </div>

            {/* Oxygen Saturation */}
            <div className="form-group">
              <label htmlFor="input-spo2" className="form-label">
                Oxygen Saturation (SpO2 %)
              </label>
              <input
                id="input-spo2"
                type="number"
                step="0.1"
                className={`form-input ${errors.oxygen_saturation ? "is-invalid" : ""}`}
                value={formData.oxygen_saturation}
                onChange={(e) => handleInputChange("oxygen_saturation", e.target.value)}
                min={50}
                max={100}
                required
              />
              <div className="form-hint">Normal target: 95% - 100%. Guideline threshold: &lt;92%.</div>
              {errors.oxygen_saturation && <div className="form-error"><AlertCircle size={14} /> {errors.oxygen_saturation}</div>}
            </div>

            {/* Body Temperature */}
            <div className="form-group">
              <label htmlFor="input-temp" className="form-label">
                Body Temperature (°C)
              </label>
              <input
                id="input-temp"
                type="number"
                step="0.1"
                className={`form-input ${errors.body_temperature ? "is-invalid" : ""}`}
                value={formData.body_temperature}
                onChange={(e) => handleInputChange("body_temperature", e.target.value)}
                min={30}
                max={45}
                required
              />
              <div className="form-hint">Normothermic range: 36.5°C - 37.5°C.</div>
              {errors.body_temperature && <div className="form-error"><AlertCircle size={14} /> {errors.body_temperature}</div>}
            </div>

            {/* Systolic Blood Pressure */}
            <div className="form-group">
              <label htmlFor="input-sbp" className="form-label">
                Systolic Blood Pressure (mmHg)
              </label>
              <input
                id="input-sbp"
                type="number"
                step="0.1"
                className={`form-input ${errors.systolic_blood_pressure ? "is-invalid" : ""}`}
                value={formData.systolic_blood_pressure}
                onChange={(e) => handleInputChange("systolic_blood_pressure", e.target.value)}
                min={50}
                max={300}
                required
              />
              <div className="form-hint">Normotensive reference: 100 - 130 mmHg.</div>
              {errors.systolic_blood_pressure && <div className="form-error"><AlertCircle size={14} /> {errors.systolic_blood_pressure}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="spinning" /> Evaluating with ML Pipeline...
                </>
              ) : (
                <>
                  <Send size={16} /> Run Model Assessment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {apiError && (
            <div className="alert-box alert-danger" role="alert">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Assessment Evaluation Failed</strong>
                <p style={{ marginTop: "0.25rem" }}>{apiError}</p>
              </div>
            </div>
          )}

          {!result && !apiError && (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <Sparkles size={36} color="#0284c7" style={{ margin: "0 auto 1rem auto" }} />
              <h2 style={{ fontSize: "1.15rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                Ready to Evaluate
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", maxWidth: "400px", margin: "0 auto" }}>
                Enter vital sign values or choose a preset on the left, then click "Run Model Assessment" to execute the real scikit-learn pipeline.
              </p>
            </div>
          )}

          {result && (
            <div className="card" role="region" aria-live="polite" aria-label="Assessment Evaluation Results">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    <CheckCircle size={18} color="#059669" aria-hidden="true" />
                    Model Assessment Results
                  </h2>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    ID: {result.assessment_id} • Model: {result.model_version}
                  </span>
                </div>
                <button
                  onClick={handleExportJson}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.8125rem", padding: "0.35rem 0.65rem" }}
                  aria-label="Export demonstration assessment as JSON"
                >
                  <Download size={14} /> Export JSON
                </button>
              </div>

              {/* Priority Score Header */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                    Demonstration Review Priority
                  </span>
                  <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1, margin: "0.35rem 0" }}>
                    {Math.round(result.demonstration_score * 100)}%
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Raw model score: {result.demonstration_score.toFixed(4)}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <StatusBadge category={result.demonstration_category} />
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
                    {formatDateTime(result.timestamp)}
                  </div>
                </div>
              </div>

              {/* Interpretation Summary */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>
                  Explanation & Score Interpretation
                </h3>
                <p style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.5 }}>
                  {result.score_interpretation}
                </p>
              </div>

              {/* Illustrative Threshold Flags */}
              {result.threshold_flags.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                    Illustrative Guideline Threshold Flags ({result.threshold_flags.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {result.threshold_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "6px",
                          backgroundColor: flag.severity === "concerning" ? "#fef2f2" : "#fffbeb",
                          border: `1px solid ${flag.severity === "concerning" ? "#fecaca" : "#fde68a"}`,
                          fontSize: "0.8125rem",
                        }}
                      >
                        <AlertTriangle
                          size={14}
                          color={flag.severity === "concerning" ? "#dc2626" : "#d97706"}
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        <div>
                          <strong style={{ color: flag.severity === "concerning" ? "#991b1b" : "#92400e" }}>
                            {flag.metric_name} ({flag.value}):
                          </strong>{" "}
                          <span style={{ color: "#334155" }}>{flag.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Contributions Waterfall */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
                    Standardized Feature Contributions (Model Log-Odds)
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Linear coefficients scaled by input z-scores
                  </span>
                </div>
                <FeatureImpactBar contributions={result.feature_contributions} />
              </div>

              {/* Safety Notice Box */}
              <div className="alert-box alert-info" style={{ margin: 0, fontSize: "0.785rem" }}>
                <HelpCircle size={16} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Clinical Safety Notice:</strong>
                  <p style={{ marginTop: "0.2rem" }}>{result.safety_disclaimer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
