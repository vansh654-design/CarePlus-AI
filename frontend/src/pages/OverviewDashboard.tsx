import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import { DashboardSummary, PatientRecord, PatientSummary } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PatientDetailModal } from "../components/PatientDetailModal";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { formatDateTime } from "../utils/formatters";

export const OverviewDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [priorityQueue, setPriorityQueue] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashData, patientsData] = await Promise.all([
        apiService.getDashboard(),
        apiService.getPatients(undefined, undefined, "priority_desc"),
      ]);
      setDashboard(dashData);
      // Top 5 priority patients for the review queue
      setPriorityQueue(patientsData.slice(0, 5));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch dashboard metrics from the CarePulse AI backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenPatient = async (patientId: string) => {
    try {
      const detail = await apiService.getPatientDetails(patientId);
      setSelectedPatient(detail);
    } catch (err: unknown) {
      alert("Unable to fetch patient observation details.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem 1rem", textAlign: "center" }} role="status">
        <RefreshCw size={32} className="spinning" style={{ margin: "0 auto 1rem auto", color: "#0284c7" }} />
        <h2 style={{ fontSize: "1.25rem", color: "#0f172a" }}>Loading CarePulse AI Dashboard...</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Retrieving synthetic patient telemetry and cohort metrics from backend
        </p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="alert-box alert-danger" role="alert" style={{ margin: "2rem 0" }}>
        <AlertCircle size={22} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "1rem" }}>Backend Communication Error</strong>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem" }}>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            style={{ marginTop: "0.75rem", fontSize: "0.8125rem" }}
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">
              <Activity size={26} color="#0284c7" aria-hidden="true" />
              Patient Monitoring Overview
            </h1>
            <p className="page-description">
              Real-time synthetic telemetry aggregation, demonstration review priorities, and cohort vitals.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={fetchDashboardData} className="btn btn-secondary" aria-label="Refresh dashboard data">
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/assessment" className="btn btn-primary">
              Run New Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section aria-label="Cohort Summary Metrics" className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <Users size={16} color="#0284c7" aria-hidden="true" />
            Total Monitored Cohort
          </div>
          <div className="kpi-value">{dashboard.total_patients}</div>
          <div className="kpi-subtext">Synthetic patient records active</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: "4px solid #dc2626" }}>
          <div className="kpi-label" style={{ color: "#991b1b" }}>
            <AlertCircle size={16} color="#dc2626" aria-hidden="true" />
            Higher Review Priority
          </div>
          <div className="kpi-value" style={{ color: "#dc2626" }}>
            {dashboard.higher_priority_count}
          </div>
          <div className="kpi-subtext">Estimated score &ge; 70%</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="kpi-label" style={{ color: "#92400e" }}>
            <AlertTriangle size={16} color="#d97706" aria-hidden="true" />
            Review Suggested
          </div>
          <div className="kpi-value" style={{ color: "#d97706" }}>
            {dashboard.review_suggested_count}
          </div>
          <div className="kpi-subtext">Score between 35% and 69%</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: "4px solid #059669" }}>
          <div className="kpi-label" style={{ color: "#065f46" }}>
            <CheckCircle size={16} color="#059669" aria-hidden="true" />
            Routine Review
          </div>
          <div className="kpi-value" style={{ color: "#059669" }}>
            {dashboard.routine_count}
          </div>
          <div className="kpi-subtext">Score &lt; 35% (Baseline stable)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <ShieldAlert size={16} color="#6366f1" aria-hidden="true" />
            Active Threshold Flags
          </div>
          <div className="kpi-value">{dashboard.active_alerts_count}</div>
          <div className="kpi-subtext">Illustrative rule triggers</div>
        </div>
      </section>

      {/* Cohort Average Vitals Strip */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h2 className="card-title">
            <Heart size={18} color="#ef4444" aria-hidden="true" />
            Cohort Average Vital Signs
          </h2>
          <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
            Calculated across {dashboard.total_patients} synthetic beds
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Avg SpO2</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {dashboard.average_vitals.oxygen_saturation}%
            </div>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Avg Heart Rate</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {dashboard.average_vitals.heart_rate} bpm
            </div>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Avg Resp Rate</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {dashboard.average_vitals.respiratory_rate} /min
            </div>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Avg Systolic BP</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {dashboard.average_vitals.systolic_blood_pressure} mmHg
            </div>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>Avg Temp</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {dashboard.average_vitals.body_temperature}°C
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Priority Review Queue & Recent Synthetic Events */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Synthetic Patient Review Queue */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <AlertTriangle size={18} color="#d97706" aria-hidden="true" />
              Demonstration Review Queue
            </h2>
            <Link
              to="/patients"
              style={{ fontSize: "0.8125rem", color: "#0284c7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              View all ({dashboard.total_patients}) <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {priorityQueue.map((pt) => (
              <div
                key={pt.id}
                onClick={() => handleOpenPatient(pt.id)}
                style={{
                  padding: "0.85rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "border-color 0.15s ease",
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenPatient(pt.id);
                  }
                }}
                aria-label={`View patient details for ${pt.id}`}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{pt.id}</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({pt.unit})</span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#475569", marginTop: "0.2rem" }}>
                    SpO2: {pt.current_vital_signs.oxygen_saturation}% • HR: {pt.current_vital_signs.heart_rate} bpm • BP: {pt.current_vital_signs.systolic_blood_pressure}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <StatusBadge category={pt.demonstration_category} />
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginTop: "0.25rem" }}>
                    Priority: {Math.round(pt.review_priority_score * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Synthetic Activity Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Clock size={18} color="#0284c7" aria-hidden="true" />
              Recent Synthetic Activity Log
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Deterministic Simulation</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {dashboard.recent_events.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: "0.75rem",
                  borderLeft: "3px solid #0284c7",
                  backgroundColor: "#f8fafc",
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#0f172a" }}>
                    {ev.patient_id} • {ev.event_type}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {formatDateTime(ev.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#475569", margin: 0 }}>
                  {ev.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
};
