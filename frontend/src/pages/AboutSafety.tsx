import React from "react";
import {
  Activity,
  AlertTriangle,
  Code2,
  Info,
  ShieldAlert,
} from "lucide-react";

export const AboutSafety: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Info size={26} color="#0284c7" aria-hidden="true" />
          About CarePulse AI & Clinical Safety Framework
        </h1>
        <p className="page-description">
          Educational hackathon demonstration guidelines, synthetic data provenance, ethical AI guardrails, and security architecture.
        </p>
      </div>

      {/* Primary Mission Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Activity size={18} color="#0284c7" aria-hidden="true" />
            Product Purpose & Challenge Alignment
          </h2>
        </div>
        <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.6, marginBottom: "1rem" }}>
          <strong>CarePulse AI</strong> is an explainable patient monitoring and early-warning demonstration assistant built for the <strong>AI/ML in Healthcare</strong> challenge. The mission is to demonstrate how modern machine learning pipelines can turn complex patient observation streams into an understandable, transparent workflow for healthcare teams—enabling early identification of concerning patterns while maintaining full explainability.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", color: "#0f172a", marginBottom: "0.35rem" }}>
              Patient Monitoring
            </strong>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
              Simulates multi-patient bed telemetry tracking vital signs trends and automated priority queues.
            </p>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", color: "#0f172a", marginBottom: "0.35rem" }}>
              Transparent ML Explanations
            </strong>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
              Deconstructs model log-odds into standardized feature contributions so every prediction is inspectable.
            </p>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <strong style={{ display: "block", color: "#0f172a", marginBottom: "0.35rem" }}>
              Guideline Threshold Flags
            </strong>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
              Distinguishes statistical model output from clinical guideline heuristic thresholds (e.g. SpO2 &lt; 92%).
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Ethics Card */}
      <div className="card" style={{ borderLeft: "4px solid #d97706" }}>
        <div className="card-header">
          <h2 className="card-title">
            <ShieldAlert size={18} color="#d97706" aria-hidden="true" />
            Clinical Safety & Ethical AI Guardrails
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", color: "#334155" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Exclusively Synthetic Data:</strong> No real patient names, protected health information (PHI), or confidential clinical records are used or stored.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Demonstration Review Priorities, Not Medical Diagnosis:</strong> Model outputs are explicitly labeled as Demonstration Review Priorities. The application never claims to diagnose disease, predict mortality, replace clinical judgment, or prescribe medications.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Correlation vs Causation:</strong> Linear feature contributions indicate statistical association in the fitted model rather than physiological causality.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>No Unsafe Assessment Persistence:</strong> The backend does not store or database assessment payloads by default, preventing sensitive telemetry leakage.
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Tech Stack Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Code2 size={18} color="#0284c7" aria-hidden="true" />
            Full-Stack Architecture & Security
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", fontSize: "0.85rem" }}>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Backend & Machine Learning
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.3rem", color: "#475569" }}>
              <li>FastAPI web service with lifespan startup hook</li>
              <li>Scikit-Learn Logistic Regression with StandardScaler</li>
              <li>Pydantic schemas with strict bounds & NaN/inf rejection</li>
              <li>Hardened security headers (CSP, HSTS, X-Content-Type)</li>
              <li>Payload body size limits (256 KB max)</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Frontend User Interface
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.3rem", color: "#475569" }}>
              <li>React 18 + TypeScript + Vite single-page application</li>
              <li>Recharts interactive longitudinal telemetry visualization</li>
              <li>Lucide React iconography with accessible color-safe badges</li>
              <li>Responsive layout adapting seamlessly to mobile and desktop</li>
              <li>Strict WCAG AA accessibility compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
