import React, { useEffect } from "react";
import { PatientRecord } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../utils/formatters";
import {
  Activity,
  AlertTriangle,
  Clock,
  Heart,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PatientDetailModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!patient) return null;

  // Prepare observation trend data for Recharts
  const trendData = patient.observation_history.map((obs) => ({
    time: formatDateTime(obs.timestamp),
    SpO2: obs.vital_signs.oxygen_saturation,
    HR: obs.vital_signs.heart_rate,
    SBP: obs.vital_signs.systolic_blood_pressure,
    RR: obs.vital_signs.respiratory_rate,
    Temp: obs.vital_signs.body_temperature,
    PriorityScore: Math.round(obs.demonstration_score * 100),
  }));

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "850px" }}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h2 id="patient-modal-title" className="card-title" style={{ fontSize: "1.25rem" }}>
                {patient.id} ({patient.display_code})
              </h2>
              <StatusBadge category={patient.demonstration_category} />
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>
              {patient.age} y/o {patient.biological_sex} • Unit: {patient.unit} • Admitted: {formatDateTime(patient.admission_timestamp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "0.4rem", borderRadius: "50%" }}
            aria-label="Close patient details modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Illustrative Threshold Flags */}
          {patient.illustrative_flags.length > 0 && (
            <div className="alert-box alert-danger" style={{ marginBottom: "1.25rem" }}>
              <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                  Active Illustrative Threshold Flags:
                </strong>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8125rem" }}>
                  {patient.illustrative_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Current Vital Signs Grid */}
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
            Current Observation Vitals
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Activity size={14} color="#0284c7" /> SpO2
              </span>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                {patient.current_vital_signs.oxygen_saturation}%
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Normal: 95-100%</span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Heart size={14} color="#ef4444" /> Heart Rate
              </span>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                {patient.current_vital_signs.heart_rate} bpm
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Normal: 60-100</span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Wind size={14} color="#8b5cf6" /> Resp Rate
              </span>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                {patient.current_vital_signs.respiratory_rate} /min
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Normal: 12-20</span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Activity size={14} color="#10b981" /> Systolic BP
              </span>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                {patient.current_vital_signs.systolic_blood_pressure} mmHg
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Normal: 100-130</span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Thermometer size={14} color="#f59e0b" /> Temp
              </span>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                {patient.current_vital_signs.body_temperature}°C
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Normal: 36.5-37.5</span>
            </div>
          </div>

          {/* Longitudinal Vital Trend Chart */}
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Longitudinal Vital Signs Trend
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "0.75rem" }}>
            Visualizes vital sign evolution across synthetic observation timepoints.
          </p>

          <div style={{ height: "240px", width: "100%", marginBottom: "1.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[30, 180]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }} />
                <Line type="monotone" dataKey="SpO2" stroke="#0284c7" strokeWidth={2} name="SpO2 (%)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="HR" stroke="#ef4444" strokeWidth={2} name="HR (bpm)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SBP" stroke="#10b981" strokeWidth={2} name="SBP (mmHg)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="RR" stroke="#8b5cf6" strokeWidth={2} name="RR (br/min)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Observation History Table */}
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Synthetic Observation History Log
          </h3>
          <div className="table-container">
            <table className="data-table" aria-label="Observation history records">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">SpO2</th>
                  <th scope="col">HR</th>
                  <th scope="col">RR</th>
                  <th scope="col">SBP</th>
                  <th scope="col">Temp</th>
                  <th scope="col">Review Score</th>
                  <th scope="col">Clinical Notes</th>
                </tr>
              </thead>
              <tbody>
                {patient.observation_history.map((obs, idx) => (
                  <tr key={idx}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} color="#64748b" />
                        {formatDateTime(obs.timestamp)}
                      </span>
                    </td>
                    <td>{obs.vital_signs.oxygen_saturation}%</td>
                    <td>{obs.vital_signs.heart_rate}</td>
                    <td>{obs.vital_signs.respiratory_rate}</td>
                    <td>{obs.vital_signs.systolic_blood_pressure}</td>
                    <td>{obs.vital_signs.body_temperature}°C</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {Math.round(obs.demonstration_score * 100)}%
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "#475569" }}>
                      {obs.notes || "Routine synthetic telemetry log."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
