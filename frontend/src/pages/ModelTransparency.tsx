import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { ModelCardResponse } from "../types";
import {
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  Code2,
  FileCheck,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { formatDateTime } from "../utils/formatters";

export const ModelTransparency: React.FC = () => {
  const [modelCard, setModelCard] = useState<ModelCardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModelCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getModelCard();
      setModelCard(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to retrieve model card and evaluation metrics from backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelCard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }} role="status">
        <RefreshCw size={32} className="spinning" style={{ margin: "0 auto 1rem", color: "#0284c7" }} />
        <h2 style={{ fontSize: "1.25rem", color: "#0f172a" }}>Loading Model Card & Metrics...</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Retrieving real scikit-learn holdout evaluation results and feature weights
        </p>
      </div>
    );
  }

  if (error || !modelCard) {
    return (
      <div className="alert-box alert-danger" role="alert">
        <AlertCircle size={22} style={{ flexShrink: 0 }} />
        <div>
          <strong>Error Loading Model Transparency Data</strong>
          <p style={{ marginTop: "0.25rem" }}>{error}</p>
          <button onClick={fetchModelCard} className="btn btn-secondary" style={{ marginTop: "0.75rem" }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const m = modelCard.evaluation_metrics;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <BrainCircuit size={26} color="#0284c7" aria-hidden="true" />
          Model Transparency & Evaluation Card
        </h1>
        <p className="page-description">
          Inspect the architecture, training methodology, holdout test metrics, feature weights, and explicit limitations of the CarePulse AI model.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="alert-box alert-danger" style={{ marginBottom: "1.5rem" }} role="region" aria-label="Model Safety Warning">
        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: "0.95rem" }}>Clinical Safety Statement:</strong>
          <p style={{ marginTop: "0.25rem", fontSize: "0.84rem", lineHeight: 1.5 }}>
            {modelCard.clinical_safety_notice}
          </p>
        </div>
      </div>

      {/* Real Computed Metrics Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <FileCheck size={18} color="#059669" aria-hidden="true" />
            Measured Holdout Evaluation Metrics
          </h2>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Stratified 20% holdout split (N = {m.test_sample_size})
          </span>
        </div>

        <div className="kpi-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="kpi-card" style={{ borderTop: "3px solid #0284c7" }}>
            <div className="kpi-label">ROC AUC Score</div>
            <div className="kpi-value" style={{ color: "#0284c7" }}>
              {(m.roc_auc * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">Area under ROC curve: {m.roc_auc}</div>
          </div>

          <div className="kpi-card" style={{ borderTop: "3px solid #059669" }}>
            <div className="kpi-label">Test Accuracy</div>
            <div className="kpi-value" style={{ color: "#059669" }}>
              {(m.accuracy * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">Overall correct classifications</div>
          </div>

          <div className="kpi-card" style={{ borderTop: "3px solid #8b5cf6" }}>
            <div className="kpi-label">F1 Score</div>
            <div className="kpi-value" style={{ color: "#8b5cf6" }}>
              {(m.f1_score * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">Harmonic mean of precision & recall</div>
          </div>

          <div className="kpi-card" style={{ borderTop: "3px solid #d97706" }}>
            <div className="kpi-label">Precision</div>
            <div className="kpi-value" style={{ color: "#d97706" }}>
              {(m.precision * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">Positive predictive value</div>
          </div>

          <div className="kpi-card" style={{ borderTop: "3px solid #ec4899" }}>
            <div className="kpi-label">Recall (Sensitivity)</div>
            <div className="kpi-value" style={{ color: "#ec4899" }}>
              {(m.recall * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">True positive detection rate</div>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
            Holdout Test Confusion Matrix
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", textAlign: "center" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>True Positives (TP)</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{m.confusion_matrix.true_positive}</div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Correctly identified priority</span>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>True Negatives (TN)</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{m.confusion_matrix.true_negative}</div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Correctly identified routine</span>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 700 }}>False Positives (FP)</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{m.confusion_matrix.false_positive}</div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Routine flagged as priority</span>
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>False Negatives (FN)</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{m.confusion_matrix.false_negative}</div>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Priority classified as routine</span>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.75rem", marginBottom: 0 }}>
            Training samples: {m.train_sample_size.toLocaleString()} • Test samples: {m.test_sample_size.toLocaleString()} • Positive prevalence: {m.class_distribution_positive_pct}%
          </p>
        </div>
      </div>

      {/* Model Specification and Feature Weights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Architecture & Training Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Code2 size={18} color="#0284c7" aria-hidden="true" />
              Pipeline Architecture
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.84rem" }}>
            <div>
              <strong style={{ color: "#0f172a", display: "block" }}>Model Name & Version:</strong>
              <span style={{ color: "#475569" }}>{modelCard.model_name} (v{modelCard.model_version})</span>
            </div>

            <div>
              <strong style={{ color: "#0f172a", display: "block" }}>Scikit-Learn Pipeline:</strong>
              <code style={{ display: "block", backgroundColor: "#f1f5f9", padding: "0.4rem 0.6rem", borderRadius: "4px", fontSize: "0.785rem", marginTop: "0.25rem" }}>
                {modelCard.model_architecture}
              </code>
            </div>

            <div>
              <strong style={{ color: "#0f172a", display: "block" }}>Synthetic Target Definition:</strong>
              <p style={{ color: "#475569", margin: "0.2rem 0 0 0" }}>{modelCard.target_definition}</p>
            </div>

            <div>
              <strong style={{ color: "#0f172a", display: "block" }}>Synthetic Dataset Generation:</strong>
              <p style={{ color: "#475569", margin: "0.2rem 0 0 0" }}>{modelCard.synthetic_generation_methodology}</p>
            </div>

            <div>
              <strong style={{ color: "#0f172a", display: "block" }}>Last Trained Timestamp:</strong>
              <span style={{ color: "#475569" }}>{formatDateTime(modelCard.last_trained_timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Linear Model Feature Coefficients */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Sliders size={18} color="#0284c7" aria-hidden="true" />
              Fitted Model Coefficients
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Intercept: {modelCard.intercept}
            </span>
          </div>

          <div className="table-container">
            <table className="data-table" aria-label="Feature coefficients of the logistic regression pipeline">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Normal Range</th>
                  <th scope="col" style={{ textAlign: "right" }}>Coefficient</th>
                </tr>
              </thead>
              <tbody>
                {modelCard.input_features.map((feat) => {
                  const coeff = modelCard.feature_coefficients[feat.feature_name];
                  return (
                    <tr key={feat.feature_name}>
                      <td style={{ fontWeight: 600 }}>{feat.display_name}</td>
                      <td>{feat.unit}</td>
                      <td>{feat.reference_range}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: coeff > 0 ? "#dc2626" : "#059669" }}>
                        {coeff !== undefined ? (coeff > 0 ? `+${coeff.toFixed(4)}` : coeff.toFixed(4)) : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.75rem", marginBottom: 0 }}>
            Positive coefficients indicate higher standardized values increase review priority log-odds; negative coefficients (e.g. SpO2) indicate higher values reduce priority.
          </p>
        </div>
      </div>

      {/* Model Limitations Panel */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <h2 className="card-title">
            <AlertTriangle size={18} color="#d97706" aria-hidden="true" />
            Explicit Model & Technical Limitations
          </h2>
        </div>

        <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "#334155" }}>
          {modelCard.limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
